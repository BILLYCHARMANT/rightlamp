import { DashboardAdminPlaceholder } from "@/components/dashboard/dashboard-admin-placeholder";

export default function DashboardCreateReportPage() {
  return (
    <DashboardAdminPlaceholder
      primaryHref="/dashboard/reports/new"
      productionPath="/admin/createReport"
      description="Author a new operational report (`/api/report` POST patterns on production)."
    />
  );
}
