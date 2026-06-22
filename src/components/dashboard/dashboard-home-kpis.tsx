import {
  AlertTriangle,
  Layers,
  Package,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import type { DashboardOverviewStats } from "@/lib/dashboard/overview-stats";
import { DashboardMetricCard } from "@/components/dashboard/ui/dashboard-metric-card";
import { DashboardSectionLabel } from "@/components/dashboard/ui/dashboard-section-label";

type Props = {
  stats: DashboardOverviewStats;
  orders: {
    pending: number;
    processing: number;
    weekRevenueDisplay: string;
  };
  stock: {
    unitsOnHand: number;
    outOfStockSkus: number;
    inventoryCostDisplay: string;
  };
  finance: {
    monthExpenseDisplay: string;
  };
};

export function DashboardHomeKpis({
  stats,
  orders,
  stock,
  finance,
}: Props) {
  const openOrders = orders.pending + orders.processing;

  return (
    <section className="space-y-5">
      {stats.connectionWarning ? (
        <p
          role="alert"
          className="rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-ink"
        >
          {stats.connectionWarning}
        </p>
      ) : null}

      <div className="space-y-3">
        <DashboardSectionLabel>
          <span aria-hidden>📊</span>
          Operations snapshot
        </DashboardSectionLabel>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard
            label="Open orders"
            value={openOrders}
            icon={ShoppingBag}
            iconTone="accent"
            gradient="cool"
            featured
          />
          <DashboardMetricCard
            label="Week revenue"
            value={orders.weekRevenueDisplay}
            icon={TrendingUp}
            iconTone="accent"
            gradient="cool"
            featured
          />
          <DashboardMetricCard
            label="Units on hand"
            value={stock.unitsOnHand.toLocaleString()}
            icon={Warehouse}
            iconTone="success"
            gradient="slate"
          />
          <DashboardMetricCard
            label="Products on shop"
            value={`${stats.publishedSkus} / ${stats.totalSkus}`}
            icon={Layers}
            iconTone="brand"
            gradient="warm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <DashboardSectionLabel>
          <span aria-hidden>📦</span>
          Inventory &amp; spend
        </DashboardSectionLabel>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <DashboardMetricCard
            label="Products not on shop"
            value={stats.draftSkus}
            icon={Package}
            iconTone="neutral"
            gradient="neutral"
          />
          <DashboardMetricCard
            label={`Low stock ≤${LOW_STOCK_THRESHOLD}`}
            value={stats.lowStockSkus}
            icon={AlertTriangle}
            iconTone="warn"
            gradient="warm"
          />
          <DashboardMetricCard
            label="Out of stock"
            value={stock.outOfStockSkus}
            icon={Package}
            iconTone={stock.outOfStockSkus > 0 ? "danger" : "neutral"}
            gradient="cool"
          />
          <DashboardMetricCard
            label="Month spend"
            value={finance.monthExpenseDisplay}
            icon={Receipt}
            iconTone="warn"
            gradient="slate"
          />
        </div>
      </div>
    </section>
  );
}
