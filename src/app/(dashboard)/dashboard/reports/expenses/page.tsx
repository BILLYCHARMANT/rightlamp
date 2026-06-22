import { ExpensesDashboard } from "@/components/dashboard/expenses-dashboard";
import { listExpenses } from "@/lib/dashboard/operations-queries";

export default async function DashboardReportsExpensesPage() {
  const expenses = await listExpenses();
  return <ExpensesDashboard expenses={expenses} />;
}
