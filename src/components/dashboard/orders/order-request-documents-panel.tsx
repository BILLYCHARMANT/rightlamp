"use client";

import { FileText, Paperclip } from "lucide-react";
import type { OrderRow } from "@/lib/dashboard/order-types";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import {
  formatOrderDateShort,
  formatOrderWhen,
} from "@/components/dashboard/orders/orders-utils";
import { resolveRequestApplicantLabel } from "@/lib/orders/order-request-details";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

type Props = {
  rows: OrderRow[];
  onViewDocument: (order: OrderRow) => void;
  onViewOrder: (order: OrderRow) => void;
};

export function OrderRequestDocumentsPanel({
  rows,
  onViewDocument,
  onViewOrder,
}: Props) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <FileText size={40} className="text-slate-300" aria-hidden />
        <p className="text-sm font-semibold text-ink">No order request forms yet</p>
        <p className="max-w-md text-sm text-muted-foreground">
          When customers submit the product order request form on the website,
          their documents will appear here linked to the corresponding order.
        </p>
      </div>
    );
  }

  return (
    <table className="dash-data-table dash-data-table--flush w-full table-fixed text-left text-sm">
      <colgroup>
        <col className="w-[4.5rem]" />
        <col className="w-[18%]" />
        <col />
        <col className="w-12" />
        <col className="w-[5.5rem]" />
        <col className="hidden w-[4.5rem] sm:table-column" />
        <col className="w-[5.5rem]" />
        <col className="w-[8.5rem]" />
      </colgroup>
      <thead>
        <tr>
          <th className="px-3 py-3">Order no.</th>
          <th className="px-3 py-3">Applicant</th>
          <th className="px-3 py-3">Products</th>
          <th className="px-3 py-3 text-center">Files</th>
          <th className="px-3 py-3">Status</th>
          <th className="hidden px-3 py-3 sm:table-cell">Submitted</th>
          <th className="px-3 py-3 text-right">Total</th>
          <th className="px-3 py-3 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((order) => {
          const details = order.requestDetails!;
          const attachments = details.attachments?.length ?? 0;
          const applicantType =
            details.applicantType === "company" ? "Company" : "Individual";

          return (
            <tr key={order.id}>
              <td className="px-3 py-3 font-mono text-xs font-semibold text-accent">
                {order.id}
              </td>
              <td className="px-3 py-3">
                <div className="font-medium text-ink">
                  {resolveRequestApplicantLabel(details)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {applicantType}
                  {details.purchaseOrderNumber
                    ? ` · PO ${details.purchaseOrderNumber}`
                    : ""}
                </div>
              </td>
              <td className="max-w-[220px] px-3 py-3">
                <p className="truncate text-ink" title={order.lineSummary}>
                  {order.lineSummary}
                </p>
                {details.productCategory ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {details.productCategory}
                  </p>
                ) : null}
              </td>
              <td className="px-3 py-3 text-center">
                <span className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  <Paperclip size={12} aria-hidden />
                  {attachments}
                </span>
              </td>
              <td className="px-3 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="hidden px-3 py-3 text-muted-foreground sm:table-cell">
                <span title={formatOrderWhen(order.placedAt)}>
                  {formatOrderDateShort(order.placedAt)}
                </span>
              </td>
              <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">
                {formatMoneyFromCents(order.totalCents, order.currency)}
              </td>
              <td className="px-2 py-2.5 text-right">
                <div className="inline-flex flex-nowrap items-stretch justify-end overflow-hidden rounded-md border border-slate-200/90 bg-slate-100/80">
                  <button
                    type="button"
                    onClick={() => onViewDocument(order)}
                    className="inline-flex h-7 shrink-0 items-center gap-1 border-r border-slate-200/90 px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-white hover:text-brand"
                    title="View form"
                  >
                    <FileText size={12} aria-hidden />
                    Form
                  </button>
                  <button
                    type="button"
                    onClick={() => onViewOrder(order)}
                    className="inline-flex h-7 shrink-0 items-center px-2 text-[10px] font-semibold text-slate-600 transition hover:bg-white hover:text-brand"
                    title="View order"
                  >
                    Order
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
