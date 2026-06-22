import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { dashboardCardShellClass } from "@/components/dashboard/ui/dashboard-grid-box";

export const dashboardEcomCardClass = dashboardCardShellClass;
export const dashboardEcomStatCardClass = "dash-stat-card";

export function DashboardEcomCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${dashboardEcomCardClass} ${className}`}>
      {children}
    </section>
  );
}

export function DashboardEcomSection({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div className="px-0.5">
        <h2 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardEcomViewAll({
  href,
  label = "View all",
}: {
  href: string;
  label?: string;
}) {
  return (
    <div className="flex justify-center px-5 pb-5 pt-2">
      <Link
        href={href}
        className="inline-flex min-w-[8rem] items-center justify-center rounded-sm bg-[var(--dash-accent-yellow)] px-5 py-2 text-sm font-bold text-[#1a202c] shadow-sm transition hover:brightness-105"
      >
        {label}
      </Link>
    </div>
  );
}

export function DashboardEcomPanelHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
      <div className="min-w-0">
        <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type StatCellProps = {
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: LucideIcon;
  iconClassName?: string;
  compact?: boolean;
};

const defaultIconClass = "bg-slate-100 text-slate-500";

export function DashboardEcomStatCell({
  label,
  value,
  trend,
  trendUp = true,
  icon: Icon,
  iconClassName = defaultIconClass,
  compact = false,
}: StatCellProps) {
  return (
    <div className="relative min-w-0">
      {Icon ? (
        <span
          className={`absolute right-0 top-0 flex items-center justify-center rounded-full ${iconClassName} ${
            compact ? "h-7 w-7" : "h-9 w-9"
          }`}
        >
          <Icon size={compact ? 13 : 16} aria-hidden />
        </span>
      ) : null}
      <p
        className={`truncate font-medium text-muted-foreground ${
          compact ? "pr-8 text-[10px]" : "pr-10 text-xs"
        }`}
      >
        {label}
      </p>
      <p
        className={`truncate font-bold tabular-nums tracking-tight text-ink ${
          compact
            ? "mt-1 text-base leading-tight sm:text-lg"
            : "mt-2 text-xl md:text-2xl"
        }`}
        title={String(value)}
      >
        {value}
      </p>
      {trend ? (
        <p
          className={`font-medium ${
            compact ? "mt-0.5 text-[10px]" : "mt-1.5 text-xs"
          } ${trendUp ? "text-success" : "text-danger"}`}
        >
          {trend}
        </p>
      ) : null}
    </div>
  );
}

export function DashboardEcomStatCard({
  label,
  value,
  trend,
  trendUp = true,
  icon,
  iconClassName,
  compact = false,
  className = "",
}: StatCellProps & { className?: string }) {
  return (
    <article
      className={`${dashboardEcomStatCardClass} min-w-0 ${
        compact ? "p-3.5" : "p-5"
      } ${className}`}
    >
      <DashboardEcomStatCell
        label={label}
        value={value}
        trend={trend}
        trendUp={trendUp}
        icon={icon}
        iconClassName={iconClassName}
        compact={compact}
      />
    </article>
  );
}
