import type { OrderRow } from "@/lib/dashboard/order-types";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import {
  DashboardEcomCard,
  DashboardEcomPanelHeader,
  DashboardEcomViewAll,
} from "@/components/dashboard/ui/dashboard-ecom";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function sortedRecent(rows: OrderRow[], take: number) {
  return [...rows]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, take);
}

export function DashboardHomeRecentOrders({
  orders,
  previewCount = 6,
}: {
  orders: OrderRow[];
  previewCount?: number;
}) {
  const rows = sortedRecent(orders, previewCount);

  return (
    <DashboardEcomCard className="flex h-full flex-col">
      <DashboardEcomPanelHeader title="Recent orders" />
      <div className="flex-1 overflow-x-auto px-2 pb-2">
        <table className="dash-data-table dash-data-table--flush w-full min-w-[420px] text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2.5">Order</th>
              <th className="px-3 py-2.5">Customer</th>
              <th className="px-3 py-2.5">Date</th>
              <th className="px-3 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-3 font-mono text-xs font-semibold text-accent">
                  #{o.id.replace(/^ord-?/i, "")}
                </td>
                <td className="max-w-[9rem] truncate px-3 py-3 font-medium text-ink">
                  {o.customer}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {formatDate(o.placedAt)}
                </td>
                <td className="px-3 py-3 text-right font-semibold tabular-nums">
                  {formatMoneyFromCents(o.totalCents, o.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DashboardEcomViewAll href="/dashboard/orders" />
    </DashboardEcomCard>
  );
}
