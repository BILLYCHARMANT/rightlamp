"use client";

import type { FinancialChartPoint } from "@/lib/dashboard/financial-period";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";

export function DashboardFinancialCharts({
  data,
}: {
  data: FinancialChartPoint[];
}) {
  const maxSales = Math.max(...data.map((d) => d.salesCents), 1);
  const maxTx = Math.max(...data.map((d) => d.transactions), 1);

  const hasSignal = data.some(
    (d) => d.salesCents > 0 || d.expensesCents > 0 || d.transactions > 0,
  );

  if (!hasSignal) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No activity in this period yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden />
          Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-sm bg-[var(--dash-accent-yellow)]"
            aria-hidden
          />
          Orders
        </span>
      </div>

      <div className="relative flex h-56 items-end gap-1 overflow-x-auto pb-1 sm:gap-2">
        {data.map((d) => {
          const salesH = Math.max(6, Math.round((d.salesCents / maxSales) * 100));
          const txH = Math.max(6, Math.round((d.transactions / maxTx) * 72));
          return (
            <div
              key={d.label}
              className="group relative flex min-w-[2.25rem] flex-1 flex-col items-center justify-end"
              title={`${d.label}: ${formatMoneyFromCents(d.salesCents, DEFAULT_CURRENCY)} · ${d.transactions} orders`}
            >
              <div className="relative flex h-48 w-full max-w-[2.75rem] items-end justify-center">
                <span
                  className="absolute bottom-0 w-full rounded-t-md bg-accent/20"
                  style={{ height: `${salesH}%` }}
                  aria-hidden
                />
                <span
                  className="absolute bottom-0 w-3 rounded-t-sm bg-[var(--dash-accent-yellow)] sm:w-3.5"
                  style={{ height: `${txH}%` }}
                  aria-hidden
                />
                <span className="absolute left-1/2 top-[18%] hidden -translate-x-1/2 rounded-md bg-accent px-2 py-1 text-[10px] font-semibold text-white shadow-md group-hover:block">
                  {formatMoneyFromCents(d.salesCents, DEFAULT_CURRENCY)}
                </span>
              </div>
              <span className="mt-2 text-[10px] font-medium text-muted-foreground">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
