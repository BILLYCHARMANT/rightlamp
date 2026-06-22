"use client";

import Link from "next/link";
import { CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import type { MonthlyRollup } from "@/lib/dashboard/operations-queries";
import { DashboardCompactMetrics } from "@/components/dashboard/dashboard-compact-metrics";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

type Props = {
  rollups: MonthlyRollup[];
};

function maxBar(values: number[]) {
  return Math.max(...values, 1);
}

export function MonthlyDashboard({ rollups }: Props) {
  const latest = rollups[rollups.length - 1];
  const totalExpense = rollups.reduce((s, r) => s + r.expenseCents, 0);
  const expenseMax = maxBar(rollups.map((r) => r.expenseCents));
  const revenueMax = maxBar(rollups.map((r) => r.orderRevenueCents));

  const netLatest =
    (latest?.orderRevenueCents ?? 0) - (latest?.expenseCents ?? 0);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <p className="max-w-3xl text-sm text-muted-foreground">
        Month-by-month rhythm — pairs with production{" "}
        <code className="rounded bg-surface px-1 py-0.5 text-xs">/api/expense/month</code>.
        Expenses come from your ledger; order revenue uses the orders feed until POS sync lands.
      </p>

      <DashboardCompactMetrics
        items={[
          {
            icon: CalendarDays,
            label: "This month spend",
            value: formatMoneyFromCents(latest?.expenseCents ?? 0, DEFAULT_CURRENCY),
          },
          {
            icon: TrendingUp,
            label: "This month revenue",
            value: formatMoneyFromCents(latest?.orderRevenueCents ?? 0, "RWF"),
          },
          {
            icon: TrendingDown,
            label: "Net (demo orders)",
            value: formatMoneyFromCents(netLatest, DEFAULT_CURRENCY),
          },
          {
            icon: CalendarDays,
            label: "6-mo expenses",
            value: formatMoneyFromCents(totalExpense, DEFAULT_CURRENCY),
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm md:p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
            Expense by month
          </h2>
          <ul className="mt-6 space-y-4">
            {rollups.map((row) => (
              <li key={row.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink">{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatMoneyFromCents(row.expenseCents, DEFAULT_CURRENCY)} · {row.expenseCount}{" "}
                    bills
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{
                      width: `${Math.round((row.expenseCents / expenseMax) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm md:p-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
            Revenue by month (orders)
          </h2>
          <ul className="mt-6 space-y-4">
            {rollups.map((row) => (
              <li key={row.key}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink">{row.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatMoneyFromCents(row.orderRevenueCents, "RWF")} ·{" "}
                    {row.orderCount} orders
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{
                      width: `${Math.round((row.orderRevenueCents / revenueMax) * 100)}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Need line-item detail?{" "}
        <Link href="/dashboard/reports/expenses" className="font-semibold text-accent hover:underline">
          Open expenses
        </Link>{" "}
        or{" "}
        <Link href="/dashboard/orders" className="font-semibold text-accent hover:underline">
          review orders
        </Link>
        .
      </p>
    </div>
  );
}
