import type { OrderStatus } from "@/lib/dashboard/order-types";

/** Stitch orders-management pill badges */
const STATUS_STYLES: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "border border-amber-200 bg-amber-50 text-amber-700",
  },
  PROCESSING: {
    label: "Processing",
    className: "border border-sky-200 bg-sky-50 text-sky-700",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border border-slate-200 bg-slate-100 text-slate-600",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
