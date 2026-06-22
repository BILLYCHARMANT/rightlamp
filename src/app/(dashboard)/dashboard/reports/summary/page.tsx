import { ReportSummaryDashboard } from "@/components/dashboard/report-summary-dashboard";
import {
  getOperationsSummary,
  listReports,
} from "@/lib/dashboard/operations-queries";
import { fetchReportSummary } from "@/lib/rightlamps/server-api";

export default async function DashboardReportSummaryPage() {
  const [summary, reports, productionSummary] = await Promise.all([
    getOperationsSummary(),
    listReports(),
    fetchReportSummary(),
  ]);

  return (
    <ReportSummaryDashboard
      summary={summary}
      reports={reports}
      productionSummary={productionSummary}
    />
  );
}
