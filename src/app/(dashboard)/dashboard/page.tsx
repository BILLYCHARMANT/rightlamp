import {
  BarChart3,
  ExternalLink,
  Package,
  Receipt,
  ShoppingBag,
  Sparkles,
  Store,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { DashboardHomeIntro } from "@/components/dashboard/dashboard-home-intro";
import { DashboardOverviewMetrics } from "@/components/dashboard/dashboard-overview-metrics";
import { DashboardQuickActionCard } from "@/components/dashboard/quick-action-card";
import { DashboardRecentOrdersPanel } from "@/components/dashboard/dashboard-recent-orders";
import { DashboardRecentStrip } from "@/components/dashboard/dashboard-recent-strip";
import { DashboardScheduledVisits } from "@/components/dashboard/dashboard-scheduled-visits";
import { getDashboardOverviewStats } from "@/lib/dashboard/overview-stats";

export default async function DashboardHomePage() {
  const stats = await getDashboardOverviewStats();

  return (
    <div className="space-y-10 p-4 md:p-8">
      <DashboardHomeIntro />

      <DashboardRecentStrip />

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Frequent jumps
          </h2>
          <p className="max-w-md text-[11px] leading-snug text-muted-foreground">
            Same destinations as production admin — grouped here so daily workflows stay two taps away.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <DashboardQuickActionCard
            icon={<ShoppingBag size={24} aria-hidden />}
            label="Orders"
            href="/dashboard/orders"
          />
          <DashboardQuickActionCard
            icon={<Package size={24} aria-hidden />}
            label="Products"
            href="/dashboard/products"
          />
          <DashboardQuickActionCard
            icon={<Warehouse size={24} aria-hidden />}
            label="Stock"
            href="/dashboard/stock"
          />
          <DashboardQuickActionCard
            icon={<Store size={24} aria-hidden />}
            label="My shop"
            href="/dashboard/my-shop"
          />
          <DashboardQuickActionCard
            icon={<Sparkles size={24} aria-hidden />}
            label="Specials"
            href="/dashboard/specials"
          />
          <DashboardQuickActionCard
            icon={<Receipt size={24} aria-hidden />}
            label="Expenses"
            href="/dashboard/expenses"
          />
          <DashboardQuickActionCard
            icon={<BarChart3 size={24} aria-hidden />}
            label="Reports"
            href="/dashboard/reports"
          />
          <DashboardQuickActionCard
            icon={<UsersRound size={24} aria-hidden />}
            label="Staff users"
            href="/dashboard/users"
          />
          <DashboardQuickActionCard
            icon={<ExternalLink size={24} aria-hidden />}
            label="Live storefront"
            href="/shop"
          />
        </div>
      </section>

      <DashboardOverviewMetrics stats={stats} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardRecentOrdersPanel />
        </div>
        <div className="lg:col-span-1">
          <DashboardScheduledVisits />
        </div>
      </div>
    </div>
  );
}
