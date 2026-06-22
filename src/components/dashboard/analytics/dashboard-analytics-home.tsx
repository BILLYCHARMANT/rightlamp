"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  ChevronDown,
  Filter,
  LayoutGrid,
  Menu,
  Search,
} from "lucide-react";
import type { DashboardAnalyticsPayload } from "@/lib/dashboard/dashboard-analytics-data";
import {
  AnalyticsBarPanel,
  AnalyticsCard,
  AnalyticsDonutPanel,
  AnalyticsMetricCard,
  AnalyticsPagesList,
  AnalyticsRealtimeList,
  AnalyticsSiteTrafficCard,
  AnalyticsWidgetHeader,
  DEVICE_CHANNEL_COLORS,
  formatCentsShort,
  formatTrend,
  seriesValues,
  sumSeries,
} from "@/components/dashboard/analytics/analytics-charts";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { useDashboardNav } from "@/components/dashboard/dashboard-nav-context";
import {
  buildChartSeries,
  computeFinancialMetrics,
  FINANCIAL_PERIOD_OPTIONS,
  periodRange,
  type FinancialPeriod,
} from "@/lib/dashboard/financial-period";

type Props = {
  data: DashboardAnalyticsPayload;
};

const KPI_PERIOD_OPTIONS: { id: FinancialPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Last week" },
  { id: "month", label: "Last month" },
  { id: "quarter", label: "Last quarter" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
];

function ordersInPeriod(
  orders: DashboardAnalyticsPayload["orders"],
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

function previousPeriodRange(period: FinancialPeriod) {
  const { start, end } = periodRange(period);
  if (!start) {
    return { start: null, end: new Date(0) };
  }
  const duration = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - duration);
  return { start: prevStart, end: prevEnd };
}

function ordersBetween(
  orders: DashboardAnalyticsPayload["orders"],
  start: Date | null,
  end: Date,
) {
  return orders.filter((o) => {
    const t = new Date(o.placedAt);
    if (start && t < start) return false;
    return t <= end;
  });
}

function withDeviceColors(
  slices: DashboardAnalyticsPayload["orderChannels"],
): DashboardAnalyticsPayload["orderChannels"] {
  return slices.map((slice, index) => ({
    ...slice,
    color: DEVICE_CHANNEL_COLORS[index % DEVICE_CHANNEL_COLORS.length] ?? slice.color,
  }));
}

export function DashboardAnalyticsHome({ data }: Props) {
  const [period, setPeriod] = useState<FinancialPeriod>("month");
  const { toggleMobileNav } = useDashboardNav();

  const chartData = useMemo(
    () => buildChartSeries(period, data.orders, data.expenses),
    [period, data.orders, data.expenses],
  );

  const metrics = useMemo(
    () => computeFinancialMetrics(period, data.orders, data.expenses, data.debts),
    [period, data.orders, data.expenses, data.debts],
  );

  const periodOrders = useMemo(
    () => ordersInPeriod(data.orders, period),
    [data.orders, period],
  );

  const uniqueCustomers = useMemo(
    () => new Set(periodOrders.map((o) => o.customer)).size,
    [periodOrders],
  );

  const prevRange = useMemo(() => previousPeriodRange(period), [period]);
  const prevOrders = useMemo(
    () => ordersBetween(data.orders, prevRange.start, prevRange.end),
    [data.orders, prevRange.end, prevRange.start],
  );

  const revenueTrend = formatTrend(
    sumSeries(chartData, "salesCents"),
    prevOrders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.totalCents, 0),
  );
  const ordersTrend = formatTrend(periodOrders.length, prevOrders.length);
  const customersTrend = formatTrend(
    uniqueCustomers,
    new Set(prevOrders.map((o) => o.customer)).size,
  );

  const periodLabel =
    FINANCIAL_PERIOD_OPTIONS.find((option) => option.id === period)?.label ??
    "This month";

  const expenseTotal = data.expenseCategories.reduce((sum, s) => sum + s.value, 0);
  const channelTotal = data.orderChannels.reduce((sum, s) => sum + s.value, 0);
  const channelSlices = withDeviceColors(data.orderChannels);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-20 flex flex-col gap-4 bg-[#f8fafc]/95 px-4 py-4 backdrop-blur sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <button
            type="button"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 lg:hidden"
            aria-label="Open navigation"
            onClick={toggleMobileNav}
          >
            <Menu size={18} aria-hidden />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <div className="hidden items-center gap-2 sm:flex">
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as FinancialPeriod)}
                className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-4 pr-8 text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Overview"
              >
                <option value="month">Overview</option>
                {FINANCIAL_PERIOD_OPTIONS.filter((o) => o.id !== "month").map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-indigo-600"
                aria-label="Filter"
              >
                <Filter size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-indigo-600"
                aria-label="Layout"
              >
                <LayoutGrid size={16} aria-hidden />
              </button>
              <button
                type="button"
                className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-indigo-600"
                aria-label="Notifications"
              >
                <Bell size={16} aria-hidden />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full border border-white bg-red-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search"
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-64"
            />
          </div>
          <div className="hidden items-center gap-2 border-l border-slate-200 pl-4 sm:flex">
            <DashboardUserMenu />
          </div>
          <div className="relative sm:hidden">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as FinancialPeriod)}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-slate-600"
              aria-label="Reporting period"
            >
              {FINANCIAL_PERIOD_OPTIONS.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pb-10 pt-2 sm:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          <div className="sm:col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-1">
            <AnalyticsMetricCard
              label="Sessions"
              value={metrics.periodSalesDisplay}
              trend={revenueTrend.label}
              trendUp={revenueTrend.up}
              series={seriesValues(chartData, "salesCents")}
              accentColor="#f97316"
              trendClassName="text-orange-500"
              period={period}
              onPeriodChange={setPeriod}
              periodOptions={KPI_PERIOD_OPTIONS}
            />
          </div>
          <div className="sm:col-span-1 lg:col-span-3 lg:col-start-4 lg:row-start-1">
            <AnalyticsMetricCard
              label="Users"
              value={metrics.periodTransactions.toLocaleString()}
              trend={ordersTrend.label}
              trendUp={ordersTrend.up}
              series={seriesValues(chartData, "transactions")}
              accentColor="#ef4444"
              trendClassName="text-red-500"
              period={period}
              onPeriodChange={setPeriod}
              periodOptions={KPI_PERIOD_OPTIONS}
            />
          </div>
          <div className="sm:col-span-1 lg:col-span-3 lg:col-start-7 lg:row-start-1">
            <AnalyticsMetricCard
              label="Time spent"
              value={uniqueCustomers.toLocaleString()}
              trend={customersTrend.label}
              trendUp={customersTrend.up}
              series={seriesValues(chartData, "transactions")}
              accentColor="#6366f1"
              trendClassName="text-indigo-500"
              period={period}
              onPeriodChange={setPeriod}
              periodOptions={KPI_PERIOD_OPTIONS}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1">
            <AnalyticsDonutPanel
              title="Devices"
              actionLabel="Today"
              slices={channelSlices}
              centerLabel="Total"
              centerValue={channelTotal.toLocaleString()}
              tall
            />
          </div>

          <div className="sm:col-span-1 lg:col-span-3 lg:col-start-1 lg:row-start-2">
            <AnalyticsCard>
              <AnalyticsWidgetHeader title="Real-time Data" />
              <AnalyticsRealtimeList rows={data.orderStatus} />
            </AnalyticsCard>
          </div>

          <div className="sm:col-span-2 lg:col-span-6 lg:col-start-4 lg:row-start-2">
            <AnalyticsSiteTrafficCard data={chartData} periodLabel={periodLabel} />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 lg:col-start-1 lg:row-start-3">
            <AnalyticsDonutPanel
              title="Traffic from social"
              actionLabel="Last week"
              slices={data.expenseCategories}
              centerLabel="Total"
              centerValue={formatCentsShort(expenseTotal)}
              formatValue={(value) => formatCentsShort(value)}
              horizontalLegend
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-5 lg:col-start-5 lg:row-start-3">
            <AnalyticsBarPanel title="Middle time on site" actionLabel="Last 14 days" data={chartData} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 lg:col-start-10 lg:row-start-3">
            <AnalyticsPagesList rows={data.rankedProducts} actionLabel="Last month" />
          </div>
        </div>
      </div>
    </div>
  );
}
