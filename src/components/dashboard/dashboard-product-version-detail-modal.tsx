"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { ExternalLink, Pencil } from "lucide-react";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import type { ProductCategoryOption } from "@/components/dashboard/dashboard-product-form-modal";
import { DashboardProductFormModal } from "@/components/dashboard/dashboard-product-form-modal";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { fetchDashboardProductForEdit } from "@/lib/dashboard/product-actions";
import { toExplorerProductFromEdit } from "@/lib/dashboard/explorer-product";
import { resolveProductImageUrl } from "@/lib/dashboard/product-images";
import { DashboardMediaImage } from "@/components/dashboard/dashboard-media-image";

type Props = {
  versionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategoryOption[];
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8.5rem_1fr] sm:items-start">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-900">{value}</dd>
    </div>
  );
}

export function DashboardProductVersionDetailModal({
  versionId,
  isOpen,
  onClose,
  categories,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<ExplorerProduct | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editKey, setEditKey] = useState(0);

  const handleClose = () => {
    setProduct(null);
    setError(null);
    setEditOpen(false);
    onClose();
  };

  useEffect(() => {
    if (!isOpen || !versionId) return;

    startTransition(async () => {
      const result = await fetchDashboardProductForEdit(versionId);
      if (!result.ok) {
        setError(result.message);
        setProduct(null);
        return;
      }
      setError(null);
      setProduct(toExplorerProductFromEdit(result.product));
    });
  }, [isOpen, versionId]);

  const loading =
    isOpen && versionId != null && (pending || product?.id !== versionId);

  const title = product?.variantLabel || product?.name || "Product version";
  const sortedImages = [...(product?.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const heroUrl = product
    ? resolveProductImageUrl(product.images, product.slug, product.category)
    : null;

  return (
    <>
      <PodShellModal
        isOpen={isOpen}
        title={title}
        onClose={handleClose}
        maxWidthClass="max-w-2xl"
        footer={
          product ? (
            <div className="flex w-full flex-col gap-3">
              {error ? (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </p>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-muted/40"
                >
                  Close
                </button>
                <Link
                  href={`/dashboard/products/${product.id}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-muted/40"
                >
                  <ExternalLink size={15} aria-hidden />
                  Open page
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setEditKey((key) => key + 1);
                    setEditOpen(true);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-hover"
                >
                  <Pencil size={15} aria-hidden />
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink"
            >
              Close
            </button>
          )
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading version…</p>
        ) : error && !product ? (
          <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : product ? (
          <div className="space-y-5">
            {heroUrl ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {sortedImages.length > 0 ? (
                  sortedImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                    >
                      <DashboardMediaImage src={image.url} alt={image.label ?? ""} fill />
                    </div>
                  ))
                ) : (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                    <DashboardMediaImage
                      src={heroUrl}
                      alt=""
                      fill
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>
            ) : null}

            <dl className="space-y-3 rounded-xl border border-border bg-surface/60 p-4">
              <InfoRow
                label="Version"
                value={product.variantLabel?.trim() || "—"}
              />
              <InfoRow label="Product name" value={product.name} />
              <InfoRow
                label="Product line"
                value={product.familyName?.trim() || "—"}
              />
              <InfoRow label="Slug" value={<code className="text-xs">{product.slug}</code>} />
              <InfoRow
                label="Category"
                value={product.category?.trim() || "Uncategorized"}
              />
              <InfoRow
                label="Status"
                value={
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      product.published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {product.published ? "Published" : "Draft"}
                  </span>
                }
              />
              <InfoRow
                label="Retail price"
                value={formatMoneyFromCents(product.priceCents, product.currency)}
              />
              <InfoRow
                label="Purchase cost"
                value={
                  product.costPriceCents != null
                    ? formatMoneyFromCents(product.costPriceCents, product.currency)
                    : "—"
                }
              />
              <InfoRow label="Stock" value={`${product.stock} units`} />
            </dl>

            {product.description ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Description
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {product.description}
                </p>
              </div>
            ) : null}

            {product.accessories.length > 0 ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Accessories ({product.accessories.length})
                </p>
                <ul className="mt-2 space-y-2">
                  {product.accessories.map((accessory) => (
                    <li
                      key={accessory.id}
                      className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                    >
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-slate-100 bg-slate-50">
                        {accessory.imageUrl ? (
                          <DashboardMediaImage
                            src={accessory.imageUrl}
                            alt=""
                            fill
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-[9px] text-slate-400">
                            N/A
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
                        {accessory.name}
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-slate-600">
                        {accessory.priceCents > 0
                          ? formatMoneyFromCents(
                              accessory.priceCents,
                              product.currency,
                            )
                          : "Included"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </PodShellModal>

      {product && editOpen ? (
        <DashboardProductFormModal
          key={editKey}
          isOpen={editOpen}
          onClose={() => {
            setEditOpen(false);
            handleClose();
          }}
          categories={categories}
          product={product}
        />
      ) : null}
    </>
  );
}
