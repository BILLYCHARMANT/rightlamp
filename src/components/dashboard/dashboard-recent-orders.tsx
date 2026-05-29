"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DEMO_ORDERS,
  type DemoOrder,
} from "@/lib/dashboard/demo-data";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

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

function sortedRecent(rows: DemoOrder[], take: number) {
  return [...rows]
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
    .slice(0, take);
}

export function DashboardRecentOrdersPanel({
  orders = DEMO_ORDERS,
  previewCount = 6,
}: {
  orders?: DemoOrder[];
  previewCount?: number;
}) {
  const rows = sortedRecent(orders, previewCount);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm shadow-ink/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-6">
        <div>
          <h2 className="text-base font-bold text-ink">Recent orders</h2>
          <p className="text-xs text-muted-foreground">
            Latest activity — demo data until checkout is wired.
          </p>
        </div>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-muted"
        >
          View all
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold md:px-6">Reference</th>
              <th className="px-4 py-3 font-semibold md:px-6">Customer</th>
              <th className="px-4 py-3 font-semibold md:px-6">Lines</th>
              <th className="px-4 py-3 font-semibold md:px-6">Total</th>
              <th className="px-4 py-3 font-semibold md:px-6">Status</th>
              <th className="px-4 py-3 font-semibold md:px-6">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((o) => (
              <tr key={o.id} className="bg-surface-elevated/60 hover:bg-surface-elevated">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-accent md:px-6">
                  {o.id}
                </td>
                <td className="px-4 py-3 md:px-6">
                  <div className="font-medium text-ink">{o.customer}</div>
                  <div className="text-xs text-muted-foreground">{o.channel}</div>
                </td>
                <td className="max-w-[220px] px-4 py-3 text-muted-foreground md:px-6">
                  <span className="line-clamp-2">{o.lineSummary}</span>
                </td>
                <td className="px-4 py-3 font-semibold tabular-nums text-ink md:px-6">
                  {formatMoneyFromCents(o.totalCents, o.currency)}
                </td>
                <td className="px-4 py-3 md:px-6">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground md:px-6">
                  {formatWhen(o.placedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
