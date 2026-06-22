import { ReportsTabs } from "@/components/dashboard/reports/reports-tabs";

export default function DashboardReportsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border bg-surface-elevated px-4 py-4 md:px-8">
        <ReportsTabs />
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
