import { AlertTriangle, CheckCircle2, Layers, PackageOpen } from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import type { DashboardOverviewStats } from "@/lib/dashboard/overview-stats";
import { DashboardMetricCard } from "@/components/dashboard/metric-card";

type Props = {
  stats: DashboardOverviewStats;
};

export function DashboardOverviewMetrics({ stats }: Props) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Today at a glance
      </h2>
      {stats.connectionWarning ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-ink"
        >
          {stats.connectionWarning}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          icon={Layers}
          label="Products in catalog"
          value={stats.totalSkus}
          highlight={false}
        />
        <DashboardMetricCard
          icon={CheckCircle2}
          label="Published"
          value={stats.publishedSkus}
          highlight
        />
        <DashboardMetricCard
          icon={PackageOpen}
          label="Draft / hidden"
          value={stats.draftSkus}
        />
        <DashboardMetricCard
          icon={AlertTriangle}
          label={`Low stock (≤${LOW_STOCK_THRESHOLD})`}
          value={stats.lowStockSkus}
        />
      </div>
    </section>
  );
}
