import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { PortfolioPageContent } from "@/components/store/portfolio/PortfolioPageContent";
import { company } from "@/lib/company/site-content";

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
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: `${company.shortName} portfolio — commercial, residential, industrial, shop, and solar electrical projects across Rwanda.`,
};

export default function PortfolioPage() {
  return (
    <main
      className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} flex-1 [--stitch-green:#10B981] [--stitch-primary:#c55316] [--stitch-yellow:#FAB40D]`}
    >
      <PortfolioPageContent />
    </main>
  );
}
