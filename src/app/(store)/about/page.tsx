import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { AboutPageContent } from "@/components/store/about/AboutPageContent";
import { company } from "@/lib/company/site-content";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
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
  title: "About Us",
  description: `Learn about ${company.name} — clean energy solutions, leadership, and electrical engineering excellence across Rwanda.`,
};

export default function AboutPage() {
  return (
    <main
      className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} flex-1 bg-[#F8FAFC] [--stitch-green:#10B981] [--stitch-primary:#c55316] [--stitch-yellow:#FAB40D]`}
    >
      <AboutPageContent />
    </main>
  );
}
