"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { OrderRow } from "@/lib/dashboard/order-types";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-panel";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
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

export function DashboardRecentOrdersPanel({
  orders = [],
  previewCount = 6,
}: {
  orders?: OrderRow[];
  previewCount?: number;
}) {
  const rows = sortedRecent(orders, previewCount);

  return (
    <DashboardPanel
      title="Recent orders"
      description="Latest sales in the queue"
      gradient="cool"
      noPadding
      action={
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
        >
          View all
          <ArrowRight size={14} aria-hidden />
        </Link>
      }
    >
      <div className="overflow-x-auto">
        <table className="dash-data-table dash-data-table--flush w-full min-w-[640px] text-sm">
          <thead>
            <tr>
              <th className="px-5 py-3 font-semibold">Ref</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">When</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="px-5 py-3 font-mono text-xs font-semibold text-accent">
                  {o.id}
                </td>
                <td className="px-5 py-3">
                  <div className="font-medium text-ink">{o.customer}</div>
                  <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                    {o.lineSummary}
                  </div>
                </td>
                <td className="px-5 py-3 font-semibold tabular-nums">
                  {formatMoneyFromCents(o.totalCents, o.currency)}
                </td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatWhen(o.placedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}
