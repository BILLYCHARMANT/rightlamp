import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  dashboardGridBoxClass,
  type DashboardGridGradient,
} from "@/components/dashboard/ui/dashboard-grid-box";

type DashboardCardProps = {
  children: ReactNode;
  className?: string;
  padding?: boolean;
};

export function DashboardCard({
  children,
  className = "",
  padding = true,
}: DashboardCardProps) {
  return (
    <section className={dashboardGridBoxClass("neutral", `${padding ? "p-5" : ""} ${className}`)}>
      {children}
    </section>
  );
}

type DashboardPanelProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  variant?: "default" | "chart";
  gradient?: DashboardGridGradient;
};

export function DashboardPanel({
  title,
  description,
  action,
  icon: Icon,
  iconClassName = "bg-brand/12 text-brand",
  children,
  className = "",
  noPadding = false,
  variant = "chart",
  gradient = "neutral",
}: DashboardPanelProps) {
  if (variant === "chart") {
    return (
      <section className={dashboardGridBoxClass(gradient, className)}>
        <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-6">
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        <div className={noPadding ? "mt-4 border-t border-slate-200" : "px-6 pb-6 pt-4"}>
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className={dashboardGridBoxClass(gradient, className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClassName}`}
            >
              <Icon size={18} aria-hidden />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className={noPadding ? "" : "p-5"}>{children}</div>
    </section>
  );
}

type DashboardStatProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "brand" | "accent" | "warn" | "danger";
};

const toneMap = {
  default: {
    wrap: "border-border/80 bg-surface-elevated",
    icon: "bg-surface text-muted-foreground ring-1 ring-border",
  },
  brand: {
    wrap: "border-brand/20 bg-gradient-to-br from-brand/[0.08] to-surface-elevated",
    icon: "bg-brand/15 text-brand",
  },
  accent: {
    wrap: "border-accent/20 bg-gradient-to-br from-accent/[0.06] to-surface-elevated",
    icon: "bg-accent/12 text-accent",
  },
  warn: {
    wrap: "border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] to-surface-elevated",
    icon: "bg-amber-500/15 text-amber-800",
  },
  danger: {
    wrap: "border-danger/20 bg-gradient-to-br from-danger/[0.05] to-surface-elevated",
    icon: "bg-danger/10 text-danger",
  },
};

export function DashboardStat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: DashboardStatProps) {
  const t = toneMap[tone];
  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm shadow-ink/[0.02] transition hover:shadow-md hover:shadow-ink/[0.04] ${t.wrap}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-bold tabular-nums tracking-tight text-ink">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}
        >
          <Icon size={18} aria-hidden />
        </span>
      </div>
    </div>
  );
}
