import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PV-GRID",
    template: "%s · PV-GRID",
  },
  description:
    "PV-GRID — electrical contracting, renewable energy, and an online shop for lighting and electrical products in Rwanda.",
};

/** Pearl light UI only — avoid UA “dark” presentation tinting the whole page. */
export const viewport = {
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
