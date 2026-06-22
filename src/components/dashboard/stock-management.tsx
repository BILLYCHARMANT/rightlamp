"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  DollarSign,
  Download,
  History,
  Layers,
  Package,
  Plus,
  Search,
  Tags,
  Truck,
} from "lucide-react";
import { StockFlowChart } from "@/components/dashboard/stock/stock-flow-chart";
import { StockCategoriesPanel } from "@/components/dashboard/stock/stock-categories-panel";
import { DashboardProductFormModal } from "@/components/dashboard/dashboard-product-form-modal";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";
import {
  deleteDashboardProduct,
  fetchDashboardProductForEdit,
  setProductPublished,
} from "@/lib/dashboard/product-actions";
import { deleteStockMovement } from "@/lib/dashboard/stock-actions";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import type { ProductCategoryRow } from "@/lib/dashboard/category-actions";
import { StockOutModal } from "@/components/dashboard/stock/stock-out-modal";
import { StockReceiveModal } from "@/components/dashboard/stock/stock-receive-modal";
import { StockSuppliersPanel } from "@/components/dashboard/stock/stock-suppliers-panel";
import {
  currentStockToCsv,
  downloadCsv,
  paginate,
  stockLineValue,
  stockOutEligibleProducts,
  formatStockMovementReason,
  formatStockMovementWhen,
  stockStatusRow,
} from "@/components/dashboard/stock/stock-utils";
import { useViewportTablePageSize } from "@/hooks/use-viewport-table-page-size";
import type {
  FlowPeriod,
  MovementFlowPoint,
  StockLowRow,
  StockMovementReasonCode,
  StockMovementRow,
  StockOverviewStats,
  StockProductDetail,
  SupplierRow,
  BranchRow,
} from "@/lib/dashboard/stock-shared-types";

type PodTab =
  | "overview"
  | "suppliers"
  | "categories"
  | "items"
  | "receive"
  | "stockout"
  | "currentstock"
  | "history";

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

function StockPanelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-elevated/95 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function OverviewMetricCard({
  icon: Icon,
  label,
  value,
  hint,
  iconWrapClass = "bg-brand/15 text-brand",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
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
          <p className="truncate text-lg font-semibold tabular-nums text-ink">{value}</p>
          {hint ? (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{hint}</p>
          ) : null}
        </div>
      </div>
    </StockPanelCard>
  );
}

function StockLevelBadge({ row }: { row: StockProductDetail }) {
  const s = stockStatusRow(row);
  const label =
    s === "out" ? "Out" : s === "low" ? "Low" : s === "ok" ? "OK" : "Hidden";
  const cls =
    s === "out"
      ? "text-danger"
      : s === "low"
        ? "text-brand"
        : s === "ok"
          ? "text-success"
          : "text-muted-foreground";
  return <span className={`text-sm font-semibold ${cls}`}>{label}</span>;
}

function TablePager({
  page,
  pages,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex items-center justify-between border-t border-[var(--dash-table-border)] bg-[var(--dash-table-header-bg)] px-4 py-3 text-xs text-muted-foreground md:px-6">
      <span>
        {total > 0 ? (
          <>
            Showing {from}–{to} of {total} · {pageSize} per screen · Page {page + 1} of{" "}
            {pages}
          </>
        ) : (
          <>No rows · Page 1 of 1</>
        )}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 font-medium text-ink shadow-sm disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages - 1}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 font-medium text-ink shadow-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function StockItemStorefrontToggle({
  productId,
  productName,
  published,
}: {
  productId: string;
  productName: string;
  published: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [live, setLive] = useState(published);

  function toggle() {
    const next = !live;
    setLive(next);
    startTransition(async () => {
      const result = await setProductPublished(productId, next);
      if (!result.ok) {
        setLive(!next);
        return;
      }
      router.refresh();
    });
  }

  return (
    <label className="inline-flex cursor-pointer items-center">
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          checked={live}
          disabled={pending}
          onChange={toggle}
          className="peer sr-only"
          aria-label={
            live ? `Hide ${productName} from shop` : `Publish ${productName} to shop`
          }
        />
        <span className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-emerald-500 peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-slate-300 bg-white transition-transform peer-checked:translate-x-5" />
      </span>
      <span
        className={`ml-2 text-[10px] font-bold uppercase ${
          live ? "text-emerald-600" : "text-slate-400"
        }`}
      >
        {live ? "Live" : "Draft"}
      </span>
    </label>
  );
}

export function StockManagement({
  products,
  stats,
  inventoryValueDisplay,
  costValueDisplay,
  lowOrOutList,
  suppliers,
  movements,
  flowByPeriod,
  branches,
  categories,
}: {
  products: StockProductDetail[];
  stats: StockOverviewStats;
  inventoryValueDisplay: string;
  costValueDisplay: string;
  lowOrOutList: StockLowRow[];
  suppliers: SupplierRow[];
  movements: StockMovementRow[];
  flowByPeriod: Record<FlowPeriod, MovementFlowPoint[]>;
  branches: BranchRow[];
  categories: ProductCategoryRow[];
}) {
  const router = useRouter();
  const [itemPending, startItemTransition] = useTransition();
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category.id, name: category.name })),
    [categories],
  );
  const [tab, setTab] = useState<PodTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterReorderStatus, setFilterReorderStatus] = useState("");
  const [filterReceiveStatus, setFilterReceiveStatus] = useState("");
  const [filterStockOutReason, setFilterStockOutReason] = useState("");
  const [filterHistoryType, setFilterHistoryType] = useState("");
  const [flowPeriod, setFlowPeriod] = useState<FlowPeriod>("weekly");
  const [tablePage, setTablePage] = useState(0);
  const tableAnchorRef = useRef<HTMLDivElement>(null);
  const pageSize = useViewportTablePageSize(tableAnchorRef);

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExplorerProduct | null>(null);
  const [viewingItem, setViewingItem] = useState<StockProductDetail | null>(null);
  const [viewingMovement, setViewingMovement] = useState<StockMovementRow | null>(
    null,
  );
  const [editingMovement, setEditingMovement] = useState<StockMovementRow | null>(
    null,
  );
  const [itemFormKey, setItemFormKey] = useState(0);
  const [prefillProductId, setPrefillProductId] = useState("");

  const tabs: { id: PodTab; label: string; icon: LucideIcon }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "categories", label: "Categories", icon: Tags },
    { id: "items", label: "Items", icon: Package },
    { id: "receive", label: "Stock-In", icon: ArrowDownCircle },
    { id: "stockout", label: "Stock-Out", icon: ArrowUpCircle },
    { id: "currentstock", label: "Current Stock", icon: Layers },
    { id: "history", label: "History", icon: History },
  ];

  const openCreateItem = () => {
    setEditingItem(null);
    setItemFormKey((k) => k + 1);
    setCreateItemOpen(true);
  };

  const openEditItem = (item: StockProductDetail) => {
    startItemTransition(async () => {
      const result = await fetchDashboardProductForEdit(item.id);
      if (!result.ok) {
        window.alert(result.message);
        return;
      }
      setEditingItem(result.product);
      setItemFormKey((k) => k + 1);
      setCreateItemOpen(true);
    });
  };

  const deleteItem = (item: StockProductDetail) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    startItemTransition(async () => {
      const result = await deleteDashboardProduct(item.id);
      if (!result.ok) window.alert(result.message);
      else router.refresh();
    });
  };

  const closeItemForm = () => {
    setCreateItemOpen(false);
    setEditingItem(null);
  };

  const goToTab = (id: PodTab) => {
    setReceiveOpen(false);
    setStockOutOpen(false);
    setEditingMovement(null);
    setTab(id);
    setTablePage(0);
  };

  const openReceive = (productId = "") => {
    setEditingMovement(null);
    setPrefillProductId(productId);
    setReceiveOpen(true);
  };

  const openStockOut = (productId = "") => {
    setEditingMovement(null);
    setPrefillProductId(productId);
    setStockOutOpen(true);
  };

  const openEditMovement = (movement: StockMovementRow) => {
    setEditingMovement(movement);
    if (movement.delta > 0) {
      setReceiveOpen(true);
    } else {
      setStockOutOpen(true);
    }
  };

  const closeReceiveModal = () => {
    setReceiveOpen(false);
    setEditingMovement(null);
  };

  const closeStockOutModal = () => {
    setStockOutOpen(false);
    setEditingMovement(null);
  };

  const deleteMovement = (movement: StockMovementRow) => {
    const label = movement.delta > 0 ? "receipt" : "movement";
    if (
      !window.confirm(
        `Delete this ${label} for "${movement.productName}"? On-hand stock will be adjusted.`,
      )
    ) {
      return;
    }
    startItemTransition(async () => {
      const result = await deleteStockMovement(movement.id);
      if (!result.ok) window.alert(result.message);
      else router.refresh();
    });
  };

  const movementMatchesSearch = (m: StockMovementRow, raw: string) => {
    const q = raw.trim().toLowerCase();
    if (!q) return true;
    return (
      m.productName.toLowerCase().includes(q) ||
      m.note?.toLowerCase().includes(q) ||
      m.supplierName?.toLowerCase().includes(q)
    );
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      `${p.name} ${p.slug} ${p.category ?? ""}`.toLowerCase().includes(q),
    );
  }, [products, searchQuery]);

  const filteredCurrentStock = useMemo(() => {
    let rows = products;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter((p) =>
        `${p.name} ${p.slug} ${p.category ?? ""}`.toLowerCase().includes(q),
      );
    }
    if (filterReorderStatus) {
      rows = rows.filter((p) => stockStatusRow(p) === filterReorderStatus);
    }
    return rows;
  }, [products, searchQuery, filterReorderStatus]);

  const filteredInbound = useMemo(
    () =>
      movements.filter((m) => {
        if (m.delta <= 0) return false;
        if (filterReceiveStatus && (m.receiptStatus ?? "") !== filterReceiveStatus) {
          return false;
        }
        return movementMatchesSearch(m, searchQuery);
      }),
    [movements, filterReceiveStatus, searchQuery],
  );

  const filteredOutbound = useMemo(
    () =>
      movements.filter((m) => {
        if (m.delta >= 0) return false;
        if (
          filterStockOutReason &&
          m.reason !== mapOutboundToolbarReason(filterStockOutReason)
        ) {
          return false;
        }
        return movementMatchesSearch(m, searchQuery);
      }),
    [movements, filterStockOutReason, searchQuery],
  );

  const filteredLedgerHistory = useMemo(
    () =>
      movements.filter((m) => {
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
          return m.reason === "ADJUSTMENT" && movementMatchesSearch(m, searchQuery);
        }
        return movementMatchesSearch(m, searchQuery);
      }),
    [movements, filterHistoryType, searchQuery],
  );

  const filteredLowOrOut = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return lowOrOutList;
    return lowOrOutList.filter((r) => r.name.toLowerCase().includes(q));
  }, [lowOrOutList, searchQuery]);

  const activeSuppliers = suppliers.filter((s) => s.active).length;
  const attentionSkus = stats.lowStockCount + stats.outOfStockCount;

  const stockOutFormProducts = useMemo(
    () =>
      stockOutEligibleProducts(products, movements, {
        includeProductId:
          editingMovement && editingMovement.delta <= 0
            ? editingMovement.productId
            : undefined,
      }),
    [products, movements, editingMovement],
  );

  const tableRows: StockProductDetail[] | StockMovementRow[] =
    tab === "items"
      ? filteredItems
      : tab === "currentstock"
        ? filteredCurrentStock
        : tab === "receive"
          ? filteredInbound
          : tab === "stockout"
            ? filteredOutbound
            : tab === "history"
              ? filteredLedgerHistory
              : [];

  const { slice: pagedRows, pages, safePage } = paginate<
    StockProductDetail | StockMovementRow
  >(tableRows, tablePage, pageSize);

  const searchPlaceholder =
    tab === "suppliers"
      ? "Search suppliers…"
      : tab === "history"
        ? "Search history…"
        : "Search product or note…";

  const canCreateItem = categories.length > 0;

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="pb-2">
        <h1 className="text-lg font-bold tracking-tight text-ink md:text-xl">
          Stock management
        </h1>
        <p className="text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:text-ink">
            Dashboard
          </Link>
          <span className="mx-1">·</span>
          <span className="font-medium text-brand">Warehouse</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 border-b border-border pb-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 overflow-x-auto pb-1">
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
        {tab !== "overview" && tab !== "suppliers" && tab !== "categories" ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="relative min-w-0 flex-1 sm:w-52">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setTablePage(0);
                }}
                className="h-8 w-full rounded-md border border-border bg-surface py-1 pl-8 pr-2 text-sm"
              />
            </div>
            {tab === "currentstock" ? (
              <>
                <select
                  value={filterReorderStatus}
                  onChange={(e) => {
                    setFilterReorderStatus(e.target.value);
                    setTablePage(0);
                  }}
                  className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="ok">OK</option>
                  <option value="low">Low stock</option>
                  <option value="out">Out of stock</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      `stock-${new Date().toISOString().slice(0, 10)}.csv`,
                      currentStockToCsv(filteredCurrentStock),
                    )
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-sm"
                >
                  <Download size={14} aria-hidden />
                  CSV
                </button>
              </>
            ) : null}
            {tab === "receive" ? (
              <select
                value={filterReceiveStatus}
                onChange={(e) => setFilterReceiveStatus(e.target.value)}
                className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm"
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
                className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm"
              >
                <option value="">All reasons</option>
                <option value="WASTE">Waste</option>
                <option value="TRANSFER">Stock out</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            ) : null}
            {tab === "history" ? (
              <select
                value={filterHistoryType}
                onChange={(e) => setFilterHistoryType(e.target.value)}
                className="h-8 rounded-md border border-border bg-surface px-2.5 text-sm"
              >
                <option value="">All types</option>
                <option value="IN">In</option>
                <option value="OUT">Out</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab !== "overview" ? (
          <div ref={tableAnchorRef} className="h-0 w-full" aria-hidden />
        ) : null}
        {tab === "overview" ? (
          <div className="space-y-6 pb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <OverviewMetricCard
                icon={DollarSign}
                label="Inventory cost value"
                value={costValueDisplay}
                hint={`Retail: ${inventoryValueDisplay}`}
              />
              <OverviewMetricCard
                icon={Package}
                label="Products · units in stock"
                value={`${stats.skuCount} · ${stats.unitsOnHand.toLocaleString()}`}
              />
              <OverviewMetricCard
                icon={AlertTriangle}
                label="Needs attention"
                value={String(attentionSkus)}
                hint={`${stats.lowStockCount} low · ${stats.outOfStockCount} out`}
                iconWrapClass="bg-amber-500/15 text-amber-900"
              />
              <OverviewMetricCard
                icon={Truck}
                label="Active suppliers"
                value={String(activeSuppliers)}
                iconWrapClass="bg-accent/12 text-accent"
              />
            </div>

            <StockFlowChart
              period={flowPeriod}
              onPeriod={setFlowPeriod}
              flowByPeriod={flowByPeriod}
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StockPanelCard className="p-5">
                <h3 className="text-center text-sm font-bold uppercase tracking-wide text-ink">
                  Low / out of stock
                </h3>
                {filteredLowOrOut.length > 0 ? (
                  <table className="dash-data-table mt-4 w-full text-sm">
                    <thead>
                      <tr>
                        <th className="py-2">Item</th>
                        <th className="py-2">Qty</th>
                        <th className="py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLowOrOut.slice(0, 10).map((r) => (
                        <tr key={r.id}>
                          <td className="py-2 font-medium">{r.name}</td>
                          <td className="py-2 tabular-nums">{r.qty}</td>
                          <td className="py-2">
                            <button
                              type="button"
                              onClick={() => openReceive(r.id)}
                              className="text-xs font-semibold text-accent hover:underline"
                            >
                              Receive
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    All products on the shop are above the reorder level.
                  </p>
                )}
              </StockPanelCard>

              <StockPanelCard className="p-5">
                <h3 className="text-center text-sm font-bold uppercase tracking-wide text-ink">
                  Recent activity
                </h3>
                {movements.length > 0 ? (
                  <ul className="mt-4 divide-y divide-border text-sm">
                    {movements.slice(0, 10).map((m) => (
                      <li key={m.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                        <span className="font-medium">{m.productName}</span>
                        <span
                          className={`font-semibold tabular-nums ${
                            m.delta > 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {m.delta > 0 ? "+" : ""}
                          {m.delta}
                        </span>
                        <span className="w-full text-xs text-muted-foreground">
                          {formatStockMovementReason(m.reason)}
                          {m.supplierName ? ` · ${m.supplierName}` : ""} ·{" "}
                          {formatStockMovementWhen(m.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-10 text-center text-sm text-muted-foreground">
                    Record stock-in or stock-out to start the ledger.
                  </p>
                )}
              </StockPanelCard>
            </div>
          </div>
        ) : null}

        {tab === "suppliers" ? (
          <StockSuppliersPanel suppliers={suppliers} movements={movements} />
        ) : null}

        {tab === "categories" ? (
          <StockCategoriesPanel categories={categories} />
        ) : null}

        {tab === "items" ? (
          <div className="space-y-4 pb-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openCreateItem}
                disabled={!canCreateItem}
                title={
                  canCreateItem
                    ? undefined
                    : "Create a category before adding items"
                }
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={18} aria-hidden />
                Create item
              </button>
            </div>
            <StockPanelCard className="overflow-hidden">
            {!canCreateItem ? (
              <p className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 md:px-6">
                Create at least one category before adding warehouse items.
              </p>
            ) : null}
            <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground md:px-6">
              Warehouse items must be created here before you can record stock-in or
              stock-out movements.
            </p>
            <table className="dash-data-table dash-data-table--flush w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 md:px-6">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Storefront</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3 md:px-6">Cost value</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(pagedRows as StockProductDetail[]).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium md:px-6">
                      {p.name}
                      <div className="font-mono text-xs text-muted-foreground">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StockItemStorefrontToggle
                        key={`${p.id}-${p.published}`}
                        productId={p.id}
                        productName={p.name}
                        published={p.published}
                      />
                    </td>
                    <td className="px-4 py-3 tabular-nums">{p.stock}</td>
                    <td className="px-4 py-3 tabular-nums md:px-6">{stockLineValue(p)}</td>
                    <td className="px-4 py-3 md:px-6">
                      <DashboardTableRowActions
                        disabled={itemPending}
                        onView={() => setViewingItem(p)}
                        onEdit={() => openEditItem(p)}
                        onDelete={() => deleteItem(p)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePager
              page={safePage}
              pages={pages}
              total={tableRows.length}
              pageSize={pageSize}
              onPage={setTablePage}
            />
          </StockPanelCard>
          </div>
        ) : null}

        {tab === "receive" ? (
          <div className="space-y-4 pb-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openReceive()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={18} aria-hidden />
                Record receipt
              </button>
            </div>
            <StockPanelCard className="overflow-hidden">
              <table className="dash-data-table dash-data-table--flush w-full min-w-[800px] text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 md:px-6">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3 md:px-6">When</th>
                    <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedRows as StockMovementRow[]).map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 font-medium md:px-6">{m.productName}</td>
                      <td className="px-4 py-3 text-success">+{m.delta}</td>
                      <td className="px-4 py-3">{m.receiptStatus ?? "—"}</td>
                      <td className="px-4 py-3">{m.supplierName ?? "—"}</td>
                      <td className="max-w-[180px] truncate px-4 py-3">{m.note ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground md:px-6">
                        {formatStockMovementWhen(m.createdAt)}
                      </td>
                      <td className="px-4 py-3 md:px-6">
                        <DashboardTableRowActions
                          disabled={itemPending}
                          onView={() => setViewingMovement(m)}
                          onEdit={() => openEditMovement(m)}
                          onDelete={() => deleteMovement(m)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePager
                page={safePage}
                pages={pages}
                total={tableRows.length}
                pageSize={pageSize}
                onPage={setTablePage}
              />
            </StockPanelCard>
          </div>
        ) : null}

        {tab === "stockout" ? (
          <div className="space-y-4 pb-6">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => openStockOut()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={18} aria-hidden />
                Record stock-out
              </button>
            </div>
            <StockPanelCard className="overflow-hidden">
              <table className="dash-data-table dash-data-table--flush w-full min-w-[860px] text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-3 md:px-6">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">To branch</th>
                    <th className="px-4 py-3">Note</th>
                    <th className="px-4 py-3 md:px-6">When</th>
                    <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedRows as StockMovementRow[]).map((m) => (
                    <tr key={m.id}>
                      <td className="px-4 py-3 font-medium md:px-6">{m.productName}</td>
                      <td className="px-4 py-3 text-danger">{m.delta}</td>
                      <td className="px-4 py-3">{formatStockMovementReason(m.reason)}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {m.reason === "TRANSFER"
                          ? m.destinationBranchName ?? "—"
                          : "—"}
                      </td>
                      <td className="max-w-[180px] truncate px-4 py-3">{m.note ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted-foreground md:px-6">
                        {formatStockMovementWhen(m.createdAt)}
                      </td>
                      <td className="px-4 py-3 md:px-6">
                        <DashboardTableRowActions
                          disabled={itemPending}
                          onView={() => setViewingMovement(m)}
                          onEdit={() => openEditMovement(m)}
                          onDelete={() => deleteMovement(m)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePager
                page={safePage}
                pages={pages}
                total={tableRows.length}
                pageSize={pageSize}
                onPage={setTablePage}
              />
            </StockPanelCard>
          </div>
        ) : null}

        {tab === "currentstock" ? (
          <StockPanelCard className="overflow-hidden">
            <table className="dash-data-table dash-data-table--flush w-full min-w-[760px] text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 md:px-6">Item</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 md:px-6">Cost value</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(pagedRows as StockProductDetail[]).map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-medium md:px-6">{p.name}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{p.stock}</td>
                    <td className="px-4 py-3">
                      <StockLevelBadge row={p} />
                    </td>
                    <td className="px-4 py-3 tabular-nums md:px-6">{stockLineValue(p)}</td>
                    <td className="px-4 py-3 md:px-6">
                      <DashboardTableRowActions
                        onView={() => setViewingItem(p)}
                        showEdit={false}
                        showDelete={false}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePager
              page={safePage}
              pages={pages}
              total={tableRows.length}
              pageSize={pageSize}
              onPage={setTablePage}
            />
          </StockPanelCard>
        ) : null}

        {tab === "history" ? (
          <StockPanelCard className="overflow-hidden">
            <table className="dash-data-table dash-data-table--flush w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="px-4 py-3 md:px-6">Item</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3 md:px-6">Date</th>
                  <th className="px-4 py-3 md:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(pagedRows as StockMovementRow[]).map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3 font-medium md:px-6">{m.productName}</td>
                    <td className="px-4 py-3">
                      {m.delta > 0 ? "IN" : m.reason === "ADJUSTMENT" ? "ADJ" : "OUT"}
                    </td>
                    <td className="px-4 py-3 tabular-nums">{m.delta}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {m.createdByEmail?.split("@")[0] ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground md:px-6">
                      {formatStockMovementWhen(m.createdAt)}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <DashboardTableRowActions
                        disabled={itemPending}
                        onView={() => setViewingMovement(m)}
                        onEdit={() => openEditMovement(m)}
                        onDelete={() => deleteMovement(m)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <TablePager
              page={safePage}
              pages={pages}
              total={tableRows.length}
              pageSize={pageSize}
              onPage={setTablePage}
            />
          </StockPanelCard>
        ) : null}
      </div>

      <StockReceiveModal
        isOpen={receiveOpen}
        onClose={closeReceiveModal}
        products={products}
        suppliers={suppliers}
        initialProductId={prefillProductId}
        movement={editingMovement?.delta && editingMovement.delta > 0 ? editingMovement : null}
      />
      <StockOutModal
        isOpen={stockOutOpen}
        onClose={closeStockOutModal}
        products={stockOutFormProducts}
        branches={branches}
        initialProductId={prefillProductId}
        movement={editingMovement?.delta && editingMovement.delta <= 0 ? editingMovement : null}
      />
      <DashboardProductFormModal
        key={itemFormKey}
        isOpen={createItemOpen}
        onClose={closeItemForm}
        product={editingItem}
        categories={categoryOptions}
        mode="stock"
      />

      <PodShellModal
        isOpen={Boolean(viewingItem)}
        title="Item details"
        onClose={() => setViewingItem(null)}
        footer={
          <div className="flex w-full gap-2">
            <button
              type="button"
              onClick={() => setViewingItem(null)}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
            >
              Close
            </button>
            {viewingItem ? (
              <button
                type="button"
                disabled={itemPending}
                onClick={() => {
                  openEditItem(viewingItem);
                  setViewingItem(null);
                }}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
              >
                Edit item
              </button>
            ) : null}
          </div>
        }
      >
        {viewingItem ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Item
              </dt>
              <dd className="mt-1 font-medium text-ink">{viewingItem.name}</dd>
              <dd className="font-mono text-xs text-muted-foreground">{viewingItem.slug}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-1">{viewingItem.category ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Storefront
                </dt>
                <dd className="mt-1">{viewingItem.published ? "Live" : "Draft"}</dd>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Qty
                </dt>
                <dd className="mt-1 tabular-nums">{viewingItem.stock}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Retail
                </dt>
                <dd className="mt-1 tabular-nums">
                  {formatMoneyFromCents(viewingItem.priceCents, viewingItem.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Cost value
                </dt>
                <dd className="mt-1 tabular-nums">{stockLineValue(viewingItem)}</dd>
              </div>
            </div>
          </dl>
        ) : null}
      </PodShellModal>

      <PodShellModal
        isOpen={Boolean(viewingMovement)}
        title="Movement details"
        onClose={() => setViewingMovement(null)}
        footer={
          <button
            type="button"
            onClick={() => setViewingMovement(null)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
          >
            Close
          </button>
        }
      >
        {viewingMovement ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Item
              </dt>
              <dd className="mt-1 font-medium text-ink">{viewingMovement.productName}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Quantity
                </dt>
                <dd className="mt-1 tabular-nums font-semibold">{viewingMovement.delta}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  When
                </dt>
                <dd className="mt-1">
                  {formatStockMovementWhen(viewingMovement.createdAt)}
                </dd>
              </div>
            </div>
            {viewingMovement.supplierName ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Supplier
                </dt>
                <dd className="mt-1">{viewingMovement.supplierName}</dd>
              </div>
            ) : null}
            {viewingMovement.receiptStatus ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Receipt status
                </dt>
                <dd className="mt-1">{viewingMovement.receiptStatus}</dd>
              </div>
            ) : null}
            {viewingMovement.reason ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Reason
                </dt>
                <dd className="mt-1">{formatStockMovementReason(viewingMovement.reason)}</dd>
              </div>
            ) : null}
            {viewingMovement.reason === "TRANSFER" ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Destination branch
                </dt>
                <dd className="mt-1">
                  {viewingMovement.destinationBranchName ?? "—"}
                </dd>
              </div>
            ) : null}
            {viewingMovement.note ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Note
                </dt>
                <dd className="mt-1 text-muted-foreground">{viewingMovement.note}</dd>
              </div>
            ) : null}
            {viewingMovement.createdByEmail ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Recorded by
                </dt>
                <dd className="mt-1">{viewingMovement.createdByEmail}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </PodShellModal>
    </div>
  );
}
