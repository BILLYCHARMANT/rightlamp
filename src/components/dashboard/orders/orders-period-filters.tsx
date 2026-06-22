"use client";

import { Calendar, ChevronDown, X } from "lucide-react";
import {
  formatCalendarDateLabel,
  ORDER_PERIOD_OPTIONS,
  type OrderPeriodFilter,
} from "@/lib/dashboard/orders-period";

type Props = {
  period: OrderPeriodFilter;
  customDate: string | null;
  onPeriodChange: (period: OrderPeriodFilter) => void;
  onCustomDateChange: (date: string | null) => void;
  periodOptions?: typeof ORDER_PERIOD_OPTIONS;
  dateMin?: string;
  dateMax?: string;
  monthOnly?: boolean;
};

export function OrdersPeriodFilters({
  period,
  customDate,
  onPeriodChange,
  onCustomDateChange,
  periodOptions = ORDER_PERIOD_OPTIONS,
  dateMin,
  dateMax,
  monthOnly = false,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {monthOnly ? (
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand">
          This month only
        </span>
      ) : null}
      <div className="relative w-full min-w-[140px] sm:w-auto sm:min-w-[160px]">
        <label className="sr-only" htmlFor="orders-period-filter">
          Filter by period
        </label>
        <select
          id="orders-period-filter"
          value={period}
          disabled={Boolean(customDate)}
          onChange={(e) => {
            onCustomDateChange(null);
            onPeriodChange(e.target.value as OrderPeriodFilter);
          }}
          className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-9 text-xs font-medium text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted-foreground"
        >
          {periodOptions.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>

      <label className="flex items-center gap-2">
        <Calendar
          size={16}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="sr-only">Pick a calendar day</span>
        <input
          type="date"
          value={customDate ?? ""}
          min={dateMin}
          max={dateMax}
          onChange={(e) => {
            const value = e.target.value;
            onCustomDateChange(value || null);
          }}
          title={
            customDate
              ? formatCalendarDateLabel(customDate)
              : "Pick a calendar day"
          }
          className={`w-[148px] rounded-lg border bg-white px-3 py-1.5 text-xs text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 ${
            customDate
              ? "border-brand/40 ring-1 ring-brand/10"
              : "border-slate-200"
          }`}
        />
      </label>

      {customDate ? (
        <button
          type="button"
          onClick={() => onCustomDateChange(null)}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-muted-foreground transition hover:bg-slate-50 hover:text-ink"
          title="Clear calendar day"
          aria-label="Clear calendar day"
        >
          <X size={14} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
