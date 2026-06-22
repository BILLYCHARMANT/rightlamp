import type { DemoDebt, DemoOrder } from "@/lib/dashboard/demo-data";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

export type FinancialPeriod =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "all";

export const FINANCIAL_PERIOD_OPTIONS: {
  id: FinancialPeriod;
  label: string;
}[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "quarter", label: "This quarter" },
  { id: "year", label: "This year" },
];

export type ExpensePoint = {
  amountCents: number;
  paidAt: string;
  currency: string;
};

export type FinancialChartPoint = {
  label: string;
  salesCents: number;
  expensesCents: number;
  profitCents: number;
  transactions: number;
};

export type FinancialMetrics = {
  periodSalesDisplay: string;
  periodNetProfitDisplay: string;
  periodDebtsDisplay: string;
  periodTransactions: number;
  totalSalesDisplay: string;
  totalExpensesDisplay: string;
  actualNetProfitDisplay: string;
  outstandingDebtsDisplay: string;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function periodRange(
  period: FinancialPeriod,
  now = new Date(),
): { start: Date | null; end: Date } {
  const end = now;
  if (period === "all") return { start: null, end };

  const start = startOfDay(now);
  if (period === "today") return { start, end };

  if (period === "week") {
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    return { start, end };
  }

  if (period === "month") {
    return { start: new Date(now.getFullYear(), now.getMonth(), 1), end };
  }

  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3) * 3;
    return { start: new Date(now.getFullYear(), q, 1), end };
  }

  return { start: new Date(now.getFullYear(), 0, 1), end };
}

function inRange(iso: string, start: Date | null, end: Date) {
  const t = new Date(iso).getTime();
  if (start && t < start.getTime()) return false;
  return t <= end.getTime();
}

function sumOrders(orders: DemoOrder[], start: Date | null, end: Date) {
  return orders
    .filter(
      (o) =>
        o.status !== "CANCELLED" && inRange(o.placedAt, start, end),
    )
    .reduce((s, o) => s + o.totalCents, 0);
}

function countOrders(orders: DemoOrder[], start: Date | null, end: Date) {
  return orders.filter((o) => inRange(o.placedAt, start, end)).length;
}

function sumExpenses(
  expenses: ExpensePoint[],
  start: Date | null,
  end: Date,
) {
  return expenses
    .filter((e) => inRange(e.paidAt, start, end))
    .reduce((s, e) => s + e.amountCents, 0);
}

function sumDebtsInPeriod(
  debts: DemoDebt[],
  start: Date | null,
  end: Date,
) {
  return debts
    .filter((d) => {
      const when = d.status === "paid" && d.paidAt ? d.paidAt : d.dueAt;
      return inRange(when, start, end);
    })
    .reduce((s, d) => s + d.amountCents, 0);
}

function outstandingDebts(debts: DemoDebt[]) {
  return debts
    .filter((d) => d.status === "outstanding")
    .reduce((s, d) => s + d.amountCents, 0);
}

export function computeFinancialMetrics(
  period: FinancialPeriod,
  orders: DemoOrder[],
  expenses: ExpensePoint[],
  debts: DemoDebt[],
): FinancialMetrics {
  const { start, end } = periodRange(period);
  const allStart = null;

  const periodSales = sumOrders(orders, start, end);
  const periodExpenses = sumExpenses(expenses, start, end);
  const periodNet = periodSales - periodExpenses;
  const periodDebts = sumDebtsInPeriod(debts, start, end);
  const periodTx = countOrders(orders, start, end);

  const totalSales = sumOrders(orders, allStart, end);
  const totalExpenses = sumExpenses(expenses, allStart, end);
  const actualNet = totalSales - totalExpenses;
  const outstanding = outstandingDebts(debts);

  const fmt = (cents: number) => formatMoneyFromCents(cents, DEFAULT_CURRENCY);

  return {
    periodSalesDisplay: fmt(periodSales),
    periodNetProfitDisplay: fmt(periodNet),
    periodDebtsDisplay: fmt(periodDebts),
    periodTransactions: periodTx,
    totalSalesDisplay: fmt(totalSales),
    totalExpensesDisplay: fmt(totalExpenses),
    actualNetProfitDisplay: fmt(actualNet),
    outstandingDebtsDisplay: fmt(outstanding),
  };
}

export function buildChartSeries(
  period: FinancialPeriod,
  orders: DemoOrder[],
  expenses: ExpensePoint[],
): FinancialChartPoint[] {
  if (period === "all" || period === "year") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const year = new Date().getFullYear();
    return months.map((label, i) => {
      const start = new Date(year, i, 1);
      const end = new Date(year, i + 1, 0, 23, 59, 59);
      const sales = sumOrders(orders, start, end);
      const exp = sumExpenses(expenses, start, end);
      return {
        label,
        salesCents: sales,
        expensesCents: exp,
        profitCents: sales - exp,
        transactions: countOrders(orders, start, end),
      };
    });
  }

  if (period === "quarter" || period === "month") {
    const { start, end } = periodRange(period);
    if (!start) return [];
    const buckets: FinancialChartPoint[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const dayStart = startOfDay(cursor);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      const sales = sumOrders(orders, dayStart, dayEnd);
      const exp = sumExpenses(expenses, dayStart, dayEnd);
      buckets.push({
        label: String(dayStart.getDate()),
        salesCents: sales,
        expensesCents: exp,
        profitCents: sales - exp,
        transactions: countOrders(orders, dayStart, dayEnd),
      });
      cursor.setDate(cursor.getDate() + 1);
      if (buckets.length >= 31) break;
    }
    return buckets;
  }

  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const { start, end } = periodRange(period === "today" ? "today" : "week");
  if (!start) return [];

  return labels.map((label, i) => {
    const dayStart = new Date(start);
    dayStart.setDate(start.getDate() + i);
    if (dayStart > end) {
      return { label, salesCents: 0, expensesCents: 0, profitCents: 0, transactions: 0 };
    }
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const sales = sumOrders(orders, dayStart, dayEnd);
    const exp = sumExpenses(expenses, dayStart, dayEnd);
    return {
      label,
      salesCents: sales,
      expensesCents: exp,
      profitCents: sales - exp,
      transactions: countOrders(orders, dayStart, dayEnd),
    };
  });
}
