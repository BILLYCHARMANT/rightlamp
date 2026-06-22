"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  LayoutGrid,
  MapPin,
  Search,
  Store,
  Table2,
  TrendingUp,
} from "lucide-react";
import type { ShopsOverviewResult, ShopSummary } from "@/lib/dashboard/shop-queries";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DashboardTablePagination } from "@/components/dashboard/ui/dashboard-table-pagination";
import {
  buildDistributionSeries,
  formatShopPeriodLabel,
  SHOP_METRIC_PALETTE,
  ShopMetricCard,
  ShopMetricCardsGrid,
} from "@/components/dashboard/my-shops/shop-metric-cards";

type Props = {
  data: ShopsOverviewResult;
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function managerLabel(shop: ShopSummary) {
  if (shop.managers.length === 0) return "Unassigned";
  const first = shop.managers[0]!;
  const label = first.name ?? first.email;
  if (shop.managers.length === 1) return label;
  return `${label} +${shop.managers.length - 1}`;
}

export function MyShopsDashboard({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [view, setView] = useState<"cards" | "table">("cards");

  const query = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  function pushFilters(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    if (!next.page) params.set("page", "1");
    startTransition(() => {
      router.push(`/dashboard/my-shops?${params.toString()}`);
    });
  }

  const periodLabel = formatShopPeriodLabel(dateFrom, dateTo);

  const statCards = useMemo(() => {
    const marginPct =
      data.totals.totalSalesCents > 0
        ? Math.round((data.totals.totalProfitCents / data.totals.totalSalesCents) * 100)
        : 0;
    const utilizationPct =
      data.totals.productsAssigned > 0
        ? Math.round((data.totals.productsSold / data.totals.productsAssigned) * 100)
        : 0;

    return [
      {
        ...SHOP_METRIC_PALETTE.inventory,
        label: "Assigned inventory",
        value: formatMoneyFromCents(data.totals.assignedInventoryCostCents, "RWF"),
        trend: `${data.total.toLocaleString()} shops · ${data.totals.productsAssigned.toLocaleString()} units`,
        trendUp: data.totals.productsAssigned > 0,
        series: buildDistributionSeries(
          data.shops.map((shop) => shop.assignedInventoryCostCents),
        ),
      },
      {
        ...SHOP_METRIC_PALETTE.sales,
        label: "Total sales",
        value: formatMoneyFromCents(data.totals.totalSalesCents, "RWF"),
        trend:
          data.totals.totalSalesCents > 0
            ? `${data.shops.filter((s) => s.totalSalesCents > 0).length} shops with revenue`
            : "No sales in this period",
        trendUp: data.totals.totalSalesCents > 0,
        series: buildDistributionSeries(data.shops.map((shop) => shop.totalSalesCents)),
      },
      {
        ...SHOP_METRIC_PALETTE.profit,
        label: "Total profit",
        value: formatMoneyFromCents(data.totals.totalProfitCents, "RWF"),
        trend:
          data.totals.totalSalesCents > 0
            ? `${marginPct}% margin across shops`
            : "Profit follows fulfilled sales",
        trendUp: data.totals.totalProfitCents >= 0,
        series: buildDistributionSeries(data.shops.map((shop) => shop.totalProfitCents)),
      },
      {
        ...SHOP_METRIC_PALETTE.stock,
        label: "Remaining stock",
        value: data.totals.remainingStock.toLocaleString(),
        trend: `${utilizationPct}% sold · ${data.totals.productsSold.toLocaleString()} units moved`,
        trendUp: data.totals.remainingStock > 0,
        series: buildDistributionSeries(data.shops.map((shop) => shop.remainingStock)),
      },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Multi-branch
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">My Shops</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Central view of inventory value, sales, profit, staff, and activity across all shops.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("cards")}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
              view === "cards"
                ? "border-brand/40 bg-brand/10 text-ink"
                : "border-border bg-white text-muted-foreground"
            }`}
          >
            <LayoutGrid size={16} aria-hidden />
            Cards
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
              view === "table"
                ? "border-brand/40 bg-brand/10 text-ink"
                : "border-border bg-white text-muted-foreground"
            }`}
          >
            <Table2 size={16} aria-hidden />
            Table
          </button>
        </div>
      </div>

      <ShopMetricCardsGrid columns={4}>
        {statCards.map((card) => (
          <ShopMetricCard key={card.label} {...card} periodLabel={periodLabel} />
        ))}
      </ShopMetricCardsGrid>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-elevated p-4 shadow-sm lg:flex-row lg:flex-wrap lg:items-end">
        <label className="min-w-[12rem] flex-1">
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">Search</span>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              defaultValue={query}
              placeholder="Shop name, code, location…"
              className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  pushFilters({ q: e.currentTarget.value.trim() || undefined });
                }
              }}
            />
          </div>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">Status</span>
          <select
            value={status}
            onChange={(e) => pushFilters({ status: e.target.value })}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="all">All shops</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">From</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => pushFilters({ from: e.target.value || undefined })}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">To</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => pushFilters({ to: e.target.value || undefined })}
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => pushFilters({ q: query, status, from: dateFrom, to: dateTo })}
          disabled={pending}
          className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-ink shadow-sm"
        >
          Apply filters
        </button>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.shops.map((shop) => (
            <Link
              key={shop.id}
              href={`/dashboard/my-shops/${shop.id}`}
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-brand/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Store size={18} className="text-brand" aria-hidden />
                    <h2 className="font-bold text-ink">{shop.name}</h2>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {shop.location ?? "No location"} · {shop.active ? "Active" : "Inactive"}
                  </p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-brand"
                  aria-hidden
                />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Inventory cost</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {formatMoneyFromCents(shop.assignedInventoryCostCents, shop.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Sales</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {formatMoneyFromCents(shop.totalSalesCents, shop.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Profit</dt>
                  <dd className="font-semibold tabular-nums text-emerald-700">
                    {formatMoneyFromCents(shop.totalProfitCents, shop.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Remaining</dt>
                  <dd className="font-semibold tabular-nums text-ink">
                    {shop.remainingStock.toLocaleString()} units
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Manager: {managerLabel(shop)} · Assigned {shop.productsAssigned.toLocaleString()} ·
                Sold {shop.productsSold.toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Inventory cost</th>
                <th className="px-4 py-3">Sales</th>
                <th className="px-4 py-3">Profit</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Manager</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.shops.map((shop) => (
                <tr key={shop.id} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{shop.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {shop.code ?? "—"} · {formatWhen(shop.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoneyFromCents(shop.assignedInventoryCostCents, shop.currency)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoneyFromCents(shop.totalSalesCents, shop.currency)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-emerald-700">
                    {formatMoneyFromCents(shop.totalProfitCents, shop.currency)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{shop.productsAssigned.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular-nums">{shop.productsSold.toLocaleString()}</td>
                  <td className="px-4 py-3 tabular-nums">{shop.remainingStock.toLocaleString()}</td>
                  <td className="px-4 py-3">{managerLabel(shop)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/my-shops/${shop.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                    >
                      View
                      <TrendingUp size={14} aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.shops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-elevated px-6 py-12 text-center">
          <MapPin className="mx-auto text-muted-foreground" aria-hidden />
          <p className="mt-3 font-semibold text-ink">No shops match your filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create branches under Branches, then transfer stock to assign inventory.
          </p>
          <Link href="/dashboard/branches" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
            Manage branches
          </Link>
        </div>
      ) : null}

      <DashboardTablePagination
        page={data.page - 1}
        pages={pages}
        total={data.total}
        pageSize={data.pageSize}
        itemLabel="shops"
        onPage={(next) => pushFilters({ page: String(next + 1) })}
      />
    </div>
  );
}
