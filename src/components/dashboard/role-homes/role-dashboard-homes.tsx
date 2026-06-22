import Link from "next/link";
import {
  BarChart3,
  Package,
  ShoppingBag,
  Store,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import type { DashboardHomePayload } from "@/lib/dashboard/dashboard-home";
import type { ShopsOverviewResult } from "@/lib/dashboard/shop-queries";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { dashboardEcomStatCardClass } from "@/components/dashboard/ui/dashboard-ecom";
import { formatStaffRoleLabel } from "@/lib/dashboard/rbac";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <article className={dashboardEcomStatCardClass}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </article>
  );
}

function QuickLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: typeof ShoppingBag;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/30 hover:bg-brand/5"
    >
      <Icon size={18} className="text-brand" aria-hidden />
      {label}
    </Link>
  );
}

type MainStoreProps = {
  roleLabel: string;
  home: DashboardHomePayload;
};

export function MainStoreManagerHome({ roleLabel, home }: MainStoreProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {roleLabel}
        </p>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Central operations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Warehouse stock, branch transfers, and network-wide sales.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Units on hand" value={home.stock.unitsOnHand.toLocaleString()} />
        <StatCard
          label="Inventory value"
          value={home.stock.inventoryCostDisplay}
        />
        <StatCard label="Open orders" value={String(home.orders.pending + home.orders.processing)} />
        <StatCard label="Week revenue" value={home.orders.weekRevenueDisplay} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/dashboard/stock" label="Stock & transfers" icon={Warehouse} />
        <QuickLink href="/dashboard/my-shops" label="All shops" icon={Store} />
        <QuickLink href="/dashboard/orders" label="Orders" icon={ShoppingBag} />
        <QuickLink href="/dashboard/products" label="Products" icon={Package} />
      </div>
    </div>
  );
}

type BranchManagerProps = {
  roleLabel: string;
  home: DashboardHomePayload;
  branchName: string | null;
  branchId: string | null;
  shopStats: ShopsOverviewResult | null;
};

export function BranchManagerHome({
  roleLabel,
  home,
  branchName,
  branchId,
  shopStats,
}: BranchManagerProps) {
  const shop = shopStats?.shops[0];
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {roleLabel}
        </p>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">
          {branchName ?? "Your branch"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Local sales, assigned stock, and branch performance.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Branch sales"
          value={
            shop
              ? formatMoneyFromCents(shop.totalSalesCents, shop.currency)
              : home.orders.weekRevenueDisplay
          }
        />
        <StatCard
          label="Profit"
          value={
            shop
              ? formatMoneyFromCents(shop.totalProfitCents, shop.currency)
              : "—"
          }
        />
        <StatCard
          label="Remaining stock"
          value={shop ? shop.remainingStock.toLocaleString() : "—"}
        />
        <StatCard label="Open orders" value={String(home.orders.pending + home.orders.processing)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/dashboard/orders" label="Branch orders" icon={ShoppingBag} />
        {branchId ? (
          <QuickLink
            href={`/dashboard/my-shops/${branchId}`}
            label="Shop details"
            icon={Store}
          />
        ) : null}
        <QuickLink href="/dashboard/products" label="Product catalog" icon={Package} />
      </div>
    </div>
  );
}

type BranchSellerProps = {
  roleLabel: string;
  home: DashboardHomePayload;
  branchName: string | null;
};

export function BranchSellerHome({ roleLabel, home, branchName }: BranchSellerProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {roleLabel}
        </p>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Sales desk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {branchName
            ? `Recording orders for ${branchName}.`
            : "Create and track customer orders."}
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending orders" value={String(home.orders.pending)} />
        <StatCard label="Processing" value={String(home.orders.processing)} />
        <StatCard label="Fulfilled this week" value={String(home.orders.fulfilledWeek)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink href="/dashboard/orders" label="Orders dashboard" icon={ShoppingBag} />
        <QuickLink href="/dashboard/products" label="View products" icon={Package} />
      </div>
    </div>
  );
};

type PartnerProps = {
  roleLabel: string;
  shops: ShopsOverviewResult;
};

export function PartnerInvestorHome({ roleLabel, shops }: PartnerProps) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {roleLabel}
        </p>
        <h1 className="text-2xl font-bold text-ink md:text-3xl">Performance overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only view of shop revenue, inventory value, and profitability.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total sales"
          value={formatMoneyFromCents(shops.totals.totalSalesCents, "RWF")}
        />
        <StatCard
          label="Total profit"
          value={formatMoneyFromCents(shops.totals.totalProfitCents, "RWF")}
        />
        <StatCard
          label="Assigned inventory"
          value={formatMoneyFromCents(shops.totals.assignedInventoryCostCents, "RWF")}
        />
        <StatCard
          label="Active shops"
          value={shops.shops.filter((s) => s.active).length.toLocaleString()}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickLink href="/dashboard/my-shops" label="Shop network" icon={Store} />
        <QuickLink href="/dashboard/reports" label="Reports" icon={BarChart3} />
      </div>
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <TrendingUp size={16} className="text-emerald-600" aria-hidden />
          Top shops by sales
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          {[...shops.shops]
            .sort((a, b) => b.totalSalesCents - a.totalSalesCents)
            .slice(0, 5)
            .map((shop) => (
              <li
                key={shop.id}
                className="flex items-center justify-between border-b border-border/60 py-2 last:border-0"
              >
                <span>{shop.name}</span>
                <span className="tabular-nums font-medium">
                  {formatMoneyFromCents(shop.totalSalesCents, shop.currency)}
                </span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}

export function roleLabelFromSession(role: string) {
  return formatStaffRoleLabel(role);
}
