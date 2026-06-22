import type { OrderRow } from "@/lib/dashboard/order-types";
import { periodRange, type FinancialPeriod } from "@/lib/dashboard/financial-period";

export type OrderPeriodFilter = "all" | "today" | "week" | "month" | "year";

export const ORDER_PERIOD_OPTIONS: {
  id: OrderPeriodFilter;
  label: string;
}[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "year", label: "This year" },
];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function parseCalendarDate(value: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const start = new Date(year, month - 1, day);
  if (
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    return null;
  }
  return { start: startOfDay(start), end: endOfDay(start) };
}

function inRange(iso: string, start: Date | null, end: Date) {
  const t = new Date(iso).getTime();
  if (start && t < start.getTime()) return false;
  return t <= end.getTime();
}

export function filterOrdersByPeriod(
  orders: OrderRow[],
  period: OrderPeriodFilter,
  customDate: string | null,
  now = new Date(),
): OrderRow[] {
  if (customDate) {
    const range = parseCalendarDate(customDate);
    if (!range) return orders;
    return orders.filter((o) => inRange(o.placedAt, range.start, range.end));
  }

  const financialPeriod: FinancialPeriod =
    period === "all" ? "all" : period;
  const { start, end } = periodRange(financialPeriod, now);
  return orders.filter((o) => inRange(o.placedAt, start, end));
}

export function formatCalendarDateLabel(value: string) {
  const range = parseCalendarDate(value);
  if (!range) return value;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(range.start);
}
