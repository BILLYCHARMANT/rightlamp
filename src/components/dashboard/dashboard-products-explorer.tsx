"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronDown,
  Search,
} from "lucide-react";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import {
  deleteDashboardProduct,
  setProductPublished,
} from "@/lib/dashboard/product-actions";
import { getProductImageUrl } from "@/lib/dashboard/product-images";
import { DashboardProductThumb } from "@/components/dashboard/ui/dashboard-product-thumb";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";
import { usePaginatedRows } from "@/hooks/use-paginated-rows";

export type ExplorerProductAccessory = {
  id: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
  sortOrder: number;
};

export type ExplorerProductImage = {
  id: string;
  url: string;
  label: string | null;
  sortOrder: number;
};

export type ExplorerProduct = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  priceCents: number;
  costPriceCents: number | null;
  currency: string;
  stock: number;
  published: boolean;
  familyId: string | null;
  variantLabel: string | null;
  familyName: string | null;
  createdAt: string;
  updatedAt: string;
  images: ExplorerProductImage[];
  accessories: ExplorerProductAccessory[];
};

type StockFilter = "all" | "in" | "low" | "out";
type PublishTab = "all" | "published" | "drafts";
type SortKey = "best-seller" | "name" | "price" | "modified";
type ModifiedFilter = "all" | "7d" | "30d" | "90d";

type StockBadgeVariant = "low" | "out" | "in";

function productProfit(p: ExplorerProduct): { label: string; className: string } {
  if (p.costPriceCents == null) {
    return { label: "—", className: "text-slate-400" };
  }
  const profit = p.priceCents - p.costPriceCents;
  const label = formatMoneyFromCents(profit, p.currency);
  if (profit < 0) return { label, className: "font-semibold text-red-600" };
  if (profit > 0) return { label, className: "font-semibold text-emerald-600" };
  return { label, className: "text-slate-400" };
}

function stockVariant(stock: number): StockBadgeVariant {
  if (stock === 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "in";
}

function stockLabel(stock: number): string {
  if (stock === 0) return `Out (${stock})`;
  if (stock <= LOW_STOCK_THRESHOLD) return `Low (${stock})`;
  return `In (${stock})`;
}

const stockBadgeStyles: Record<
  StockBadgeVariant,
  { wrap: string; dot: string; pulse?: boolean }
> = {
  low: {
    wrap: "bg-orange-50 text-orange-700 border-orange-100",
    dot: "bg-orange-500",
    pulse: true,
  },
  out: {
    wrap: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
  in: {
    wrap: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
};

function StockBadge({ stock }: { stock: number }) {
  const variant = stockVariant(stock);
  const styles = stockBadgeStyles[variant];
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-sm border px-1.5 py-0.5 font-[family-name:var(--font-jetbrains)] text-[9px] font-bold uppercase tracking-wide ${styles.wrap}`}
      title={stockLabel(stock)}
    >
      <span
        className={`mr-1 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot} ${styles.pulse ? "animate-pulse" : ""}`}
        aria-hidden
      />
      <span className="truncate">{stockLabel(stock)}</span>
    </span>
  );
}

function formatModified(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function purchasePriceDisplay(p: ExplorerProduct): string {
  if (p.costPriceCents == null) return "—";
  return formatMoneyFromCents(p.costPriceCents, p.currency);
}

type FilterState = {
  stock: StockFilter;
  category: string;
  sort: SortKey;
  modified: ModifiedFilter;
};

const defaultFilters: FilterState = {
  stock: "all",
  category: "all",
  sort: "best-seller",
  modified: "all",
};

function applyFilters(
  products: ExplorerProduct[],
  query: string,
  publishTab: PublishTab,
  filters: FilterState,
): ExplorerProduct[] {
  const q = query.trim().toLowerCase();
  const now = Date.now();

  const rows = products.filter((p) => {
    const hay = `${p.name} ${p.slug} ${p.id} ${p.category ?? ""}`.toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (publishTab === "published" && !p.published) return false;
    if (publishTab === "drafts" && p.published) return false;
    if (filters.category !== "all") {
      const pc = (p.category ?? "").trim();
      if (pc !== filters.category) return false;
    }
    if (filters.stock === "in" && !(p.stock > 0)) return false;
    if (
      filters.stock === "low" &&
      !(p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
    )
      return false;
    if (filters.stock === "out" && p.stock !== 0) return false;
    if (filters.modified !== "all") {
      const days =
        (now - new Date(p.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      const max =
        filters.modified === "7d" ? 7 : filters.modified === "30d" ? 30 : 90;
      if (days > max) return false;
    }
    return true;
  });

  return [...rows].sort((a, b) => {
    switch (filters.sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return b.priceCents - a.priceCents;
      case "modified":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "best-seller":
      default:
        return b.stock - a.stock || a.name.localeCompare(b.name);
    }
  });
}

function SelectField({
  label,
  value,
  onChange,
  minWidth = "160px",
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative shrink-0" style={{ minWidth }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full appearance-none rounded-sm border border-slate-200 bg-white py-1.5 pl-3 pr-9 text-xs text-slate-800 focus:border-[var(--dash-teal)] focus:outline-none focus:ring-1 focus:ring-[var(--dash-teal)]"
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        aria-hidden
      />
    </div>
  );
}

const thClass =
  "px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500";
const tdClass = "px-3 py-3 align-middle";

export function DashboardProductsExplorer({
  products,
  search,
  onSearchChange,
  onEdit,
}: {
  products: ExplorerProduct[];
  search: string;
  onSearchChange: (value: string) => void;
  onEdit: (product: ExplorerProduct) => void;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [publishTab, setPublishTab] = useState<PublishTab>("all");
  const [pending, setPending] = useState<FilterState>(defaultFilters);
  const [applied, setApplied] = useState<FilterState>(defaultFilters);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const tableAnchorRef = useRef<HTMLDivElement>(null);

  const counts = useMemo(
    () => ({
      all: products.length,
      published: products.filter((p) => p.published).length,
      drafts: products.filter((p) => !p.published).length,
    }),
    [products],
  );

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const c = (p.category ?? "").trim();
      if (c) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(
    () => applyFilters(products, search, publishTab, applied),
    [products, search, publishTab, applied],
  );

  const { slice, pages, page: safePage, setPage, pageSize } =
    usePaginatedRows(filtered, tableAnchorRef);

  const allOnPageSelected =
    slice.length > 0 && slice.every((p) => selected.has(p.id));

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const p of slice) next.delete(p.id);
      } else {
        for (const p of slice) next.add(p.id);
      }
      return next;
    });
  }

  function runAction(
    id: string,
    action: () => Promise<{ ok: boolean; message?: string }>,
  ) {
    setPendingId(id);
    startTransition(async () => {
      const res = await action();
      setPendingId(null);
      if (!res.ok && res.message) {
        window.alert(res.message);
        return;
      }
      router.refresh();
    });
  }

  function togglePublished(product: ExplorerProduct) {
    runAction(product.id, () =>
      setProductPublished(product.id, !product.published),
    );
  }

  function deleteProduct(product: ExplorerProduct) {
    const ok = window.confirm(
      `Delete "${product.name}"? This cannot be undone. Stock history for this product will also be removed.`,
    );
    if (!ok) return;
    runAction(product.id, () => deleteDashboardProduct(product.id));
  }

  return (
    <div ref={tableAnchorRef}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/50 p-5">
        <div className="flex items-center gap-6 text-sm">
          {(
            [
              ["all", "All", counts.all],
              ["published", "Published", counts.published],
              ["drafts", "Drafts", counts.drafts],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setPublishTab(id);
                setPage(0);
              }}
              className={
                publishTab === id
                  ? "border-b-2 border-brand pb-1 font-bold text-brand"
                  : "pb-1 text-slate-500 transition hover:text-slate-800"
              }
            >
              {label} ({count})
            </button>
          ))}
        </div>

        <label className="relative w-full sm:w-64">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setPage(0);
            }}
            placeholder="Search product..."
            className="w-full rounded-sm border border-slate-200 py-1.5 pl-10 pr-4 text-xs focus:border-[var(--dash-teal)] focus:outline-none focus:ring-1 focus:ring-[var(--dash-teal)]"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-white px-5 py-4">
        <SelectField
          label="Filter by stock status"
          value={pending.stock}
          onChange={(v) => setPending((s) => ({ ...s, stock: v as StockFilter }))}
        >
          <option value="all">Filter by Stock Status</option>
          <option value="in">In stock</option>
          <option value="low">Low inventory</option>
          <option value="out">Out of stock</option>
        </SelectField>
        <SelectField
          label="Product category"
          value={pending.category}
          onChange={(v) => setPending((s) => ({ ...s, category: v }))}
        >
          <option value="all">Product Category</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Sort by"
          value={pending.sort}
          onChange={(v) => setPending((s) => ({ ...s, sort: v as SortKey }))}
        >
          <option value="best-seller">Sort by: Best Seller</option>
          <option value="name">Sort by: Name</option>
          <option value="price">Sort by: Price</option>
          <option value="modified">Sort by: Last Modified</option>
        </SelectField>
        <SelectField
          label="Product type"
          value="simple"
          minWidth="140px"
          onChange={() => {}}
        >
          <option value="simple">Product Type</option>
        </SelectField>
        <SelectField
          label="Last modified"
          value={pending.modified}
          minWidth="140px"
          onChange={(v) =>
            setPending((s) => ({ ...s, modified: v as ModifiedFilter }))
          }
        >
          <option value="all">Last Modified</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </SelectField>
        <button
          type="button"
          onClick={() => {
            setApplied({ ...pending });
            setPage(0);
          }}
          className="dash-btn-apply shrink-0 px-6 py-1.5 text-xs"
        >
          Apply {">"}
        </button>
        <button
          type="button"
          onClick={() => {
            setPending(defaultFilters);
            setApplied(defaultFilters);
            setPage(0);
          }}
          className="shrink-0 rounded-sm border border-transparent px-4 py-1.5 text-xs text-slate-500 transition hover:border-slate-200 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <div>
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-9" />
            <col />
            <col className="w-[11%]" />
            <col className="w-[17%]" />
            <col className="w-[12%]" />
            <col className="w-[10%]" />
            <col className="w-[11%]" />
            <col className="w-[76px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className={`${thClass} text-center`}>
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={toggleAllOnPage}
                  aria-label="Select all on page"
                  className="rounded-sm border-slate-300 text-[var(--dash-teal)] focus:ring-[var(--dash-teal)]"
                />
              </th>
              <th className={thClass}>Product</th>
              <th className={thClass}>Stock</th>
              <th className={thClass}>Pricing</th>
              <th className={thClass}>Profit</th>
              <th className={thClass}>Live</th>
              <th className={thClass}>Updated</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-16 text-center text-sm text-slate-500"
                >
                  No products match these filters.
                </td>
              </tr>
            ) : (
              slice.map((p) => {
                const profit = productProfit(p);
                const imageUrl = getProductImageUrl(p.slug, p.category);
                const categoryLabel = (p.category ?? "").trim() || "—";
                const retail = formatMoneyFromCents(p.priceCents, p.currency);
                const cost = purchasePriceDisplay(p);
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50"
                  >
                    <td className={`${tdClass} text-center`}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(p.id)) next.delete(p.id);
                            else next.add(p.id);
                            return next;
                          })
                        }
                        aria-label={`Select ${p.name}`}
                        className="rounded-sm border-slate-300 text-[var(--dash-teal)] focus:ring-[var(--dash-teal)]"
                      />
                    </td>
                    <td className={`${tdClass} !py-2.5`}>
                      <div className="flex min-w-0 items-start gap-1">
                        <DashboardProductThumb
                          src={imageUrl}
                          alt={p.name}
                          size="xs"
                          className="mt-0.5"
                        />
                        <div className="min-w-0 flex-1 leading-tight">
                          <button
                            type="button"
                            onClick={() => router.push(`/dashboard/products/${p.id}`)}
                            className="truncate text-left text-xs font-bold uppercase tracking-tight text-slate-900 transition hover:text-[var(--dash-teal)]"
                            title={p.name}
                          >
                            {p.name}
                          </button>
                          <p
                            className="truncate font-mono text-[10px] leading-snug text-slate-400"
                            title={p.slug}
                          >
                            {p.slug}
                          </p>
                          <p className="truncate text-[10px] leading-snug text-slate-500">
                            {categoryLabel} · Simple
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className={tdClass}>
                      <div className="min-w-0">
                        <p
                          className="truncate text-xs font-bold text-slate-900"
                          title={retail}
                        >
                          {retail}
                        </p>
                        <p
                          className="truncate font-[family-name:var(--font-jetbrains)] text-[10px] text-slate-500"
                          title={cost}
                        >
                          Cost {cost}
                        </p>
                      </div>
                    </td>
                    <td className={tdClass}>
                      <span
                        className={`block truncate text-xs ${profit.className}`}
                        title={profit.label}
                      >
                        {profit.label}
                      </span>
                    </td>
                    <td className={tdClass}>
                      <label className="inline-flex cursor-pointer items-center">
                        <span className="relative inline-flex h-5 w-9 shrink-0">
                          <input
                            type="checkbox"
                            checked={p.published}
                            disabled={pendingId === p.id}
                            onChange={() => togglePublished(p)}
                            className="peer sr-only"
                            aria-label={
                              p.published
                                ? `Deactivate ${p.name}`
                                : `Activate ${p.name}`
                            }
                          />
                          <span className="h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-emerald-500 peer-disabled:opacity-50" />
                          <span className="pointer-events-none absolute left-[2px] top-[2px] h-4 w-4 rounded-full border border-slate-300 bg-white transition-transform peer-checked:translate-x-4" />
                        </span>
                        <span
                          className={`ml-1.5 hidden text-[9px] font-bold uppercase sm:inline ${
                            p.published ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {p.published ? "Live" : "Draft"}
                        </span>
                      </label>
                    </td>
                    <td className={tdClass}>
                      <time
                        className="block truncate text-[10px] font-semibold text-brand"
                        dateTime={p.updatedAt}
                        title={formatModified(p.updatedAt)}
                      >
                        {formatModified(p.updatedAt)}
                      </time>
                    </td>
                    <td className={`${tdClass} text-right`}>
                      <div className="flex justify-end">
                        <DashboardTableRowActions
                          variant="segmented"
                        disabled={pendingId === p.id}
                        onView={() => router.push(`/dashboard/products/${p.id}`)}
                        onEdit={() => onEdit(p)}
                        onDelete={() => deleteProduct(p)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DashboardProductsPagination
        page={safePage}
        pages={pages}
        total={filtered.length}
        pageSize={pageSize}
        onPage={setPage}
      />
    </div>
  );
}

function DashboardProductsPagination({
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
  onPage: (page: number) => void;
}) {
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-6 py-4">
      <p className="text-xs text-slate-500">
        {total > 0 ? (
          <>
            Showing{" "}
            <span className="font-bold text-slate-800">
              {from}–{to}
            </span>{" "}
            of <span className="font-bold text-slate-800">{total}</span> products
            <span className="text-slate-400"> • </span>
            {pageSize} per screen
            <span className="text-slate-400"> • </span>
            Page {page + 1} of {pages}
          </>
        ) : (
          <>No products</>
        )}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="rounded-sm border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= pages - 1}
          onClick={() => onPage(page + 1)}
          className="rounded-sm border border-slate-200 bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
