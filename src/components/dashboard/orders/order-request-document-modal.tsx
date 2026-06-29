"use client";

import { Download, Printer } from "lucide-react";
import type { OrderRow } from "@/lib/dashboard/order-types";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import {
  OrderRequestDocument,
  printOrderRequestDocument,
} from "@/components/dashboard/orders/order-request-document";
import { resolveRequestApplicantLabel } from "@/lib/orders/order-request-details";

type Props = {
  order: OrderRow | null;
  onClose: () => void;
};

export function OrderRequestDocumentModal({ order, onClose }: Props) {
  if (!order?.requestDetails) return null;

  const details = order.requestDetails;
  const attachmentCount = details.attachments?.length ?? 0;

  return (
    <PodShellModal
      isOpen={Boolean(order)}
      title={`Order request · ${order.id}`}
      onClose={onClose}
      maxWidthClass="max-w-4xl"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => printOrderRequestDocument(order.id)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            <Printer size={16} aria-hidden />
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center rounded-sm border border-slate-200 bg-white py-2.5 text-sm font-semibold text-ink transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="order-request-document-shell space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <div>
            <p className="font-semibold text-ink">
              {resolveRequestApplicantLabel(details)}
            </p>
            <p className="text-muted-foreground">{order.lineSummary}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Download size={14} aria-hidden />
            {attachmentCount} attachment{attachmentCount === 1 ? "" : "s"}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Use <strong className="font-semibold text-ink">Print / Save as PDF</strong>{" "}
          and choose &quot;Save as PDF&quot; in your browser print dialog to
          download this form as a document file.
        </p>

        <OrderRequestDocument order={order} details={details} />
      </div>
    </PodShellModal>
  );
}
