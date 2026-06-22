"use client";

import Image from "next/image";
import type { OrderRow } from "@/lib/dashboard/order-types";
import type { OrderProgressField } from "@/lib/dashboard/order-actions";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { OrdersProgressCheck } from "@/components/dashboard/orders/orders-progress-check";
import { formatOrderWhen } from "@/components/dashboard/orders/orders-utils";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

type Props = {
  order: OrderRow | null;
  onClose: () => void;
  onProgressChange?: (
    orderId: string,
    field: OrderProgressField,
    value: boolean,
  ) => void;
  progressDisabled?: boolean;
};

export function OrderDetailModal({
  order,
  onClose,
  onProgressChange,
  progressDisabled = false,
}: Props) {
  if (!order) return null;

  const disabled =
    progressDisabled || order.status === "CANCELLED" || !onProgressChange;

  return (
    <PodShellModal
      isOpen={Boolean(order)}
      title={order.id}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="w-full rounded-sm bg-brand py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          onClick={onClose}
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-base font-semibold text-ink">{order.customer}</p>
          <p className="text-sm text-muted-foreground">{order.channel}</p>
          {order.customerEmail ? (
            <p className="mt-1 text-sm text-ink">{order.customerEmail}</p>
          ) : null}
          {order.customerPhone ? (
            <p className="text-sm text-ink">{order.customerPhone}</p>
          ) : null}
          {order.customerAddress ? (
            <p className="text-sm text-muted-foreground">
              {order.customerAddress}
            </p>
          ) : null}
          {order.branchName ? (
            <p className="mt-2 text-sm text-ink">
              <span className="font-medium">Pickup location:</span>{" "}
              {order.branchName}
              {order.branchLocation ? ` — ${order.branchLocation}` : ""}
            </p>
          ) : null}
        </div>

        <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Fulfillment
          </p>
          <div className="mt-3 flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <OrdersProgressCheck
                checked={order.packed}
                label="Packed"
                disabled={disabled}
                onChange={(v) => onProgressChange?.(order.id, "packed", v)}
              />
              Pack
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <OrdersProgressCheck
                checked={order.fulfilled}
                label="Fulfilled"
                disabled={disabled}
                onChange={(v) => onProgressChange?.(order.id, "fulfilled", v)}
              />
              Fulfill
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-ink">
              <OrdersProgressCheck
                checked={order.paid}
                label="Paid"
                disabled={disabled}
                onChange={(v) => onProgressChange?.(order.id, "paid", v)}
              />
              Paid
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Status updates automatically when all three are checked.
          </p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Line items
          </p>
          <ul className="mt-3 space-y-3">
            {order.items.map((item, index) => {
              const lineTotal =
                item.unitPriceCents * item.quantity +
                item.accessories.reduce(
                  (sum, accessory) =>
                    sum + accessory.unitPriceCents * accessory.quantity,
                  0,
                );

              return (
                <li
                  key={`${item.productSlug}-${index}`}
                  className="rounded-sm border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-ink">
                      {item.productName}{" "}
                      <span className="text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-ink">
                      {formatMoneyFromCents(lineTotal, item.currency)}
                    </span>
                  </div>

                  {item.accessories.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 border-t border-slate-100 pt-2">
                      {item.accessories.map((accessory) => (
                        <li
                          key={`${accessory.name}-${accessory.unitPriceCents}`}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                            {accessory.imageUrl ? (
                              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-slate-50">
                                <Image
                                  src={accessory.imageUrl}
                                  alt=""
                                  fill
                                  sizes="28px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </span>
                            ) : null}
                            <span className="truncate">+ {accessory.name}</span>
                          </span>
                          <span className="shrink-0 tabular-nums text-ink">
                            {accessory.unitPriceCents > 0
                              ? formatMoneyFromCents(
                                  accessory.unitPriceCents * accessory.quantity,
                                  accessory.currency,
                                )
                              : "Included"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {order.notes ? (
          <div className="rounded-sm border border-slate-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              Notes
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{order.notes}</p>
          </div>
        ) : null}

        <dl className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="text-lg font-bold tabular-nums text-ink">
              {formatMoneyFromCents(order.totalCents, order.currency)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <OrderStatusBadge status={order.status} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Placed</dt>
            <dd className="text-ink">{formatOrderWhen(order.placedAt)}</dd>
          </div>
        </dl>
      </div>
    </PodShellModal>
  );
}
