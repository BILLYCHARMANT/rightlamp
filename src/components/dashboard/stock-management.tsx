"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  DollarSign,
  History,
  Layers,
  Package,
  Plus,
  Search,
  Truck,
} from "lucide-react";
import { STOCK_FLOW_BY_PERIOD } from "@/lib/dashboard/demo-data";
import { submitStockChange } from "@/lib/dashboard/stock-actions";
import type {
  MovementFlowPoint,
  StockLowRow,
  StockMovementReasonCode,
  StockMovementRow,
  StockOverviewStats,
  StockProductDetail,
} from "@/lib/dashboard/stock-shared-types";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";

function mapOutboundToolbarReason(code: string): StockMovementReasonCode {
  switch (code) {
    case "WASTE":
      return "WASTE";
    case "TRANSFER":
      return "TRANSFER";
    case "ADJUSTMENT":
      return "ADJUSTMENT";
    default:
      return "OTHER";
  }
}

type PodTab =
  | "overview"
  | "suppliers"
  | "items"
  | "receive"
  | "stockout"
  | "currentstock"
  | "history";

type FlowPeriod = "daily" | "weekly" | "monthly" | "yearly";

function StockPanelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-elevated/95 shadow-sm backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

function StockTableTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="w-full pb-1 pt-0 text-center text-lg font-bold uppercase tracking-wide text-ink sm:text-xl">
      {children}
    </h3>
  );
}

function OverviewMetricCard({
  icon: Icon,
  label,
  value,
  iconWrapClass = "bg-brand/15 text-brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  iconWrapClass?: string;
}) {
  return (
    <StockPanelCard className="p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconWrapClass}`}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="truncate text-xl font-semibold tabular-nums text-ink">
            {value}
          </p>
        </div>
      </div>
    </StockPanelCard>
  );
}

function StockFlowChart({
  period,
  onPeriod,
  weeklyFlowLive,
}: {
  period: FlowPeriod;
  onPeriod: (p: FlowPeriod) => void;
  weeklyFlowLive: MovementFlowPoint[] | null;
}) {
  const usingLive =
    !!weeklyFlowLive &&
    weeklyFlowLive.some((row) => row.in > 0 || row.out > 0);
  const data = usingLive ? weeklyFlowLive! : STOCK_FLOW_BY_PERIOD[period];
  const max = Math.max(...data.flatMap((d) => [d.in, d.out]), 1);

  return (
    <StockPanelCard className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-ink">
          Stock flow – how stock-in covers stock-out
        </h3>
        <div className="flex flex-wrap gap-2">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              disabled={usingLive}
              onClick={() => onPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                period === p
                  ? "bg-brand/94 text-ink ring-1 ring-brand/15"
                  : "bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-ink"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {usingLive
          ? "Weekly totals from recorded movements (append-only ledger tied to each SKU)."
          : "Illustrative demo until enough movements accumulate — same chart shell Rightlamps crews expect."}
      </p>
      <div className="flex h-72 items-end gap-2 border-b border-border pb-2 pt-2">
        {data.map((row) => (
          <div
            key={row.label}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="flex h-56 w-full items-end justify-center gap-1 px-0.5">
              <div
                className="max-w-[48%] flex-1 rounded-t-md bg-success/85 shadow-sm ring-1 ring-success/25"
                style={{
                  height: `${Math.max(10, Math.round((row.in / max) * 100))}%`,
                  minHeight: "8px",
                }}
                title={`In: ${row.in}`}
              />
              <div
                className="max-w-[48%] flex-1 rounded-t-md bg-danger/80 shadow-sm ring-1 ring-danger/25"
                style={{
                  height: `${Math.max(10, Math.round((row.out / max) * 100))}%`,
                  minHeight: "8px",
                }}
                title={`Out: ${row.out}`}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {row.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-success/85" aria-hidden />
          Stock in
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-danger/80" aria-hidden />
          Stock out
        </span>
      </div>
    </StockPanelCard>
  );
}

function stockLineValue(p: StockProductDetail): string {
  return formatMoneyFromCents(p.priceCents * p.stock, p.currency);
}

function stockStatusRow(p: StockProductDetail): "out" | "low" | "ok" | "draft" {
  if (!p.published) return "draft";
  if (p.stock <= 0) return "out";
  if (p.stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

function StockLevelBadgePod({ row }: { row: StockProductDetail }) {
  const s = stockStatusRow(row);
  const label =
    s === "out"
      ? "out"
      : s === "low"
        ? "low"
        : s === "ok"
          ? "ok"
          : "hidden";
  const cls =
    s === "out"
      ? "text-danger"
      : s === "low"
        ? "text-brand"
        : s === "ok"
          ? "text-success"
          : "text-muted-foreground";
  return (
    <span className={`text-sm font-semibold capitalize ${cls}`}>{label}</span>
  );
}

export function StockManagement({
  products,
  stats,
  inventoryValueDisplay,
  lowOrOutList,
  suppliersCount,
  movements,
  weeklyFlowLive,
}: {
  products: StockProductDetail[];
  stats: StockOverviewStats;
  inventoryValueDisplay: string;
  lowOrOutList: StockLowRow[];
  suppliersCount: number;
  movements: StockMovementRow[];
  weeklyFlowLive: MovementFlowPoint[] | null;
}) {
  const router = useRouter();
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const [tab, setTab] = useState<PodTab>("overview");
  const goToTab = (id: PodTab) => {
    setReceiveModalOpen(false);
    setAdjustModalOpen(false);
    setTab(id);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReorderStatus, setFilterReorderStatus] = useState("");
  const [filterSupplierStatus, setFilterSupplierStatus] = useState("");
  const [filterReceiveStatus, setFilterReceiveStatus] = useState("");
  const [filterStockOutReason, setFilterStockOutReason] = useState("");
  const [filterHistoryType, setFilterHistoryType] = useState("");
  const [flowPeriod, setFlowPeriod] = useState<FlowPeriod>("weekly");

  const [productId, setProductId] = useState("");
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [receiveProductId, setReceiveProductId] = useState("");
  const [receiveQty, setReceiveQty] = useState("");
  const [receiveNote, setReceiveNote] = useState("");
  const [receiveMsg, setReceiveMsg] = useState<string | null>(null);
  const [receivePending, startReceiveTransition] = useTransition();

  const tabs: { id: PodTab; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "items", label: "Items", icon: Package },
    { id: "receive", label: "Stock-In", icon: ArrowDownCircle },
    { id: "stockout", label: "Stock-Out", icon: ArrowUpCircle },
    { id: "currentstock", label: "Current Stock", icon: Layers },
    { id: "history", label: "Stock History", icon: History },
  ];

  const searchPlaceholder =
    tab === "overview"
      ? "Search overview…"
      : tab === "suppliers"
        ? "Search suppliers…"
        : tab === "items"
          ? "Search items…"
          : tab === "currentstock"
            ? "Search current stock…"
            : tab === "receive"
              ? "Search stock-in…"
              : tab === "stockout"
                ? "Search stock-out…"
                : "Search history…";

  const filteredLowOrOut = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lowOrOutList;
    return lowOrOutList.filter((r) => r.name.toLowerCase().includes(q));
  }, [lowOrOutList, searchQuery]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.name} ${p.slug}`.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const filteredCurrentStock = useMemo(() => {
    let rows = products;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter((p) =>
        `${p.name} ${p.slug}`.toLowerCase().includes(q),
      );
    }
    if (filterReorderStatus === "ok") {
      rows = rows.filter((p) => stockStatusRow(p) === "ok");
    } else if (filterReorderStatus === "low") {
      rows = rows.filter((p) => stockStatusRow(p) === "low");
    } else if (filterReorderStatus === "out") {
      rows = rows.filter((p) => stockStatusRow(p) === "out");
    }
    return rows;
  }, [products, searchQuery, filterReorderStatus]);

  const movementMatchesSearch = (m: StockMovementRow, raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) return true;
    return (
      m.productName.toLowerCase().includes(q) ||
      m.note?.toLowerCase().includes(q)
    );
  };

  const filteredInbound = useMemo(() => {
    return movements.filter((m) => {
      if (m.delta <= 0) return false;
      if (
        filterReceiveStatus &&
        (m.receiptStatus ?? "") !== filterReceiveStatus
      ) {
        return false;
      }
      return movementMatchesSearch(m, searchQuery);
    });
  }, [movements, filterReceiveStatus, searchQuery]);

  const filteredOutbound = useMemo(() => {
    return movements.filter((m) => {
      if (m.delta >= 0) return false;
      if (
        filterStockOutReason &&
        m.reason !== mapOutboundToolbarReason(filterStockOutReason)
      ) {
        return false;
      }
      return movementMatchesSearch(m, searchQuery);
    });
  }, [movements, filterStockOutReason, searchQuery]);

  const filteredLedgerHistory = useMemo(() => {
    return movements.filter((m) => {
      if (!filterHistoryType) return movementMatchesSearch(m, searchQuery);
      if (filterHistoryType === "IN") {
        return m.delta > 0 && movementMatchesSearch(m, searchQuery);
      }
      if (filterHistoryType === "OUT") {
        return (
          m.delta < 0 &&
          m.reason !== "ADJUSTMENT" &&
          movementMatchesSearch(m, searchQuery)
        );
      }
      if (filterHistoryType === "ADJUSTMENT") {
        return (
          m.reason === "ADJUSTMENT" && movementMatchesSearch(m, searchQuery)
        );
      }
      return movementMatchesSearch(m, searchQuery);
    });
  }, [movements, filterHistoryType, searchQuery]);

  const attentionSkus = stats.lowStockCount + stats.outOfStockCount;

  const submitAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const d = parseInt(delta, 10);
    if (!productId || Number.isNaN(d) || d === 0) {
      setMsg("Choose a product and a non-zero whole number (+/-).");
      return;
    }
    if (tab === "stockout" && d > 0) {
      setMsg("Stock-Out tab expects a negative quantity (units leaving shelves).");
      return;
    }
    startTransition(async () => {
      const reasonEnum: StockMovementReasonCode =
        d < 0
          ? mapOutboundToolbarReason(filterStockOutReason)
          : "ADJUSTMENT";
      const res = await submitStockChange({
        productId,
        delta: d,
        reason: reasonEnum,
        note: reason.trim() || null,
      });
      if (res.ok) {
        setDelta("");
        setReason("");
        setMsg(null);
        setAdjustModalOpen(false);
        router.refresh();
      } else {
        setMsg(res.message);
      }
    });
  };

  const submitReceive = (e: React.FormEvent) => {
    e.preventDefault();
    setReceiveMsg(null);
    const qty = parseInt(receiveQty, 10);
    if (!receiveProductId || Number.isNaN(qty) || qty <= 0) {
      setReceiveMsg("Choose a SKU and a positive whole quantity.");
      return;
    }
    startReceiveTransition(async () => {
      const res = await submitStockChange({
        productId: receiveProductId,
        delta: qty,
        reason: "RECEIPT",
        note: receiveNote.trim() || null,
        receiptStatus: filterReceiveStatus || null,
      });
      if (res.ok) {
        setReceiveQty("");
        setReceiveNote("");
        setReceiveMsg(null);
        setReceiveModalOpen(false);
        router.refresh();
      } else {
        setReceiveMsg(res.message);
      }
    });
  };

  const tableOverflowTabs: PodTab[] = [
    "items",
    "receive",
    "stockout",
    "currentstock",
    "history",
  ];

  return (
    <div
      className={`flex min-h-0 flex-col gap-2 ${tableOverflowTabs.includes(tab) ? "overflow-hidden" : ""}`}
    >
      {/* Pod Café: page title + breadcrumb row (compact header) */}
      <div className="flex flex-wrap items-start justify-between gap-2 pb-2">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-lg font-bold tracking-tight text-ink md:text-xl">
            Stock management
          </h1>
          <p className="text-xs text-muted-foreground">
            <Link href="/dashboard" className="hover:text-ink">
              Dashboard
            </Link>
            <span className="mx-1">•</span>
            <span className="font-medium text-brand">Stock</span>
          </p>
        </div>
      </div>

      {/* Toolbar: underline tabs + search / filters (Pod stock/page.tsx) */}
      <div className="flex flex-col gap-2 border-b border-border pb-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => goToTab(id)}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === id
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-ink"
              }`}
            >
              <Icon size={16} aria-hidden />
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="relative min-w-0 flex-1 sm:w-52 md:w-56">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-surface py-1 pl-8 pr-2 text-sm text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/25"
            />
          </div>
          {tab === "suppliers" ? (
            <select
              value={filterSupplierStatus}
              onChange={(e) => setFilterSupplierStatus(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm text-ink"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          ) : null}
          {tab === "currentstock" ? (
            <select
              value={filterReorderStatus}
              onChange={(e) => setFilterReorderStatus(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm text-ink"
            >
              <option value="">All statuses</option>
              <option value="ok">OK</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          ) : null}
          {tab === "receive" ? (
            <select
              value={filterReceiveStatus}
              onChange={(e) => setFilterReceiveStatus(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm text-ink"
            >
              <option value="">All statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          ) : null}
          {tab === "stockout" ? (
            <select
              value={filterStockOutReason}
              onChange={(e) => setFilterStockOutReason(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm text-ink"
            >
              <option value="">All reasons</option>
              <option value="WASTE">Waste / damage</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          ) : null}
          {tab === "history" ? (
            <select
              value={filterHistoryType}
              onChange={(e) => setFilterHistoryType(e.target.value)}
              className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm text-ink"
            >
              <option value="">All types</option>
              <option value="IN">In</option>
              <option value="OUT">Out</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          ) : null}
        </div>
      </div>

      <div
        className={`min-h-0 flex-1 ${tableOverflowTabs.includes(tab) ? "overflow-y-auto overflow-x-hidden" : "overflow-y-auto"}`}
      >
        {tab === "overview" ? (
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewMetricCard
                icon={DollarSign}
                label="Total inventory value"
                value={inventoryValueDisplay}
              />
              <OverviewMetricCard
                icon={Package}
                label="Items (SKUs)"
                value={String(stats.skuCount)}
              />
              <OverviewMetricCard
                icon={AlertTriangle}
                label="SKUs needing attention"
                value={String(attentionSkus)}
                iconWrapClass="bg-amber-500/15 text-amber-900"
              />
              <OverviewMetricCard
                icon={Truck}
                label="Active suppliers"
                value={suppliersCount > 0 ? String(suppliersCount) : "—"}
                iconWrapClass="bg-accent/12 text-accent"
              />
            </div>

            <StockFlowChart
              period={flowPeriod}
              onPeriod={setFlowPeriod}
              weeklyFlowLive={weeklyFlowLive}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StockPanelCard className="p-5">
                <StockTableTitle>Low / out of stock</StockTableTitle>
                {filteredLowOrOut.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="py-2 font-medium text-muted-foreground">
                            Item
                          </th>
                          <th className="py-2 font-medium text-muted-foreground">
                            Qty
                          </th>
                          <th className="py-2 font-medium text-muted-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLowOrOut.slice(0, 12).map((r) => (
                          <tr key={r.id} className="border-b border-border/70">
                            <td className="py-2 font-medium text-ink">{r.name}</td>
                            <td className="py-2 tabular-nums text-muted-foreground">
                              {r.qty}
                            </td>
                            <td className="py-2">
                              <span
                                className={
                                  r.status === "out"
                                    ? "font-semibold text-danger"
                                    : "font-semibold text-brand"
                                }
                              >
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    All listed SKUs are above reorder threshold (or search matched
                    nothing).
                  </p>
                )}
              </StockPanelCard>

              <StockPanelCard className="p-5">
                <StockTableTitle>Recent activity</StockTableTitle>
                {movements.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <ul className="divide-y divide-border text-sm">
                      {movements.slice(0, 12).map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
                        >
                          <span className="font-medium text-ink">
                            {m.productName}
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {new Date(m.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span
                            className={`w-full text-xs font-semibold ${
                              m.delta > 0 ? "text-success" : "text-danger"
                            }`}
                          >
                            {m.delta > 0 ? "+" : ""}
                            {m.delta} · {m.reason}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Ledger is empty — record Stock-In or Stock-Out and movements will
                    append here (same audit trail pattern as production inventory on
                    products).
                  </p>
                )}
              </StockPanelCard>
            </div>
          </div>
        ) : null}

        {tab === "suppliers" ? (
          <StockPanelCard className="p-8">
            <StockTableTitle>Suppliers</StockTableTitle>
            <p className="mx-auto max-w-lg py-6 text-center text-sm text-muted-foreground">
              Supplier master data and purchase defaults will appear here (same slot
              as Pod Café). Rightlamps has no supplier table yet — add Prisma models
              and APIs when procurement goes live.
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                disabled
                className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-muted-foreground"
              >
                Add supplier (soon)
              </button>
            </div>
          </StockPanelCard>
        ) : null}

        {tab === "items" ? (
          <div className="pb-6">
            <StockPanelCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-semibold md:px-6">Item</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Slug</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Live</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Qty</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Line value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No items match.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((p) => (
                        <tr
                          key={p.id}
                          className="bg-surface-elevated/40 hover:bg-surface-elevated"
                        >
                          <td className="px-4 py-3 font-medium text-ink md:px-6">
                            {p.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground md:px-6">
                            {p.slug}
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            {p.published ? (
                              <span className="text-success">Yes</span>
                            ) : (
                              <span className="text-muted-foreground">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3 tabular-nums md:px-6">
                            {p.stock}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-ink md:px-6">
                            {stockLineValue(p)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </StockPanelCard>
          </div>
        ) : null}

        {tab === "receive" ? (
          <div className="space-y-6 pb-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setReceiveMsg(null);
                  setReceiveModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand/20 ring-1 ring-brand/25 transition hover:bg-brand-hover"
              >
                <Plus size={18} aria-hidden />
                Record receipt
              </button>
            </div>
            <StockPanelCard className="overflow-hidden">
              <div className="border-b border-border px-4 py-3 md:px-6">
                <StockTableTitle>Inbound movements</StockTableTitle>
                <p className="mt-2 text-xs text-muted-foreground">
                  Positive deltas recorded as receipts — mirrors listing inbound rows
                  beside forms on legacy ops terminals.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-semibold md:px-6">Item</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Qty</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Status</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Note</th>
                      <th className="px-4 py-3 font-semibold md:px-6">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInbound.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No inbound rows match filters yet.
                        </td>
                      </tr>
                    ) : (
                      filteredInbound.map((m) => (
                        <tr key={m.id} className="bg-surface-elevated/40">
                          <td className="px-4 py-3 font-medium md:px-6">
                            {m.productName}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-success md:px-6">
                            +{m.delta}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground md:px-6">
                            {m.receiptStatus ?? "—"}
                          </td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground md:px-6">
                            {m.note ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground md:px-6">
                            {new Date(m.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </StockPanelCard>
          </div>
        ) : null}

        {tab === "stockout" ? (
          <div className="space-y-6 pb-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setMsg(null);
                  setAdjustModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand/20 ring-1 ring-brand/25 transition hover:bg-brand-hover"
              >
                <Plus size={18} aria-hidden />
                Record adjustment
              </button>
            </div>
            <StockPanelCard className="overflow-hidden">
              <div className="border-b border-border px-4 py-3 md:px-6">
                <StockTableTitle>Outbound movements</StockTableTitle>
                <p className="mt-2 text-xs text-muted-foreground">
                  Negative deltas with removal reasons — aligns shelf counts the same
                  way legacy terminals listed outgoing lines before batch APIs.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-semibold md:px-6">Item</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Qty</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Reason</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Note</th>
                      <th className="px-4 py-3 font-semibold md:px-6">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOutbound.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No outbound rows match filters yet.
                        </td>
                      </tr>
                    ) : (
                      filteredOutbound.map((m) => (
                        <tr key={m.id} className="bg-surface-elevated/40">
                          <td className="px-4 py-3 font-medium md:px-6">
                            {m.productName}
                          </td>
                          <td className="px-4 py-3 tabular-nums text-danger md:px-6">
                            {m.delta}
                          </td>
                          <td className="px-4 py-3 md:px-6">{m.reason}</td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground md:px-6">
                            {m.note ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground md:px-6">
                            {new Date(m.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </StockPanelCard>
          </div>
        ) : null}

        {tab === "currentstock" ? (
          <div className="pb-6">
            <StockPanelCard className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 font-semibold md:px-6">Item</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Unit</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Qty</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Status</th>
                      <th className="px-4 py-3 font-semibold md:px-6">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCurrentStock.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-muted-foreground"
                        >
                          No rows match filters.
                        </td>
                      </tr>
                    ) : (
                      filteredCurrentStock.map((p) => (
                        <tr
                          key={p.id}
                          className="bg-surface-elevated/40 hover:bg-surface-elevated"
                        >
                          <td className="px-4 py-3 font-medium text-ink md:px-6">
                            {p.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground md:px-6">
                            pcs
                          </td>
                          <td className="px-4 py-3 tabular-nums font-semibold md:px-6">
                            {p.stock}
                          </td>
                          <td className="px-4 py-3 md:px-6">
                            <StockLevelBadgePod row={p} />
                          </td>
                          <td className="px-4 py-3 tabular-nums md:px-6">
                            {stockLineValue(p)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </StockPanelCard>
          </div>
        ) : null}

        {tab === "history" ? (
          <StockPanelCard className="overflow-hidden pb-6">
            <div className="border-b border-border px-4 py-3 md:px-6">
              <StockTableTitle>Stock History</StockTableTitle>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-semibold md:px-6">Item</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Type</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Qty</th>
                    <th className="px-4 py-3 font-semibold md:px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLedgerHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-14 text-center text-muted-foreground"
                      >
                        No ledger rows match — adjust filters or record movements from
                        Stock-In / Stock-Out.
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerHistory.map((m) => (
                      <tr key={m.id} className="bg-surface-elevated/40">
                        <td className="px-4 py-3 font-medium md:px-6">
                          {m.productName}
                        </td>
                        <td className="px-4 py-3 md:px-6">
                          <span
                            className={
                              m.delta > 0
                                ? "font-semibold text-success"
                                : m.reason === "ADJUSTMENT"
                                  ? "font-semibold text-muted-foreground"
                                  : "font-semibold text-danger"
                            }
                          >
                            {m.delta > 0
                              ? "IN"
                              : m.reason === "ADJUSTMENT"
                                ? "ADJ"
                                : "OUT"}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums md:px-6">{m.delta}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground md:px-6">
                          {new Date(m.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </StockPanelCard>
        ) : null}
      </div>

      <PodShellModal
        isOpen={receiveModalOpen}
        title="Record stock-in"
        onClose={() => !receivePending && setReceiveModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              disabled={receivePending}
              onClick={() => !receivePending && setReceiveModalOpen(false)}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-muted/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="stock-receive-modal-form"
              disabled={receivePending}
              className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-50"
            >
              {receivePending ? "Posting…" : "Post receipt"}
            </button>
          </>
        }
      >
        <form
          id="stock-receive-modal-form"
          onSubmit={submitReceive}
          className="space-y-4"
        >
          <p className="text-xs text-muted-foreground">
            Creates a ledger row and increases on-hand quantity for the SKU (same
            flow as Pod Café receive).
          </p>
          <label className="block text-sm font-semibold text-ink">
            Product
            <select
              required
              value={receiveProductId}
              onChange={(e) => setReceiveProductId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            >
              <option value="">Select SKU…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — on hand {p.stock}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">
            Quantity received
            <input
              type="number"
              required
              min={1}
              step={1}
              value={receiveQty}
              onChange={(e) => setReceiveQty(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Note (optional)
            <textarea
              value={receiveNote}
              onChange={(e) => setReceiveNote(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            />
          </label>
          {receiveMsg ? (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger ring-1 ring-danger/20">
              {receiveMsg}
            </p>
          ) : null}
        </form>
      </PodShellModal>

      <PodShellModal
        isOpen={adjustModalOpen}
        title="Record stock adjustment"
        onClose={() => !pending && setAdjustModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => !pending && setAdjustModalOpen(false)}
              className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-muted/40 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="stock-adjust-modal-form"
              disabled={pending}
              className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-50"
            >
              {pending ? "Saving…" : "Apply adjustment"}
            </button>
          </>
        }
      >
        <form
          id="stock-adjust-modal-form"
          onSubmit={submitAdjust}
          className="space-y-4"
        >
          <p className="text-xs text-muted-foreground">
            Single SKU delta with optional note — mirrors Pod&apos;s stock movement
            modal pattern.
          </p>
          <label className="block text-sm font-semibold text-ink">
            Product
            <select
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            >
              <option value="">Select SKU…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — on hand {p.stock}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink">
            Change (+ receive / − remove)
            <input
              type="number"
              required
              step={1}
              value={delta}
              onChange={(e) => setDelta(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-mono text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Note (optional)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            />
          </label>
          {msg ? (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger ring-1 ring-danger/20">
              {msg}
            </p>
          ) : null}
        </form>
      </PodShellModal>
    </div>
  );
}
