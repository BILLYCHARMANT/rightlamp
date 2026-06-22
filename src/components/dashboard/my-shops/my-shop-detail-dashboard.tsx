"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  Download,
  FileSpreadsheet,
  MapPin,
  Package,
  UsersRound,
} from "lucide-react";
import type { ShopActivityRow, ShopDetail } from "@/lib/dashboard/shop-queries";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import {
  buildDistributionSeries,
  formatShopPeriodLabel,
  SHOP_METRIC_PALETTE,
  ShopMetricCard,
  ShopMetricCardsGrid,
} from "@/components/dashboard/my-shops/shop-metric-cards";
import {
  ShopDistributionChart,
  ShopTrendChart,
} from "@/components/dashboard/my-shops/shop-mini-charts";
import { DashboardTablePagination } from "@/components/dashboard/ui/dashboard-table-pagination";

type Props = {
  shop: ShopDetail;
  activity: {
    rows: ShopActivityRow[];
    total: number;
    page: number;
    pageSize: number;
  };
};

type TabId = "overview" | "inventory" | "analytics" | "staff" | "activity";

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function MyShopDetailDashboard({ shop, activity }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>("overview");

  const dateFrom = searchParams.get("from") ?? "";
  const dateTo = searchParams.get("to") ?? "";
  const periodLabel = formatShopPeriodLabel(dateFrom, dateTo);

  const kpis = useMemo(() => {
    const marginPct =
      shop.totalSalesCents > 0
        ? Math.round((shop.totalProfitCents / shop.totalSalesCents) * 100)
        : 0;
    const salesSeries =
      shop.salesTrend.length > 1
        ? shop.salesTrend.map((point) => point.salesCents)
        : buildDistributionSeries([shop.totalSalesCents]);
    const profitSeries =
      shop.salesTrend.length > 1
        ? shop.salesTrend.map((point) => point.profitCents)
        : buildDistributionSeries([shop.totalProfitCents]);
    const inventorySeries = buildDistributionSeries(
      shop.inventory.map((row) => row.inventoryCostCents),
    );
    const assignedSeries = buildDistributionSeries(
      shop.inventory.map((row) => row.quantity),
    );
    const soldSeries = buildDistributionSeries(
      shop.inventory.map((row) => row.quantitySold),
    );
    const remainingSeries = buildDistributionSeries(
      shop.inventory.map((row) => row.remaining),
    );

    return [
      {
        ...SHOP_METRIC_PALETTE.inventory,
        label: "Assigned inventory cost",
        value: formatMoneyFromCents(shop.assignedInventoryCostCents, shop.currency),
        trend: `${shop.inventory.length} SKUs on hand`,
        trendUp: shop.assignedInventoryCostCents > 0,
        series: inventorySeries,
      },
      {
        ...SHOP_METRIC_PALETTE.sales,
        label: "Total sales",
        value: formatMoneyFromCents(shop.totalSalesCents, shop.currency),
        trend:
          shop.totalSalesCents > 0
            ? `${shop.topProducts.length} products contributing`
            : "No sales recorded yet",
        trendUp: shop.totalSalesCents > 0,
        series: salesSeries,
      },
      {
        ...SHOP_METRIC_PALETTE.profit,
        label: "Total profit",
        value: formatMoneyFromCents(shop.totalProfitCents, shop.currency),
        trend:
          shop.totalSalesCents > 0 ? `${marginPct}% profit margin` : "Awaiting first sale",
        trendUp: shop.totalProfitCents >= 0,
        series: profitSeries,
      },
      {
        ...SHOP_METRIC_PALETTE.assigned,
        label: "Products assigned",
        value: shop.productsAssigned.toLocaleString(),
        trend: `${shop.inventory.length} product lines stocked`,
        trendUp: shop.productsAssigned > 0,
        series: assignedSeries,
      },
      {
        ...SHOP_METRIC_PALETTE.revenue,
        label: "Products sold",
        value: shop.productsSold.toLocaleString(),
        trend: `${shop.topProducts[0]?.productName ?? "No sales"} leading`,
        trendUp: shop.productsSold > 0,
        series: soldSeries,
      },
      {
        ...SHOP_METRIC_PALETTE.stock,
        label: "Remaining stock",
        value: shop.remainingStock.toLocaleString(),
        trend: `${shop.productsAssigned > 0 ? Math.round((shop.productsSold / shop.productsAssigned) * 100) : 0}% sell-through`,
        trendUp: shop.remainingStock > 0,
        series: remainingSeries,
      },
    ];
  }, [shop]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "inventory", label: "Inventory" },
    { id: "analytics", label: "Analytics" },
    { id: "staff", label: "Staff" },
    { id: "activity", label: "Activity log" },
  ];

  const activityPages = Math.max(1, Math.ceil(activity.total / activity.pageSize));

  function setActivityPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("activityPage", String(next + 1));
    startTransition(() => {
      router.push(`/dashboard/my-shops/${shop.id}?${params.toString()}`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/my-shops"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            <ArrowLeft size={16} aria-hidden />
            All shops
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {shop.name}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} aria-hidden />
            {shop.location ?? "No location set"}
            <span>·</span>
            <span>{shop.active ? "Active" : "Inactive"}</span>
            {shop.isMain ? <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold">Main</span> : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/my-shops/${shop.id}/export?format=csv`}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm"
          >
            <FileSpreadsheet size={16} aria-hidden />
            Export Excel
          </a>
          <a
            href={`/api/my-shops/${shop.id}/export?format=pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-ink shadow-sm"
          >
            <Download size={16} aria-hidden />
            Export PDF
          </a>
        </div>
      </div>

      <ShopMetricCardsGrid columns={3}>
        {kpis.map((kpi) => (
          <ShopMetricCard key={kpi.label} {...kpi} periodLabel={periodLabel} />
        ))}
      </ShopMetricCardsGrid>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === item.id
                ? "bg-brand text-ink shadow-sm"
                : "text-muted-foreground hover:bg-slate-100 hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-ink">Shop information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Code</dt>
                <dd className="font-medium text-ink">{shop.code ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Phone</dt>
                <dd className="font-medium text-ink">{shop.phone ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Manager</dt>
                <dd className="font-medium text-ink">
                  {shop.staff[0]?.name ?? shop.staff[0]?.email ?? "Unassigned"}
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-ink">Top-selling products</h2>
            <ul className="mt-4 space-y-3">
              {shop.topProducts.length === 0 ? (
                <li className="text-sm text-muted-foreground">No sales recorded for this shop yet.</li>
              ) : (
                shop.topProducts.map((product) => (
                  <li key={product.productName} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">{product.productName}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {product.quantitySold} sold ·{" "}
                      {formatMoneyFromCents(product.revenueCents, shop.currency)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      ) : null}

      {tab === "inventory" ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Assigned</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Unit cost</th>
                <th className="px-4 py-3">Inventory value</th>
              </tr>
            </thead>
            <tbody>
              {shop.inventory.map((row) => (
                <tr key={row.productId} className="border-b border-border/70 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">{row.productName}</div>
                    <div className="text-xs text-muted-foreground">{row.sku}</div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.quantity}</td>
                  <td className="px-4 py-3 tabular-nums">{row.quantitySold}</td>
                  <td className="px-4 py-3 tabular-nums">{row.remaining}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoneyFromCents(row.unitCostCents, row.currency)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatMoneyFromCents(row.inventoryCostCents, row.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shop.inventory.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No inventory assigned. Transfer stock from Stock to this shop.
            </p>
          ) : null}
        </div>
      ) : null}

      {tab === "analytics" ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <ShopTrendChart
            title="Sales trends"
            stroke="#6366f1"
            points={shop.salesTrend.map((point) => ({
              label: point.label,
              value: point.salesCents,
            }))}
            formatValue={(value) => formatMoneyFromCents(value, shop.currency)}
          />
          <ShopTrendChart
            title="Profit trends"
            stroke="#22c55e"
            points={shop.profitTrend.map((point) => ({
              label: point.label,
              value: point.profitCents,
            }))}
            formatValue={(value) => formatMoneyFromCents(value, shop.currency)}
          />
          <div className="xl:col-span-2">
            <ShopDistributionChart
              title="Inventory distribution"
              slices={shop.inventoryDistribution.map((slice) => ({
                label: slice.label,
                value: slice.valueCents,
              }))}
              formatValue={(value) => formatMoneyFromCents(value, shop.currency)}
            />
          </div>
        </div>
      ) : null}

      {tab === "staff" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shop.staff.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff assigned to this shop.</p>
          ) : (
            shop.staff.map((member) => (
              <article
                key={member.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <UsersRound size={18} aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-ink">{member.name ?? member.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {member.email} · {member.role}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "activity" ? (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Date & time</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {activity.rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/70 last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap">{formatWhen(row.createdAt)}</td>
                    <td className="px-4 py-3">{row.userName ?? row.userEmail ?? "System"}</td>
                    <td className="px-4 py-3">{row.actionLabel}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activity.rows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No activity recorded yet.
              </p>
            ) : null}
          </div>
          <DashboardTablePagination
            page={activity.page - 1}
            pages={activityPages}
            total={activity.total}
            pageSize={activity.pageSize}
            itemLabel="events"
            onPage={setActivityPage}
          />
        </div>
      ) : null}

      {tab === "overview" ? (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Package size={14} aria-hidden />
          Assign inventory via Stock transfers with a destination branch.
        </p>
      ) : null}
    </div>
  );
}
