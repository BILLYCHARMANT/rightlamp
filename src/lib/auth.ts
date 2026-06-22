import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { normalizeStaffRole, type StaffRoleCode } from "@/lib/dashboard/rbac";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: { equals: credentials.email.trim(), mode: "insensitive" },
          },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            active: true,
          },
        });

        if (!user?.passwordHash) return null;
        if (!user.active) return null;

        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name ?? user.email?.split("@")[0] ?? "User",
          email: user.email,
          role: normalizeStaffRole(user.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeStaffRole(user.role);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as StaffRoleCode;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
