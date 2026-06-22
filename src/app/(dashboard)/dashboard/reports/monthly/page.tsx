import { MonthlyDashboard } from "@/components/dashboard/monthly-dashboard";
import { getMonthlyRollups } from "@/lib/dashboard/operations-queries";

export default async function DashboardReportsMonthlyPage() {
  const rollups = await getMonthlyRollups(6);
  return <MonthlyDashboard rollups={rollups} />;
}
