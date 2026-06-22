import type { LucideIcon } from "lucide-react";
import { Crown } from "lucide-react";
import {
  DashboardGridBox,
  type DashboardGridGradient,
} from "@/components/dashboard/ui/dashboard-grid-box";

export type DashboardMetricIconTone =
  | "accent"
  | "success"
  | "danger"
  | "warn"
  | "brand"
  | "neutral";

type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  iconTone?: DashboardMetricIconTone;
  gradient?: DashboardGridGradient;
  featured?: boolean;
};

const iconToneClass: Record<DashboardMetricIconTone, string> = {
  accent: "bg-accent/12 text-accent ring-1 ring-accent/15",
  success: "bg-success/12 text-success ring-1 ring-success/15",
  danger: "bg-danger/12 text-danger ring-1 ring-danger/15",
  warn: "bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/15",
  brand: "bg-brand/12 text-brand ring-1 ring-brand/15",
  neutral: "bg-slate-100 text-muted-foreground ring-1 ring-border/80",
};

export function DashboardMetricCard({
  label,
  value,
  suffix,
  icon: Icon,
  iconTone = "accent",
  gradient = "neutral",
  featured = false,
}: DashboardMetricCardProps) {
  return (
    <DashboardGridBox as="article" gradient={gradient} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconToneClass[iconTone]}`}
        >
          <Icon size={20} strokeWidth={2} aria-hidden />
        </span>
        {featured ? (
          <Crown
            size={18}
            className="shrink-0 text-brand"
            aria-label="Key metric"
          />
        ) : (
          <span className="h-[18px] w-[18px] shrink-0" aria-hidden />
        )}
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1.5 text-[1.65rem] font-bold leading-tight tracking-tight text-ink">
        <span className="tabular-nums">{value}</span>
        {suffix ? (
          <span className="ml-1.5 text-base font-semibold text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </p>
    </DashboardGridBox>
  );
}
