"use client";

import type { OrderRow } from "@/lib/dashboard/order-types";
import type { OrderProgressField } from "@/lib/dashboard/order-actions";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { OrdersProgressCheck } from "@/components/dashboard/orders/orders-progress-check";
import {
  formatOrderDateShort,
  getOrderProgress,
  orderUpdatedAt,
} from "@/components/dashboard/orders/orders-utils";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";

type Props = {
  rows: OrderRow[];
  selected: Set<string>;
  pendingProgress?: string | null;
  pendingCancel?: string | null;
  onToggle: (id: string) => void;
  onView: (order: OrderRow) => void;
  onEdit: (order: OrderRow) => void;
  onCancel: (order: OrderRow) => void;
  onProgressChange: (
    orderId: string,
    field: OrderProgressField,
    value: boolean,
  ) => void;
};

export function OrdersCards({
  rows,
  selected,
  pendingProgress = null,
  pendingCancel = null,
  onToggle,
  onView,
  onEdit,
  onCancel,
  onProgressChange,
}: Props) {
  if (!rows.length) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        No orders match these filters.
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((order) => {
        const progress = getOrderProgress(order);
        const isSelected = selected.has(order.id);
        const progressBusy = pendingProgress === order.id;
        const cancelBusy = pendingCancel === order.id;
        const progressDisabled = progressBusy || order.status === "CANCELLED";
        const actionDisabled = progressBusy || cancelBusy;

        return (
          <article
            key={order.id}
            className={`flex flex-col rounded-sm border bg-white p-4 shadow-sm transition ${
              isSelected
                ? "border-brand/40 ring-1 ring-brand/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(order.id)}
                  className="mt-1 rounded border-slate-300 text-brand accent-brand focus:ring-brand/30"
                  aria-label={`Select order ${order.id}`}
                />
                <div className="min-w-0">
                  <p className="font-mono text-sm font-bold text-brand">{order.id}</p>
                  <p className="mt-1 truncate font-semibold text-ink">{order.customer}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {order.channel}
                    {order.branchName ? ` · ${order.branchName}` : ""}
                  </p>
                </div>
              </label>
              <OrderStatusBadge status={order.status} />
            </div>

            <p
              className="mt-3 line-clamp-2 text-sm text-muted-foreground"
              title={order.lineSummary}
            >
              {order.lineSummary}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
              <label className="inline-flex items-center gap-2 text-xs text-ink">
                <OrdersProgressCheck
                  checked={progress.packed}
                  label="Packed"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "packed", v)}
                />
                Pack
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-ink">
                <OrdersProgressCheck
                  checked={progress.fulfilled}
                  label="Fulfilled"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "fulfilled", v)}
                />
                Fulfill
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-ink">
                <OrdersProgressCheck
                  checked={progress.paid}
                  label="Paid"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "paid", v)}
                />
                Paid
              </label>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Total
                </p>
                <p className="text-lg font-bold tabular-nums text-ink">
                  {formatMoneyFromCents(order.totalCents, order.currency)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatOrderDateShort(order.placedAt)}
                  <span className="mx-1">·</span>
                  Updated {formatOrderDateShort(orderUpdatedAt(order))}
                </p>
              </div>
              <DashboardTableRowActions
                variant="segmented"
                disabled={actionDisabled}
                onView={() => onView(order)}
                onEdit={() => onEdit(order)}
                onDelete={() => onCancel(order)}
                showEdit={order.status !== "CANCELLED"}
                showDelete={order.status !== "CANCELLED"}
                deleteLabel="Cancel"
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
