import { DashboardNavProvider } from "@/components/dashboard/dashboard-nav-context";
import { DashboardRecentTracker } from "@/components/dashboard/dashboard-recent-tracker";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardShellHeader } from "@/components/dashboard/dashboard-shell-header";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardNavProvider>
      <div className="relative min-h-dvh w-full bg-canvas text-ink">
        <div
          className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_95%_55%_at_50%_-12%,rgba(197,83,22,0.085),transparent_58%),radial-gradient(ellipse_70%_45%_at_100%_0%,rgba(0,191,255,0.05),transparent_55%)]"
          aria-hidden
        />
        <DashboardRecentTracker />
        <DashboardSidebar />
        <div className="relative flex min-h-dvh flex-col md:pl-56">
          <DashboardShellHeader />
          <div className="flex-1 overflow-x-hidden overflow-y-auto">{children}</div>
        </div>
      </div>
    </DashboardNavProvider>
  );
}
