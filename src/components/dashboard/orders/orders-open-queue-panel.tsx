"use client";

import type { DemoOrder } from "@/lib/dashboard/demo-data";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-panel";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { formatOrderWhen } from "@/components/dashboard/orders/orders-utils";

type Props = {
  orders: DemoOrder[];
  onSelect: (order: DemoOrder) => void;
};

export function OrdersOpenQueuePanel({ orders, onSelect }: Props) {
  return (
    <DashboardPanel
      title="Open queue"
      description="Pending and processing — needs action"
      gradient="warm"
      noPadding
      action={
        <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-xs font-bold tabular-nums text-brand">
          {orders.length}
        </span>
      }
    >
      {orders.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {orders.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => onSelect(order)}
                className="flex w-full items-start justify-between gap-3 px-5 py-3.5 text-left transition hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-accent">
                    {order.id}
                  </p>
                  <p className="truncate text-sm font-medium text-ink">
                    {order.customer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.channel} · {formatOrderWhen(order.placedAt)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-ink">
                    {formatMoneyFromCents(order.totalCents, order.currency)}
                  </p>
                  <div className="mt-1 flex justify-end">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No open orders in the queue.
        </p>
      )}
    </DashboardPanel>
  );
}
