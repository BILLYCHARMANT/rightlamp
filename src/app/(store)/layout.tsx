import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreSiteHeader } from "@/components/store/StoreSiteHeader";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} flex min-h-dvh flex-col bg-[#fcf9f8] font-[family-name:var(--font-inter)] text-[#1c1b1b] [--stitch-green:#10B981] [--stitch-primary:#c55316] [--stitch-yellow:#FAB40D]`}
    >
      <StoreSiteHeader />
      <div className="flex min-h-0 w-full flex-1 flex-col">{children}</div>
      <StoreFooter />
    </div>
  );
}
