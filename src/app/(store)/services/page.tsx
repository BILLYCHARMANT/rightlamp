import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { ServicesPageContent } from "@/components/store/services/ServicesPageContent";
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
  title: "Services",
  description: `${company.shortName} — electrical installation, maintenance, biogas, solar, retail appliances, and renewable energy research in Rwanda.`,
};

export default function ServicesPage() {
  return (
    <main
      className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} flex-1 [--stitch-green:#10B981] [--stitch-primary:#c55316] [--stitch-yellow:#FAB40D]`}
    >
      <ServicesPageContent />
    </main>
  );
}
