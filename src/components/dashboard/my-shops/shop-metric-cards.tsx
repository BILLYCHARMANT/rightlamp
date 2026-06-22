"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  Boxes,
  CircleDollarSign,
  Package,
  ShoppingBag,
  TrendingUp,
  Warehouse,
} from "lucide-react";

export type ShopMetricCardConfig = {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  series: number[];
  accentColor: string;
  icon: LucideIcon;
  iconBg: string;
};

function sparkPath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function TrendArrow({ up, className = "" }: { up: boolean; className?: string }) {
  return (
    <svg
      className={`h-3 w-3 shrink-0 ${up ? "rotate-180" : ""} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        d="M19 14l-7 7m0 0l-7-7m7 7V3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3}
      />
    </svg>
  );
}

export function formatShopPeriodLabel(dateFrom?: string, dateTo?: string): string {
  if (!dateFrom && !dateTo) return "All time";

  const fmt = (raw: string) => {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
      }).format(new Date(raw));
    } catch {
      return raw;
    }
  };

  if (dateFrom && dateTo) return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  if (dateFrom) return `From ${fmt(dateFrom)}`;
  return `Until ${fmt(dateTo!)}`;
}

export function buildDistributionSeries(values: number[]): number[] {
  if (values.length >= 2) return values;
  if (values.length === 1) {
    const v = values[0]!;
    return [v * 0.65, v * 0.82, v * 0.94, v];
  }
  return [0, 0, 0, 0, 0];
}

export function ShopMetricCard({
  label,
  value,
  trend,
  trendUp = true,
  series,
  accentColor,
  icon: Icon,
  iconBg,
  periodLabel,
}: ShopMetricCardConfig & { periodLabel?: string }) {
  const path = sparkPath(series, 100, 40);
  const trendClass = trendUp ? "text-emerald-600" : "text-rose-600";

  return (
    <section className="relative flex h-48 flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md">
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-[0.12] blur-2xl"
        style={{ backgroundColor: accentColor }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-1 w-full opacity-80"
        style={{
          background: `linear-gradient(90deg, ${accentColor}55 0%, ${accentColor}10 55%, transparent 100%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconBg}`}
          >
            <Icon size={18} strokeWidth={2.25} aria-hidden />
          </span>
          <h3 className="truncate text-sm font-semibold text-slate-600">{label}</h3>
        </div>
        {periodLabel ? (
          <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-400">
            {periodLabel}
          </span>
        ) : null}
      </div>

      <div className="relative flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-[1.75rem]">
            {value}
          </p>
          <p className={`mt-1.5 flex items-center gap-0.5 text-xs font-semibold ${trendClass}`}>
            <TrendArrow up={trendUp} className={trendClass} />
            <span className="truncate">{trend}</span>
          </p>
        </div>
        <div
          className="flex h-12 w-24 shrink-0 items-end rounded-lg border border-slate-100/80"
          style={{
            background: `linear-gradient(180deg, ${accentColor}16 0%, transparent 100%)`,
          }}
        >
          <svg
            viewBox="0 0 100 40"
            className="h-full w-full overflow-visible px-1"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={path}
              fill="none"
              stroke={accentColor}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.75"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

export function ShopMetricCardsGrid({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}) {
  const columnClass =
    columns === 4
      ? "xl:grid-cols-4"
      : columns === 3
        ? "xl:grid-cols-3"
        : "sm:grid-cols-2";

  return <div className={`grid gap-4 sm:grid-cols-2 ${columnClass}`}>{children}</div>;
}

export const SHOP_METRIC_PALETTE = {
  inventory: {
    accentColor: "#6366f1",
    iconBg: "bg-indigo-50 text-indigo-600",
    icon: Warehouse,
  },
  sales: {
    accentColor: "#0ea5e9",
    iconBg: "bg-sky-50 text-sky-600",
    icon: ShoppingBag,
  },
  profit: {
    accentColor: "#10b981",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: TrendingUp,
  },
  stock: {
    accentColor: "#f97316",
    iconBg: "bg-orange-50 text-orange-600",
    icon: Boxes,
  },
  assigned: {
    accentColor: "#8b5cf6",
    iconBg: "bg-violet-50 text-violet-600",
    icon: Package,
  },
  revenue: {
    accentColor: "#14b8a6",
    iconBg: "bg-teal-50 text-teal-600",
    icon: CircleDollarSign,
  },
} as const;
