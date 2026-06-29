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

export function OrderRequestDocumentsCards({
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
    <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map((order) => {
        const details = order.requestDetails!;
        const attachments = details.attachments?.length ?? 0;
        const applicantType =
          details.applicantType === "company" ? "Company" : "Individual";

        return (
          <article
            key={order.id}
            className="flex flex-col rounded-sm border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-accent">{order.id}</p>
                <p className="mt-1 truncate font-semibold text-ink">
                  {resolveRequestApplicantLabel(details)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {applicantType}
                  {details.purchaseOrderNumber
                    ? ` · PO ${details.purchaseOrderNumber}`
                    : ""}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <p
              className="mt-3 line-clamp-2 text-sm text-ink"
              title={order.lineSummary}
            >
              {order.lineSummary}
            </p>
            {details.productCategory ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {details.productCategory}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span
                className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-0.5 font-medium text-slate-700"
                title={formatOrderWhen(order.placedAt)}
              >
                <Paperclip size={12} aria-hidden />
                {attachments} file{attachments === 1 ? "" : "s"}
              </span>
              <span>{formatOrderDateShort(order.placedAt)}</span>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
              <p className="text-lg font-bold tabular-nums text-ink">
                {formatMoneyFromCents(order.totalCents, order.currency)}
              </p>
              <div className="flex flex-wrap justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => onViewDocument(order)}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-brand px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
                >
                  <FileText size={13} aria-hidden />
                  View form
                </button>
                <button
                  type="button"
                  onClick={() => onViewOrder(order)}
                  className="rounded-sm border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:bg-slate-50"
                >
                  Order
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
