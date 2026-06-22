import Link from "next/link";
import { FileText, Package, Receipt, ShoppingBag } from "lucide-react";
import type { ReportRow } from "@/lib/dashboard/operations-queries";
import { DashboardCompactMetrics } from "@/components/dashboard/dashboard-compact-metrics";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

type Summary = Awaited<
  ReturnType<typeof import("@/lib/dashboard/operations-queries").getOperationsSummary>
>;

type Props = {
  summary: Summary;
  reports: ReportRow[];
  productionSummary: Record<string, unknown> | null;
};

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function ReportSummaryDashboard({
  summary,
  reports,
  productionSummary,
}: Props) {
  const netDemo = summary.orderRevenueCents - summary.totalExpenseCents;

  return (
    <div className="space-y-8 p-4 md:p-8">
      <p className="max-w-3xl text-sm text-muted-foreground">
        Condensed operational totals — mirrors production{" "}
        <code className="rounded bg-surface px-1 py-0.5 text-xs">/api/report/summary</code>{" "}
        when API credentials are configured. Below uses your local ledger plus catalog stats.
      </p>

      {productionSummary ? (
        <section className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-xs text-muted-foreground md:p-5">
          <p className="font-semibold text-ink">Live production summary (read-only)</p>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-surface p-3 text-[11px]">
            {JSON.stringify(productionSummary, null, 2)}
          </pre>
        </section>
      ) : null}

      <DashboardCompactMetrics
        items={[
          {
            icon: Receipt,
            label: "Total expenses",
            value: formatMoneyFromCents(summary.totalExpenseCents, DEFAULT_CURRENCY),
          },
          {
            icon: ShoppingBag,
            label: "Order revenue (demo)",
            value: formatMoneyFromCents(summary.orderRevenueCents, "RWF"),
          },
          {
            icon: Package,
            label: "Products in catalog",
            value: summary.totalSkus,
          },
          {
            icon: FileText,
            label: "Published reports",
            value: summary.publishedReports,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
            Snapshot
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Expense entries</dt>
              <dd className="font-semibold tabular-nums">{summary.expenseCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Stock units (local)</dt>
              <dd className="font-semibold tabular-nums">
                {summary.totalStockUnits.toLocaleString()}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Pending orders</dt>
              <dd className="font-semibold tabular-nums">{summary.pendingOrders}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="text-muted-foreground">Net (demo)</dt>
              <dd className="font-bold tabular-nums text-brand">
                {formatMoneyFromCents(netDemo, DEFAULT_CURRENCY)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-ink">
              <FileText size={16} className="text-accent" aria-hidden />
              Recent expenses
            </h2>
            <Link
              href="/dashboard/reports/expenses"
              className="text-xs font-semibold text-accent hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {summary.recentExpenses.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-ink">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(e.paidAt)}
                  </p>
                </div>
                <span className="font-semibold tabular-nums">
                  {formatMoneyFromCents(e.amountCents, e.currency)}
                </span>
              </li>
            ))}
            {summary.recentExpenses.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                No expenses yet.
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-surface-elevated shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
            Published reports ({summary.publishedReports})
          </h2>
          <Link
            href="/dashboard/reports/new"
            className="text-xs font-semibold text-accent hover:underline"
          >
            Create report
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="dash-data-table w-full min-w-[560px]">
            <thead>
              <tr>
                <th className="px-4 py-3 font-semibold md:px-6">Title</th>
                <th className="px-4 py-3 font-semibold">Period</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold md:px-6">Created</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium md:px-6">{r.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatWhen(r.periodStart)} – {formatWhen(r.periodEnd)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.status === "PUBLISHED"
                          ? "bg-success/15 text-success"
                          : "bg-surface ring-1 ring-border text-muted-foreground"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground md:px-6">
                    {formatWhen(r.createdAt)}
                  </td>
                </tr>
              ))}
              {reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-sm text-muted-foreground"
                  >
                    No reports yet —{" "}
                    <Link href="/dashboard/reports/new" className="text-accent hover:underline">
                      write your first
                    </Link>
                    .
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
