import { StockManagement } from "@/components/dashboard/stock-management";
import { listProductCategories } from "@/lib/dashboard/category-actions";
import { getStockManagementPayload } from "@/lib/dashboard/stock-overview";

export default async function DashboardStockPage() {
  const [payload, categories] = await Promise.all([
    getStockManagementPayload(),
    listProductCategories(),
  ]);

  return (
    <div className="h-full min-h-0">
      <div className="p-4 md:p-8">
        <StockManagement {...payload} categories={categories} />
      </div>
    </div>
  );
}
