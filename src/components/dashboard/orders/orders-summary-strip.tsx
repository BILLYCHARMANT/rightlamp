import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Clock3, Wallet } from "lucide-react";
import type { OrdersPeriodSummary } from "@/components/dashboard/orders/orders-utils";

type Props = {
  summary: OrdersPeriodSummary;
  periodLabel: string;
};

function StatCell({
  icon: Icon,
  label,
  value,
  iconClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconClassName: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-slate-50/80 p-4">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
      >
        <Icon size={20} strokeWidth={2.25} aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold tabular-nums leading-tight text-ink">
          {value}
        </p>
      </div>
    </div>
  );
}

/** Stitch orders-management — 3-column period snapshot grid */
export function OrdersSummaryStrip({ summary, periodLabel }: Props) {
  return (
    <section
      className="border-b border-slate-200 bg-white"
      aria-label="Orders period summary"
    >
      <p className="sr-only">Period: {periodLabel}</p>
      <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
        <StatCell
          icon={Wallet}
          label="Period revenue"
          value={summary.periodRevenueDisplay}
          iconClassName="bg-sky-100 text-sky-600"
        />
        <StatCell
          icon={CheckCircle2}
          label="Paid orders"
          value={summary.paidOrders}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
        <StatCell
          icon={Clock3}
          label="Pending orders"
          value={summary.pendingOrders}
          iconClassName="bg-amber-100 text-amber-600"
        />
      </div>
    </section>
  );
}
