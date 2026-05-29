import { BarChart3, TrendingUp } from "lucide-react";
import { DashboardRevenueBars } from "@/components/dashboard/dashboard-revenue-bars";
import { DashboardTopSkus } from "@/components/dashboard/dashboard-top-skus";
import {
  DEMO_DAILY_REVENUE,
  DEMO_TOP_SKUS,
} from "@/lib/dashboard/demo-data";

export default function DashboardReportsPage() {
  const weekTotal = DEMO_DAILY_REVENUE.reduce((s, d) => s + d.revenueRwf, 0);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <p className="max-w-3xl text-sm text-muted-foreground">
        Weekly revenue rhythm plus SKU ranking — common retail ops split. Figures are
        illustrative until sales aggregates connect to warehouse or POS feeds.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm md:p-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <TrendingUp size={20} className="text-accent" aria-hidden />
                Revenue trend (demo week)
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Daily totals · Rwanda Francs
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Week total
              </p>
              <p className="text-lg font-bold tabular-nums text-ink">
                {weekTotal.toLocaleString()} RWF
              </p>
            </div>
          </div>
          <DashboardRevenueBars data={DEMO_DAILY_REVENUE} />
        </section>

        <section className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-brand" aria-hidden />
            <div>
              <h2 className="text-base font-bold text-ink">Top movers</h2>
              <p className="text-xs text-muted-foreground">
                Units & attributed revenue (demo)
              </p>
            </div>
          </div>
          <DashboardTopSkus rows={DEMO_TOP_SKUS} />
        </section>
      </div>
    </div>
  );
}
