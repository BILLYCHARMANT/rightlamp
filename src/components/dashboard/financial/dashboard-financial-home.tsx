"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownCircle,
  CreditCard,
  Percent,
  Receipt,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import type { FinancialHomePayload } from "@/lib/dashboard/financial-overview";
import { DashboardFinancialCharts } from "@/components/dashboard/financial/dashboard-financial-charts";
import { DashboardHomeBestProducts } from "@/components/dashboard/financial/dashboard-home-best-products";
import { DashboardHomeProductsGrid } from "@/components/dashboard/financial/dashboard-home-products-grid";
import { DashboardHomeRecentOrders } from "@/components/dashboard/financial/dashboard-home-recent-orders";
import { DashboardNotificationsPanel } from "@/components/dashboard/financial/dashboard-notifications-panel";
import { DashboardPeriodFilters } from "@/components/dashboard/financial/dashboard-period-filters";
import {
  DashboardEcomCard,
  DashboardEcomSection,
  DashboardEcomStatCard,
} from "@/components/dashboard/ui/dashboard-ecom";
import {
  buildChartSeries,
  computeFinancialMetrics,
  periodRange,
  type FinancialPeriod,
} from "@/lib/dashboard/financial-period";

type Props = {
  data: FinancialHomePayload;
};

function ordersInPeriod(
  orders: FinancialHomePayload["orders"],
  period: FinancialPeriod,
) {
  const { start, end } = periodRange(period);
  return orders.filter((o) => {
    const t = new Date(o.placedAt);
    if (start && t < start) return false;
    if (t > end) return false;
    return true;
  });
}

export function DashboardFinancialHome({ data }: Props) {
  const [period, setPeriod] = useState<FinancialPeriod>("month");

  const metrics = useMemo(
    () =>
      computeFinancialMetrics(
        period,
        data.orders,
        data.expenses,
        data.debts,
      ),
    [period, data.orders, data.expenses, data.debts],
  );

  const chartData = useMemo(
    () => buildChartSeries(period, data.orders, data.expenses),
    [period, data.orders, data.expenses],
  );

  const periodOrders = useMemo(
    () => ordersInPeriod(data.orders, period),
    [data.orders, period],
  );

  const uniqueCustomers = useMemo(
    () => new Set(periodOrders.map((o) => o.customer)).size,
    [periodOrders],
  );

  const conversionRate = useMemo(() => {
    if (periodOrders.length === 0) return "0%";
    const paid = periodOrders.filter((o) => o.status === "FULFILLED").length;
    return `${((paid / periodOrders.length) * 100).toFixed(1)}%`;
  }, [periodOrders]);

  const periodLabel =
    period === "all"
      ? "All time"
      : period === "today"
        ? "Today"
        : period === "week"
          ? "This week"
          : period === "month"
            ? "This month"
            : period === "quarter"
              ? "This quarter"
              : "This year";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-[1.75rem]">
          E-Commerce Dashboard
        </h1>
        <DashboardPeriodFilters period={period} onChange={setPeriod} />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardEcomStatCard
          compact
          label="Period sales"
          value={metrics.periodSalesDisplay}
          trend="+15.8%"
          icon={ShoppingBag}
          iconClassName="bg-[var(--dash-accent-yellow)]/25 text-[#c9a000]"
        />
        <DashboardEcomStatCard
          compact
          label="Orders"
          value={metrics.periodTransactions}
          trend="+7.2%"
          icon={Receipt}
          iconClassName="bg-[var(--dash-accent-yellow)]/25 text-[#c9a000]"
        />
        <DashboardEcomStatCard
          compact
          label="Customers"
          value={uniqueCustomers.toLocaleString()}
          trend="+5.4%"
          icon={Users}
          iconClassName="bg-[var(--dash-accent-yellow)]/25 text-[#c9a000]"
        />
        <DashboardEcomStatCard
          compact
          label="Conversion rate"
          value={conversionRate}
          trend="+0.5%"
          icon={Percent}
          iconClassName="bg-[var(--dash-accent-yellow)]/25 text-[#c9a000]"
        />
      </div>

      <DashboardEcomSection
        title="Financial summary"
        description={`${periodLabel} and all-time figures`}
      >
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <DashboardEcomStatCard
            compact
            label="Period net profit"
            value={metrics.periodNetProfitDisplay}
            trend="+5.1%"
            icon={TrendingUp}
            iconClassName="bg-emerald-100 text-emerald-600"
          />
          <DashboardEcomStatCard
            compact
            label="Period debts"
            value={metrics.periodDebtsDisplay}
            icon={CreditCard}
            iconClassName="bg-amber-100 text-amber-700"
          />
          <DashboardEcomStatCard
            compact
            label="Total sales"
            value={metrics.totalSalesDisplay}
            icon={Wallet}
            iconClassName="bg-sky-100 text-sky-600"
          />
          <DashboardEcomStatCard
            compact
            label="Outstanding debts"
            value={metrics.outstandingDebtsDisplay}
            trend="-2.3%"
            trendUp={false}
            icon={TrendingDown}
            iconClassName="bg-rose-100 text-rose-600"
          />
          <DashboardEcomStatCard
            compact
            label="Total expenses"
            value={metrics.totalExpensesDisplay}
            icon={ArrowDownCircle}
            iconClassName="bg-orange-100 text-orange-600"
          />
          <DashboardEcomStatCard
            compact
            label="Actual net profit"
            value={metrics.actualNetProfitDisplay}
            trend="+4.6%"
            icon={TrendingUp}
            iconClassName="bg-emerald-100 text-emerald-600"
          />
        </div>
      </DashboardEcomSection>

      <div className="grid gap-5 xl:grid-cols-12">
        <DashboardEcomCard className="xl:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-2 pt-5">
            <div>
              <h2 className="text-[15px] font-bold text-ink">Sales overview</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Revenue & orders · {periodLabel.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="px-5 pb-5">
            <DashboardFinancialCharts data={chartData} />
          </div>
        </DashboardEcomCard>

        <div className="xl:col-span-5">
          <DashboardHomeBestProducts rows={data.topProducts} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <DashboardHomeProductsGrid rows={data.topProducts} />
        </div>
        <div className="xl:col-span-5">
          <DashboardHomeRecentOrders orders={data.orders} />
        </div>
      </div>

      <DashboardEcomSection title="Notifications" description="Alerts that need attention">
        <DashboardNotificationsPanel items={data.notifications} />
      </DashboardEcomSection>
    </div>
  );
}
