import { DashboardAdminPlaceholder } from "@/components/dashboard/dashboard-admin-placeholder";

export default function DashboardMyShopPage() {
  return (
    <DashboardAdminPlaceholder
      primaryHref="/dashboard/my-shop"
      productionPath="/admin/myshop"
      description="Shop/profile-facing inventory slice (`/api/products/myshop` on Rightlamps)."
    />
  );
}
