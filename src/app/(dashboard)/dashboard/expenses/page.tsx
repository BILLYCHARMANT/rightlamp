import { redirect } from "next/navigation";

export default function DashboardExpensesPage() {
  redirect("/dashboard/reports/expenses");
}
