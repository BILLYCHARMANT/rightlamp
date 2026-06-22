import { Plus_Jakarta_Sans } from "next/font/google";
import "./dashboard-analytics.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-vivid-analytics",
  weight: ["400", "600", "700", "800"],
});

export default function DashboardHomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${plusJakarta.variable} dash-analytics -m-4 bg-[#f8fafc] font-[family-name:var(--font-vivid-analytics)] text-slate-800 md:-m-8`}
    >
      {children}
    </div>
  );
}
