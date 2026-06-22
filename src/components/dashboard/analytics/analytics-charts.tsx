"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import type {
  AnalyticsProgressRow,
  AnalyticsRankedRow,
  AnalyticsSlice,
} from "@/lib/dashboard/dashboard-analytics-data";
import type { FinancialChartPoint, FinancialPeriod } from "@/lib/dashboard/financial-period";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

const CHART = {
  primary: "#6366f1",
  cyan: "#22d3ee",
  orange: "#f97316",
  red: "#ef4444",
  rose: "#f43f5e",
  sky: "#0ea5e9",
};

const INDIGO_SHADES = [
  "bg-indigo-100",
  "bg-indigo-200",
  "bg-indigo-300",
  "bg-indigo-400",
  "bg-indigo-500",
  "bg-indigo-600",
  "bg-indigo-700",
  "bg-indigo-800",
];

export function AnalyticsCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function WidgetPeriodSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange?: (value: string) => void;
  options: { value: string; label: string }[];
  ariaLabel: string;
}) {
  const label = options.find((option) => option.value === value)?.label ?? value;

  if (!onChange) {
    return (
      <span className="text-xs text-slate-400" aria-label={ariaLabel}>
        {label}
      </span>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer border-none bg-transparent p-0 text-xs text-slate-400 focus:outline-none focus:ring-0"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function AnalyticsWidgetHeader({
  title,
  periodValue,
  periodOptions,
  onPeriodChange,
  legend,
}: {
  title: string;
  periodValue?: string;
  periodOptions?: { value: string; label: string }[];
  onPeriodChange?: (value: string) => void;
  legend?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {legend}
      </div>
      {periodValue && periodOptions ? (
        <WidgetPeriodSelect
          value={periodValue}
          onChange={onPeriodChange}
          options={periodOptions}
          ariaLabel={`${title} period`}
        />
      ) : null}
    </div>
  );
}

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

export function AnalyticsMetricCard({
  label,
  value,
  trend,
  trendUp,
  series,
  accentColor,
  trendClassName,
  period,
  onPeriodChange,
  periodOptions,
}: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  series: number[];
  accentColor: string;
  trendClassName: string;
  period: FinancialPeriod;
  onPeriodChange: (period: FinancialPeriod) => void;
  periodOptions: { id: FinancialPeriod; label: string }[];
}) {
  const path = sparkPath(series, 100, 40);

  return (
    <section className="flex h-48 flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-slate-500">{label}</h3>
        <WidgetPeriodSelect
          value={period}
          onChange={(value) => onPeriodChange(value as FinancialPeriod)}
          options={periodOptions.map(({ id, label: optionLabel }) => ({
            value: id,
            label: optionLabel,
          }))}
          ariaLabel={`${label} period`}
        />
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-bold tabular-nums tracking-tight text-slate-800">
            {value}
          </div>
          <div
            className={`mt-1 flex items-center gap-0.5 text-xs font-semibold ${trendClassName}`}
          >
            <TrendArrow up={trendUp} />
            {trend}
          </div>
        </div>
        <div
          className="chart-placeholder flex h-12 w-24 shrink-0 items-end"
          style={{
            background: `linear-gradient(180deg, ${accentColor}14 0%, transparent 100%)`,
          }}
        >
          <svg
            viewBox="0 0 100 40"
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d={path}
              fill="none"
              stroke={accentColor}
              strokeLinecap="round"
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}

export function AnalyticsRealtimeList({ rows }: { rows: AnalyticsProgressRow[] }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const pct = Math.round((row.value / Math.max(row.max, 1)) * 100);
        return (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-[11px]">
              <span className="text-slate-500">
                {row.label}{" "}
                <span className="ml-1 font-bold text-slate-800">{row.value}</span>
              </span>
              <span className="text-slate-300">max {row.max}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function buildAreaPaths(
  data: FinancialChartPoint[],
  key: "salesCents" | "expensesCents",
  width: number,
  height: number,
  padLeft: number,
  padBottom: number,
) {
  const maxY = Math.max(...data.flatMap((d) => [d.salesCents, d.expensesCents]), 1);
  const points = data.map((d, i) => {
    const x = padLeft + (i / Math.max(data.length - 1, 1)) * (width - padLeft - 16);
    const y = height - padBottom - (d[key] / maxY) * (height - padBottom - 16);
    return { x, y };
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${width - 16} ${height - padBottom} L ${padLeft} ${height - padBottom} Z`;
  return { line, area, labels: data.map((d) => d.label), maxY };
}

export function AnalyticsSiteTrafficCard({
  data,
  periodLabel,
}: {
  data: FinancialChartPoint[];
  periodLabel: string;
}) {
  const width = 500;
  const height = 150;
  const padLeft = 32;
  const padBottom = 24;
  const revenue = buildAreaPaths(data, "salesCents", width, height, padLeft, padBottom);
  const expenses = buildAreaPaths(data, "expensesCents", width, height, padLeft, padBottom);
  const hasSignal = data.some((d) => d.salesCents > 0 || d.expensesCents > 0);
  const yTicks = [1, 0.8, 0.6, 0.4, 0.2, 0].map((t) =>
    Math.round(revenue.maxY * t).toLocaleString(),
  );

  if (!hasSignal) {
    return (
      <AnalyticsCard className="min-h-[16rem]">
        <AnalyticsWidgetHeader title="Site traffic" periodValue={periodLabel} periodOptions={[{ value: periodLabel, label: periodLabel }]} />
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
          No activity in this period.
        </p>
      </AnalyticsCard>
    );
  }

  const peakIndex = data.reduce(
    (best, row, index) => (row.salesCents > (data[best]?.salesCents ?? 0) ? index : best),
    0,
  );
  const peakX =
    padLeft + (peakIndex / Math.max(data.length - 1, 1)) * (width - padLeft - 16);
  const peakY =
    height -
    padBottom -
    ((data[peakIndex]?.salesCents ?? 0) / revenue.maxY) * (height - padBottom - 16);

  return (
    <AnalyticsCard className="relative min-h-[16rem]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Site traffic</h3>
          <div className="mt-1 flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              New visitor
            </span>
            <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Returning visitor
            </span>
          </div>
        </div>
        <WidgetPeriodSelect
          value={periodLabel}
          options={[{ value: periodLabel, label: periodLabel }]}
          ariaLabel="Site traffic period"
        />
      </div>

      <div className="relative mt-2 h-44 w-full">
        <div className="pointer-events-none absolute bottom-6 left-0 top-0 flex w-6 flex-col justify-between text-[9px] text-slate-300">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="relative ml-8 h-full">
          <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="analytics-revenue-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={CHART.primary} stopOpacity="0.2" />
                <stop offset="100%" stopColor={CHART.primary} stopOpacity="0" />
              </linearGradient>
              <linearGradient id="analytics-expense-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={CHART.cyan} stopOpacity="0.2" />
                <stop offset="100%" stopColor={CHART.cyan} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={expenses.area} fill="url(#analytics-expense-fill)" />
            <path d={expenses.line} fill="none" stroke={CHART.cyan} strokeLinecap="round" strokeWidth="2" />
            <path d={revenue.area} fill="url(#analytics-revenue-fill)" />
            <path d={revenue.line} fill="none" stroke={CHART.primary} strokeLinecap="round" strokeWidth="2" />
          </svg>
          {data[peakIndex]?.salesCents ? (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${(peakX / width) * 100}%`,
                top: `${(peakY / height) * 100}%`,
              }}
            >
              <div className="absolute bottom-full left-1/2 mb-2 min-w-[3.75rem] -translate-x-1/2 rounded border border-slate-100 bg-white p-2 text-center shadow-lg">
                <div className="text-[10px] font-bold text-slate-800">
                  {formatMoneyFromCents(data[peakIndex]!.salesCents, DEFAULT_CURRENCY)}
                </div>
                <div className="text-[8px] text-slate-400">{data[peakIndex]?.label}</div>
              </div>
              <div className="h-3 w-3 rounded-full border-2 border-indigo-500 bg-white" />
            </div>
          ) : null}
        </div>
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-[9px] text-slate-300">
          {revenue.labels.slice(0, 12).map((label) => (
            <span key={label} className="min-w-0 flex-1 truncate text-center">
              {label}
            </span>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
}

export function AnalyticsDonutPanel({
  title,
  actionLabel,
  slices,
  centerLabel,
  centerValue,
  formatValue = (v) => v.toLocaleString(),
  tall = false,
  horizontalLegend = false,
}: {
  title: string;
  actionLabel?: string;
  slices: AnalyticsSlice[];
  centerLabel: string;
  centerValue: string;
  formatValue?: (value: number) => string;
  tall?: boolean;
  horizontalLegend?: boolean;
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const ringSegments = useMemo(() => {
    return slices.reduce<
      Array<{ slice: AnalyticsSlice; dash: number; offset: number }>
    >((segments, slice) => {
      const dash = (slice.value / total) * circumference;
      const offset =
        segments.length > 0
          ? segments[segments.length - 1].offset +
            segments[segments.length - 1].dash
          : 0;
      segments.push({ slice, dash, offset });
      return segments;
    }, []);
  }, [slices, total, circumference]);

  if (total <= 0) {
    return (
      <AnalyticsCard className="h-full">
        <AnalyticsWidgetHeader
          title={title}
          periodValue={actionLabel}
          periodOptions={actionLabel ? [{ value: actionLabel, label: actionLabel }] : undefined}
        />
        <p className="py-8 text-center text-sm text-slate-500">No data yet.</p>
      </AnalyticsCard>
    );
  }

  const donutSize = tall ? "h-40 w-40" : "h-36 w-36";

  return (
    <AnalyticsCard className={`h-full ${tall ? "min-h-[22rem]" : ""}`}>
      <AnalyticsWidgetHeader
        title={title}
        periodValue={actionLabel}
        periodOptions={actionLabel ? [{ value: actionLabel, label: actionLabel }] : undefined}
      />
      <div
        className={`flex flex-1 ${
          horizontalLegend
            ? "flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8"
            : tall
              ? "flex-col items-center justify-center gap-6 py-2"
              : "flex-col items-center gap-4"
        }`}
      >
        <div className={`relative shrink-0 ${donutSize}`}>
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={tall ? 12 : 10} />
            {ringSegments.map(({ slice, dash, offset }) => (
                <circle
                  key={slice.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={tall ? 12 : 10}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-medium text-slate-400">{centerLabel}</span>
            <span className="text-2xl font-bold text-slate-800">{centerValue}</span>
          </div>
        </div>
        <ul
          className={`min-w-0 w-full ${
            horizontalLegend ? "flex-1 space-y-2" : tall ? "space-y-3" : "space-y-2"
          }`}
        >
          {slices.slice(0, horizontalLegend ? 5 : tall ? 3 : 5).map((slice) => {
            const pct = Math.round((slice.value / total) * 100);
            return (
              <li
                key={slice.label}
                className="flex items-center justify-between gap-2 text-xs"
              >
                <span className="inline-flex min-w-0 items-center gap-2 text-slate-500">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate">{slice.label}</span>
                </span>
                <span className="shrink-0 font-bold text-slate-800">
                  {formatValue(slice.value)} / {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </AnalyticsCard>
  );
}

export function AnalyticsBarPanel({
  title,
  actionLabel,
  data,
}: {
  title: string;
  actionLabel?: string;
  data: FinancialChartPoint[];
}) {
  const max = Math.max(...data.map((d) => d.transactions), 1);
  const bars = data.slice(0, 14);
  const peakIndex = bars.reduce(
    (best, row, index) => (row.transactions > (bars[best]?.transactions ?? 0) ? index : best),
    0,
  );

  return (
    <AnalyticsCard className="min-h-[16rem]">
      <AnalyticsWidgetHeader
        title={title}
        periodValue={actionLabel}
        periodOptions={actionLabel ? [{ value: actionLabel, label: actionLabel }] : undefined}
      />
      <div className="flex min-h-[10rem] flex-1 flex-col">
        <div className="flex flex-1 items-end justify-between gap-1 pb-4">
          {bars.map((d, index) => {
            const heightPct = Math.max(12, Math.round((d.transactions / max) * 100));
            const shade = INDIGO_SHADES[index % INDIGO_SHADES.length];
            const isPeak = index === peakIndex && d.transactions > 0;
            return (
              <div key={`${d.label}-${index}`} className="relative flex h-36 flex-1 flex-col justify-end">
                {isPeak ? (
                  <div className="pointer-events-none absolute -top-10 left-1/2 z-10 min-w-[2.5rem] -translate-x-1/2 rounded border border-slate-100 bg-white p-1 text-center shadow">
                    <div className="text-[9px] font-bold text-slate-800">{d.transactions}</div>
                    <div className="text-[7px] text-slate-400">orders</div>
                  </div>
                ) : null}
                <div
                  className={`w-full rounded-t-sm ${shade}`}
                  style={{ height: `${heightPct}%`, minHeight: d.transactions > 0 ? "0.75rem" : "0.25rem" }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between px-1 text-[8px] text-slate-400">
          {bars.map((d, index) => (
            <span key={`${d.label}-axis-${index}`} className="min-w-0 flex-1 truncate text-center">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
}

export function AnalyticsPagesList({
  rows,
  actionLabel,
}: {
  rows: AnalyticsRankedRow[];
  actionLabel?: string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <AnalyticsCard className="min-h-[16rem]">
      <AnalyticsWidgetHeader
        title="Pages"
        periodValue={actionLabel}
        periodOptions={actionLabel ? [{ value: actionLabel, label: actionLabel }] : undefined}
      />
      <div className="max-h-[300px] space-y-4 overflow-y-auto pr-2">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No product sales data yet.</p>
        ) : (
          rows.slice(0, 8).map((row) => {
            const pct = Math.round((row.value / max) * 100);
            const content = (
              <div>
                <div className="mb-1 flex justify-between text-[10px]">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="font-semibold text-slate-800">
                    {row.value.toLocaleString()}
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
            return (
              <div key={row.label}>
                {row.href ? (
                  <Link href={row.href} className="block transition hover:opacity-80">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })
        )}
      </div>
    </AnalyticsCard>
  );
}

export function formatTrend(current: number, previous: number) {
  if (previous === 0) {
    return { label: current > 0 ? "100%" : "0%", up: current >= previous };
  }
  const pct = ((current - previous) / previous) * 100;
  return {
    label: `${Math.abs(pct).toFixed(0)}%`,
    up: pct >= 0,
  };
}

export function sumSeries(data: FinancialChartPoint[], key: keyof FinancialChartPoint) {
  return data.reduce((sum, row) => sum + Number(row[key] ?? 0), 0);
}

export function seriesValues(data: FinancialChartPoint[], key: keyof FinancialChartPoint) {
  return data.map((row) => Number(row[key] ?? 0));
}

export function formatCentsShort(cents: number) {
  return formatMoneyFromCents(cents, DEFAULT_CURRENCY);
}

export const DEVICE_CHANNEL_COLORS = [CHART.orange, CHART.primary, CHART.red];
