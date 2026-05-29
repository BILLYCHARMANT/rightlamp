"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Filter,
  LayoutGrid,
  MoreHorizontal,
  Search,
  Tag,
} from "lucide-react";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";

export type ExplorerProduct = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  published: boolean;
  updatedAt: string;
};

type StockFilter = "all" | "in" | "low" | "out";
type StorefrontFilter = "all" | "live" | "hidden";

function stockLabel(stock: number): { dot: string; text: string } {
  if (stock === 0)
    return { dot: "bg-danger", text: "Out of stock" };
  if (stock <= LOW_STOCK_THRESHOLD)
    return { dot: "bg-brand", text: "Low stock" };
  return { dot: "bg-success", text: "In stock" };
}

export function DashboardProductsExplorer({
  products,
}: {
  products: ExplorerProduct[];
}) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [storefrontFilter, setStorefrontFilter] =
    useState<StorefrontFilter>("all");

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const c = (p.category ?? "").trim();
      if (c) set.add(c);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.id}`.toLowerCase();
      if (q && !hay.includes(q)) return false;

      if (categoryFilter !== "all") {
        const pc = (p.category ?? "").trim();
        if (pc !== categoryFilter) return false;
      }

      if (storefrontFilter === "live" && !p.published) return false;
      if (storefrontFilter === "hidden" && p.published) return false;

      if (stockFilter === "in" && !(p.stock > 0)) return false;
      if (
        stockFilter === "low" &&
        !(p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)
      )
        return false;
      if (stockFilter === "out" && p.stock !== 0) return false;

      return true;
    });
  }, [products, query, categoryFilter, stockFilter, storefrontFilter]);

  return (
    <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm shadow-ink/[0.03] md:p-6">
      <div className="border-b border-border pb-4">
        <h3 className="text-base font-semibold text-ink">Inventory</h3>
      </div>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product name or slug…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative min-w-[160px]">
            <LayoutGrid
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              disabled={categoryOptions.length === 0}
              className="w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-9 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="relative min-w-[160px]">
            <Filter
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              aria-label="Filter by shelf quantity"
              className="w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-9 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            >
              <option value="all">All stock levels</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
          </div>

          <div className="relative min-w-[160px]">
            <Tag
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <select
              value={storefrontFilter}
              onChange={(e) =>
                setStorefrontFilter(e.target.value as StorefrontFilter)
              }
              aria-label="Filter by storefront visibility"
              className="w-full appearance-none rounded-xl border border-border bg-surface py-2.5 pl-10 pr-9 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            >
              <option value="all">All visibility</option>
              <option value="live">Live on site</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3.5 md:px-5">Product</th>
                <th className="px-4 py-3.5 md:px-5">Category</th>
                <th className="px-4 py-3.5 md:px-5">Price</th>
                <th className="px-4 py-3.5 md:px-5">Shelf status</th>
                <th className="px-4 py-3.5 md:px-5">Storefront</th>
                <th className="px-4 py-3.5 text-right md:px-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-muted-foreground"
                  >
                    No rows match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const status = stockLabel(p.stock);
                  const skuShort = p.id.slice(0, 8);
                  return (
                    <tr
                      key={p.id}
                      className="bg-surface-elevated/40 transition hover:bg-surface-elevated"
                    >
                      <td className="px-4 py-3.5 md:px-5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border bg-surface ring-1 ring-brand/10">
                            <Image
                              src="/brand/logo.png"
                              alt=""
                              fill
                              className="object-contain p-1.5"
                              sizes="44px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">
                              {p.name}
                            </p>
                            <p className="truncate font-mono text-[11px] text-muted-foreground">
                              SKU: {skuShort}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 md:px-5">
                        <span className="inline-flex rounded-md border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand">
                          {(p.category ?? "").trim()
                            ? (p.category ?? "").trim().toUpperCase()
                            : "Catalog"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 tabular-nums text-ink md:px-5">
                        {formatMoneyFromCents(p.priceCents, p.currency)}
                      </td>
                      <td className="px-4 py-3.5 md:px-5">
                        <span className="inline-flex items-center gap-2 text-ink">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                            aria-hidden
                          />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 md:px-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                            p.published
                              ? "bg-success/15 text-success"
                              : "bg-surface text-muted-foreground ring-1 ring-border"
                          }`}
                        >
                          {p.published ? "Live" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right md:px-5">
                        <ProductRowMenu product={p} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function ProductRowMenu({ product }: { product: ExplorerProduct }) {
  const shopHref = `/shop/${encodeURIComponent(product.slug)}`;

  return (
    <details className="relative inline-block text-left">
      <summary className="list-none [&::-webkit-details-marker]:hidden">
        <span className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-surface-elevated p-2 text-muted-foreground transition hover:bg-surface hover:text-ink">
          <MoreHorizontal className="h-4 w-4" aria-hidden />
          <span className="sr-only">Actions for {product.name}</span>
        </span>
      </summary>
      <div className="absolute right-0 z-20 mt-1 min-w-[11rem] rounded-xl border border-border bg-surface-elevated py-1 shadow-lg shadow-ink/[0.08] ring-1 ring-ink/[0.04]">
        {product.published ? (
          <Link
            href={shopHref}
            className="block px-3 py-2 text-sm text-ink hover:bg-surface"
            target="_blank"
            rel="noreferrer"
          >
            View on shop
          </Link>
        ) : null}
        <button
          type="button"
          className="w-full px-3 py-2 text-left text-sm text-ink hover:bg-surface"
          onClick={() => {
            void navigator.clipboard.writeText(product.slug);
          }}
        >
          Copy slug
        </button>
        <Link
          href="/dashboard/stock"
          className="block px-3 py-2 text-sm text-ink hover:bg-surface"
        >
          Adjust stock
        </Link>
      </div>
    </details>
  );
}
