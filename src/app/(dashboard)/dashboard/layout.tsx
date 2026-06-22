import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { DashboardAccessGuard } from "@/components/dashboard/dashboard-access-guard";
import { DashboardNavProvider } from "@/components/dashboard/dashboard-nav-context";
import { DashboardRecentTracker } from "@/components/dashboard/dashboard-recent-tracker";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardShellHeader } from "@/components/dashboard/dashboard-shell-header";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500"],
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardNavProvider>
      <div
        className={`${hanken.variable} ${jetbrains.variable} relative min-h-dvh w-full font-[family-name:var(--font-inter)] text-ink`}
      >
        <DashboardAccessGuard>
          <DashboardRecentTracker />
          <DashboardSidebar />
          <div className="relative flex min-h-dvh flex-col md:pl-64">
            <DashboardShellHeader />
            <main className="dash-blueprint-bg flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
              <div className="mx-auto w-full max-w-[1440px]">{children}</div>
            </main>
          </div>
        </DashboardAccessGuard>
      </div>
    </DashboardNavProvider>
  );
}
