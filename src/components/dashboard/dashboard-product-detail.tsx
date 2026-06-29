import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import { DashboardMediaImage } from "@/components/dashboard/dashboard-media-image";
import { DashboardProductEditButton } from "@/components/dashboard/dashboard-product-edit-button";
import type { ProductCategoryOption } from "@/components/dashboard/dashboard-product-form-modal";
import { DashboardProductVersionsPanel } from "@/components/dashboard/dashboard-product-versions-panel";
import type { ProductVersionRow } from "@/lib/dashboard/product-queries";
import { DashboardEcomCard } from "@/components/dashboard/ui/dashboard-ecom";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { resolveProductImageUrl } from "@/lib/dashboard/product-images";

type Props = {
  product: ExplorerProduct;
  versions: ProductVersionRow[];
  categories: ProductCategoryOption[];
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function stockMeta(stock: number) {
  if (stock === 0) {
    return { label: "Out of stock", className: "bg-red-50 text-red-700 ring-red-100" };
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return {
      label: `Low stock · ${stock} units`,
      className: "bg-orange-50 text-orange-700 ring-orange-100",
    };
  }
  return {
    label: `In stock · ${stock} units`,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
}

function profitDisplay(product: ExplorerProduct) {
  if (product.costPriceCents == null) {
    return { label: "—", className: "text-slate-400" };
  }
  const profit = product.priceCents - product.costPriceCents;
  const label = formatMoneyFromCents(profit, product.currency);
  if (profit < 0) return { label, className: "text-red-600" };
  if (profit > 0) return { label, className: "text-emerald-600" };
  return { label, className: "text-slate-500" };
}

export function DashboardProductDetail({ product, versions, categories }: Props) {
  const imageUrl = resolveProductImageUrl(
    product.images,
    product.slug,
    product.category,
  );
  const stock = stockMeta(product.stock);
  const profit = profitDisplay(product);
  const cost =
    product.costPriceCents == null
      ? "—"
      : formatMoneyFromCents(product.costPriceCents, product.currency);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-[var(--dash-teal)] hover:text-[var(--dash-teal)]"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to all products
        </Link>
        <DashboardProductEditButton product={product} categories={categories} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_1fr]">
        <DashboardEcomCard className="overflow-hidden p-0">
          <div className="relative aspect-square bg-slate-50">
            <DashboardMediaImage
              src={imageUrl}
              alt={product.name}
              fill
              objectFit="contain"
              className="p-6"
            />
          </div>
        </DashboardEcomCard>

        <div className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
                  product.published
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    : "bg-slate-100 text-slate-600 ring-slate-200"
                }`}
              >
                {product.published ? "Live on storefront" : "Draft"}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${stock.className}`}
              >
                {stock.label}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-1 font-mono text-sm text-slate-500">{product.slug}</p>
            <p className="mt-2 text-sm text-slate-600">
              {(product.category ?? "").trim() || "Uncategorized"}
              {product.familyName
                ? ` · ${product.familyName}`
                : ""}
              {product.variantLabel ? ` · ${product.variantLabel}` : ""}
            </p>
          </div>

          <DashboardEcomCard className="grid gap-4 p-5 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Retail price
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatMoneyFromCents(product.priceCents, product.currency)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Purchase cost
              </p>
              <p className="mt-1 text-lg font-bold text-slate-700">{cost}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Unit profit
              </p>
              <p className={`mt-1 text-lg font-bold ${profit.className}`}>{profit.label}</p>
            </div>
          </DashboardEcomCard>

          {product.description ? (
            <DashboardEcomCard className="p-5">
              <h2 className="text-sm font-semibold text-slate-900">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                {product.description}
              </p>
            </DashboardEcomCard>
          ) : null}

          <p className="text-xs text-slate-500">
            Created {formatWhen(product.createdAt)} · Last updated{" "}
            {formatWhen(product.updatedAt)}
          </p>
        </div>
      </div>

      <DashboardProductVersionsPanel
        productId={product.id}
        familyId={product.familyId}
        familyName={product.familyName}
        currentVariantLabel={product.variantLabel}
        currency={product.currency}
        description={product.description}
        versions={versions}
        categories={categories}
      />

      <DashboardEcomCard className="overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[var(--dash-teal)]" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Accessories</h2>
              <p className="text-xs text-slate-500">
                {product.accessories.length === 0
                  ? "No add-ons linked to this product yet."
                  : `${product.accessories.length} optional add-on${product.accessories.length === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
        </div>

        {product.accessories.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Add accessories when editing this product to offer bundles or extras at checkout.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {product.accessories.map((accessory) => (
              <li
                key={accessory.id}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/80"
              >
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                  {accessory.imageUrl ? (
                    <DashboardMediaImage src={accessory.imageUrl} alt="" fill />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase text-slate-400">
                      N/A
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{accessory.name}</p>
                  <p className="text-xs text-slate-500">Sort order {accessory.sortOrder + 1}</p>
                </div>
                <p className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                  {accessory.priceCents > 0
                    ? formatMoneyFromCents(accessory.priceCents, product.currency)
                    : "Included"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DashboardEcomCard>
    </div>
  );
}
