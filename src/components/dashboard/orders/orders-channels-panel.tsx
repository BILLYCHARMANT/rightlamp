"use client";

import type { OrdersChannelSlice } from "@/lib/dashboard/orders-overview";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-panel";

export function OrdersChannelsPanel({
  channels,
}: {
  channels: OrdersChannelSlice[];
}) {
  const max = Math.max(...channels.map((c) => c.revenueCents), 1);
  const top = channels.slice(0, 6);

  return (
    <DashboardPanel
      title="Sales by channel"
      description="Revenue from non-cancelled orders"
      gradient="cool"
    >
      {top.length > 0 ? (
        <ul className="space-y-3">
          {top.map((row) => {
            const pct = Math.max(8, Math.round((row.revenueCents / max) * 100));
            return (
              <li key={row.channel}>
                <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-ink">{row.channel}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {formatMoneyFromCents(row.revenueCents, DEFAULT_CURRENCY)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                    {row.orderCount} orders
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No channel data yet.</p>
      )}
    </DashboardPanel>
  );
}
