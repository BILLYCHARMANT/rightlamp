import type { LucideIcon } from "lucide-react";

export type MetricTrend = "positive" | "negative" | "neutral";

export type DashboardMetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Percent change; omit or pass 0 to hide the badge (same idea as Pod Café). */
  changePct?: number;
  trend?: MetricTrend;
  highlight?: boolean;
};

export function DashboardMetricCard({
  icon: Icon,
  label,
  value,
  changePct = 0,
  trend = "neutral",
  highlight = false,
}: DashboardMetricCardProps) {
  const borderClass = highlight
    ? "border-2 border-brand/55 ring-1 ring-brand/12"
    : "border border-border";

  const trendClass =
    trend === "positive"
      ? "text-success"
      : trend === "negative"
        ? "text-danger"
        : "text-muted-foreground";

  const badgeBg =
    trend === "positive"
      ? "bg-success/15"
      : trend === "negative"
        ? "bg-danger/15"
        : "bg-surface";

  const showBadge = changePct !== 0;

  return (
    <div
      className={`rounded-xl bg-surface-elevated p-6 shadow-sm shadow-ink/[0.03] ${borderClass}`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="rounded-lg bg-brand/12 p-3 text-brand">
          <Icon size={22} aria-hidden />
        </div>
        {showBadge ? (
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums ${trendClass} ${badgeBg}`}
          >
            {changePct > 0 ? "+" : ""}
            {changePct}%
          </span>
        ) : null}
      </div>
      <p className="mb-1 text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold tabular-nums tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}
