import { DashboardAdminPlaceholder } from "@/components/dashboard/dashboard-admin-placeholder";

export default function DashboardSpecialsPage() {
  return (
    <DashboardAdminPlaceholder
      primaryHref="/dashboard/specials"
      productionPath="/admin/special"
      description="Special offers or curated SKUs (`/api/special` on production)."
    />
  );
}
