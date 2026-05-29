import { DashboardAdminPlaceholder } from "@/components/dashboard/dashboard-admin-placeholder";

export default function DashboardMonthlyPage() {
  return (
    <DashboardAdminPlaceholder
      primaryHref="/dashboard/monthly"
      productionPath="/admin/monthly"
      description="Monthly rollups (often paired with `/api/expense/month` on the live site)."
    />
  );
}
