import { DashboardAdminPlaceholder } from "@/components/dashboard/dashboard-admin-placeholder";

export default function DashboardReportSummaryPage() {
  return (
    <DashboardAdminPlaceholder
      primaryHref="/dashboard/reports/summary"
      productionPath="/admin/reportSummary"
      description="Condensed report totals (`/api/report/summary` on Rightlamps)."
    />
  );
}
