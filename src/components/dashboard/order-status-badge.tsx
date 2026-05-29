import type { DemoOrderStatus } from "@/lib/dashboard/demo-data";

const STATUS_STYLES: Record<
  DemoOrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-brand/15 text-brand ring-1 ring-brand/25",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-accent/12 text-accent ring-1 ring-accent/25",
  },
  FULFILLED: {
    label: "Fulfilled",
    className: "bg-success/15 text-success ring-1 ring-success/30",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-danger/12 text-danger ring-1 ring-danger/25",
  },
};

export function OrderStatusBadge({ status }: { status: DemoOrderStatus }) {
  const cfg = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
