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

const thClass =
  "px-2 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500";
const tdClass = "px-2 py-2.5 align-middle";

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
    <table className="dash-data-table dash-data-table--flush w-full table-fixed text-left text-sm">
      <colgroup>
        <col className="w-9" />
        <col className="w-[4.5rem]" />
        <col />
        <col className="w-[5.5rem]" />
        <col className="w-10" />
        <col className="w-10" />
        <col className="w-10" />
        <col className="w-[5.5rem]" />
        <col className="hidden w-[4.5rem] sm:table-column" />
        <col className="hidden w-[4.5rem] xl:table-column" />
        <col className="w-[5.5rem]" />
      </colgroup>
      <thead>
        <tr>
          <th className={`${thClass} text-center`}>
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
          <th className={thClass}>Order</th>
          <th className={thClass}>Customer</th>
          <th className={thClass}>Status</th>
          <th className={`${thClass} text-center`}>Pack</th>
          <th className={`${thClass} text-center`}>Fulfill</th>
          <th className={`${thClass} text-center`}>Paid</th>
          <th className={`${thClass} text-right`}>Total</th>
          <th className={`${thClass} hidden sm:table-cell`}>Created</th>
          <th className={`${thClass} hidden xl:table-cell`}>Updated</th>
          <th className={`${thClass} text-right`}>Actions</th>
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
                className={`${tdClass} text-center`}
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
              <td className={`${tdClass} font-mono text-xs font-bold text-brand`}>
                {order.id}
              </td>
              <td className={tdClass}>
                <p
                  className="truncate font-semibold leading-tight text-ink"
                  title={order.customer}
                >
                  {order.customer}
                </p>
                <p
                  className="mt-0.5 truncate text-[10px] text-muted-foreground"
                  title={`${order.channel}${order.branchName ? ` · ${order.branchName}` : ""}`}
                >
                  {order.channel}
                  {order.branchName ? ` · ${order.branchName}` : ""}
                </p>
              </td>
              <td className={tdClass}>
                <OrderStatusBadge status={order.status} />
              </td>
              <td
                className={`${tdClass} text-center`}
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
                className={`${tdClass} text-center`}
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
                className={`${tdClass} text-center`}
                onClick={(e) => e.stopPropagation()}
              >
                <OrdersProgressCheck
                  checked={progress.paid}
                  label="Paid"
                  disabled={progressDisabled}
                  onChange={(v) => onProgressChange(order.id, "paid", v)}
                />
              </td>
              <td className={`${tdClass} text-right text-xs font-bold tabular-nums text-ink`}>
                {formatMoneyFromCents(order.totalCents, order.currency)}
              </td>
              <td className={`${tdClass} hidden text-[10px] text-muted-foreground sm:table-cell`}>
                {formatOrderDateShort(order.placedAt)}
              </td>
              <td className={`${tdClass} hidden text-[10px] text-muted-foreground xl:table-cell`}>
                {formatOrderDateShort(orderUpdatedAt(order))}
              </td>
              <td
                className={`${tdClass} text-right`}
                onClick={(e) => e.stopPropagation()}
              >
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
