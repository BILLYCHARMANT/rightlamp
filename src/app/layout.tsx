import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/company/brand-assets";
import { company } from "@/lib/company/site-content";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: company.shortName,
    template: `%s · ${company.shortName}`,
  },
  description: `${company.name} — ${company.tagline}. Electrical contracting, renewable energy, and an online shop for lighting and electrical products in Rwanda.`,
  icons: {
    icon: BRAND_LOGO,
    apple: BRAND_LOGO,
  },
  openGraph: {
    title: company.name,
    description: company.tagline,
    images: [{ url: BRAND_LOGO, alt: BRAND_LOGO_ALT }],
  },
};

/** Pearl light UI only — avoid UA “dark” presentation tinting the whole page. */
export const viewport = {
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
