"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { DashboardProductFormModal } from "@/components/dashboard/dashboard-product-form-modal";
import type { ProductCategoryOption } from "@/components/dashboard/dashboard-product-form-modal";
import { DashboardProductVersionDetailModal } from "@/components/dashboard/dashboard-product-version-detail-modal";
import type { ProductVersionRow } from "@/lib/dashboard/product-queries";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DashboardEcomCard } from "@/components/dashboard/ui/dashboard-ecom";

type Props = {
  productId: string;
  familyId: string | null;
  familyName: string | null;
  currentVariantLabel: string | null;
  currency: string;
  description: string | null;
  versions: ProductVersionRow[];
  categories: ProductCategoryOption[];
};

export function DashboardProductVersionsPanel({
  productId,
  familyId,
  familyName,
  currentVariantLabel,
  currency,
  description,
  versions,
  categories,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [detailVersionId, setDetailVersionId] = useState<string | null>(null);

  return (
    <>
      <DashboardEcomCard className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">Product versions</h2>
            <p className="text-xs text-slate-500">
              {familyName
                ? `${familyName} — click a version for details`
                : "Link versions by creating a new size from this product family."}
            </p>
          </div>
          {familyId ? (
            <button
              type="button"
              onClick={() => {
                setCreateKey((key) => key + 1);
                setCreateOpen(true);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-brand px-3 py-1.5 text-xs font-semibold text-ink shadow-sm transition hover:bg-brand-hover"
            >
              <Plus size={14} aria-hidden />
              New version
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(7.25rem,1fr))] gap-2 p-4 sm:gap-2.5 sm:p-5">
          {versions.map((version) => {
            const selected = version.id === productId;
            const label = version.variantLabel || version.name;
            const stockLabel =
              version.stock > 0 ? `${version.stock} in stock` : "On request";

            return (
              <button
                key={version.id}
                type="button"
                title={version.name}
                onClick={() => setDetailVersionId(version.id)}
                className={`block min-w-0 rounded-md border px-2.5 py-2 text-left transition ${
                  selected
                    ? "border-brand bg-brand/5 shadow-sm ring-1 ring-brand/20"
                    : "border-slate-200 bg-white hover:border-brand/40 hover:bg-slate-50/80"
                }`}
              >
                <p className="truncate text-xs font-semibold text-ink">{label}</p>
                <p className="mt-0.5 truncate text-[10px] leading-snug text-slate-500">
                  {version.published ? "Live" : "Draft"} · {stockLabel}
                </p>
                <p className="mt-1.5 truncate text-sm font-bold tabular-nums text-slate-900">
                  {formatMoneyFromCents(version.priceCents, version.currency)}
                </p>
              </button>
            );
          })}
        </div>

        {currentVariantLabel ? (
          <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500 sm:px-5">
            Current version:{" "}
            <strong className="text-slate-700">{currentVariantLabel}</strong>
          </p>
        ) : null}
      </DashboardEcomCard>

      <DashboardProductVersionDetailModal
        versionId={detailVersionId}
        isOpen={detailVersionId != null}
        onClose={() => setDetailVersionId(null)}
        categories={categories}
      />

      {familyId && familyName ? (
        <DashboardProductFormModal
          key={createKey}
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          categories={categories}
          mode="version"
          versionContext={{
            familyId,
            familyName,
            currency,
            description,
          }}
        />
      ) : null}
    </>
  );
}
