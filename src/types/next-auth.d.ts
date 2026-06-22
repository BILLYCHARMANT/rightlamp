import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import type { StaffRoleCode } from "@/lib/dashboard/rbac";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: StaffRoleCode;
    } & DefaultSession["user"];
  }

  interface User {
    role?: StaffRoleCode;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: StaffRoleCode;
  }
}
