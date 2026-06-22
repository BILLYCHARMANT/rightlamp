import { OrdersDashboard } from "@/components/dashboard/orders-dashboard";
import { getOrderViewerScope } from "@/lib/dashboard/order-access";
import { getStaffOrderFormContext } from "@/lib/dashboard/order-branches";
import { getOrderableProducts } from "@/lib/dashboard/order-actions";
import { getOrdersOverviewPayload } from "@/lib/dashboard/orders-overview";

function ordersSyncKey(
  orders: Awaited<ReturnType<typeof getOrdersOverviewPayload>>["orders"],
) {
  return orders.map((order) => `${order.id}:${order.updatedAt}`).join("|");
}

export default async function DashboardOrdersPage() {
  const scope = await getOrderViewerScope();

  const [data, orderableProducts, orderFormContext] = await Promise.all([
    getOrdersOverviewPayload(scope),
    getOrderableProducts(),
    getStaffOrderFormContext(scope),
  ]);

  return (
    <OrdersDashboard
      key={ordersSyncKey(data.orders)}
      data={data}
      orderableProducts={orderableProducts}
      orderFormContext={orderFormContext}
    />
  );
}
