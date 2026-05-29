import { DashboardAdminPlaceholder } from "@/components/dashboard/dashboard-admin-placeholder";

export default function DashboardExpensesPage() {
  return (
    <DashboardAdminPlaceholder
      primaryHref="/dashboard/expenses"
      productionPath="/admin/expenses"
      description="Expense tracking and vendor spend — aligned with production `/api/expense` routes."
    />
  );
}
