import { StockManagement } from "@/components/dashboard/stock-management";
import { getStockManagementPayload } from "@/lib/dashboard/stock-overview";

export default async function DashboardStockPage() {
  const payload = await getStockManagementPayload();

  return (
    <div className="h-full min-h-0">
      <div className="p-4 md:p-8">
        <StockManagement {...payload} />
      </div>
    </div>
  );
}
