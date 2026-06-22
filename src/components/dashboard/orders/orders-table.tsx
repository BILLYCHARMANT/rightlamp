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
  onToggleAll: (ids: string[]) => void;
  onView: (order: OrderRow) => void;
  onEdit: (order: OrderRow) => void;
  onCancel: (order: OrderRow) => void;
  onProgressChange: (
    orderId: string,
    field: OrderProgressField,
    value: boolean,
  ) => void;
};

export function OrdersTable({
  rows,
  selected,
  pendingProgress = null,
  pendingCancel = null,
  onToggle,
  onToggleAll,
  onView,
  onEdit,
  onCancel,
  onProgressChange,
}: Props) {
  const allIds = rows.map((o) => o.id);
  const allSelected =
    rows.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = rows.some((o) => selected.has(o.id));

  return (
    <table className="dash-data-table dash-data-table--flush w-full min-w-[880px] text-left text-sm">
      <thead>
        <tr>
          <th className="w-10 px-3 py-3 text-center">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected;
              }}
              onChange={() => onToggleAll(allIds)}
              className="rounded border-slate-300 text-brand accent-brand focus:ring-brand/30"
              aria-label="Select all orders on this page"
            />
          </th>
          <th className="px-3 py-3">Order no.</th>
          <th className="px-3 py-3">Customer</th>
          <th className="px-3 py-3">Status</th>
          <th className="px-3 py-3 text-center">Pack</th>
          <th className="px-3 py-3 text-center">Fulfill</th>
          <th className="px-3 py-3 text-center">Paid</th>
          <th className="px-3 py-3 text-right">Total</th>
          <th className="hidden px-3 py-3 sm:table-cell">Created</th>
          <th className="hidden px-3 py-3 md:table-cell">Updated</th>
          <th className="px-3 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((order) => {
          const progress = getOrderProgress(order);
          const isSelected = selected.has(order.id);
          const progressBusy = pendingProgress === order.id;
          const cancelBusy = pendingCancel === order.id;
          const progressDisabled =
            progressBusy || order.status === "CANCELLED";
          const actionDisabled = progressBusy || cancelBusy;

          return (
            <tr
              key={order.id}
              className={isSelected ? "is-selected" : ""}
            >
              <td
                className="px-3 py-3 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(order.id)}
                  className="rounded border-slate-300 text-brand accent-brand focus:ring-brand/30"
                  aria-label={`Select order ${order.id}`}
                />
              </td>
              <td className="px-3 py-3 font-bold text-brand">{order.id}</td>
              <td className="px-3 py-3">
                <p className="font-semibold leading-none text-ink">
                  {order.customer}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {order.channel}
                  {order.branchName ? ` · ${order.branchName}` : ""}
                </p>
                {order.branchLocation ? (
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {order.branchLocation}
                  </p>
                ) : null}
              </td>
              <td className="px-3 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td
                className="px-3 py-3 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <OrdersProgressCheck
                  checked={progress.packed}
                  label="Packed"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "packed", v)}
                />
              </td>
              <td
                className="px-3 py-3 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <OrdersProgressCheck
                  checked={progress.fulfilled}
                  label="Fulfilled"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "fulfilled", v)}
                />
              </td>
              <td
                className="px-3 py-3 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <OrdersProgressCheck
                  checked={progress.paid}
                  label="Paid"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "paid", v)}
                />
              </td>
              <td className="px-3 py-3 text-right font-bold tabular-nums text-ink">
                {formatMoneyFromCents(order.totalCents, order.currency)}
              </td>
              <td className="hidden px-3 py-3 text-xs text-muted-foreground sm:table-cell">
                {formatOrderDateShort(order.placedAt)}
              </td>
              <td className="hidden px-3 py-3 text-xs text-muted-foreground md:table-cell">
                {formatOrderDateShort(orderUpdatedAt(order))}
              </td>
              <td
                className="px-3 py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <DashboardTableRowActions
                  disabled={actionDisabled}
                  onView={() => onView(order)}
                  onEdit={() => onEdit(order)}
                  onDelete={() => onCancel(order)}
                  showEdit={order.status !== "CANCELLED"}
                  showDelete={order.status !== "CANCELLED"}
                  deleteLabel="Cancel"
                />
              </td>
            </tr>
          );
        })}
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={11}
              className="px-6 py-12 text-center text-sm text-muted-foreground"
            >
              No orders match these filters.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
