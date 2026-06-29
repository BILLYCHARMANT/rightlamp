"use client";

import { useMemo } from "react";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import type { OrderableProduct } from "@/lib/dashboard/order-types";

export type ProductFamilyGroup = {
  id: string;
  name: string;
  products: OrderableProduct[];
};

export function groupOrderableProducts(
  products: OrderableProduct[],
): ProductFamilyGroup[] {
  const map = new Map<string, ProductFamilyGroup>();

  for (const product of products) {
    const key = product.familyId ?? product.id;
    const existing = map.get(key);
    if (existing) {
      existing.products.push(product);
      continue;
    }
    map.set(key, {
      id: key,
      name: product.familyName ?? product.name,
      products: [product],
    });
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

type Props = {
  products: OrderableProduct[];
  selectedProductId: string;
  onSelect: (productId: string) => void;
  compact?: boolean;
};

export function OrderProductVariantPicker({
  products,
  selectedProductId,
  onSelect,
  compact = false,
}: Props) {
  const families = useMemo(() => groupOrderableProducts(products), [products]);
  const selected = products.find((p) => p.id === selectedProductId);
  const activeFamilyId = selected?.familyId ?? selected?.id ?? "";

  return (
    <div className="space-y-3">
      {families.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {families.map((family) => {
            const active = family.id === activeFamilyId;
            return (
              <button
                key={family.id}
                type="button"
                onClick={() => onSelect(family.products[0]!.id)}
                className={`rounded-sm border px-2.5 py-1 text-xs font-semibold transition ${
                  active
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {family.name}
              </button>
            );
          })}
        </div>
      ) : null}

      {(() => {
        const family =
          families.find((f) => f.id === activeFamilyId) ?? families[0];
        if (!family) return null;

        if (family.products.length <= 1) {
          const only = family.products[0]!;
          return (
            <p className={`text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
              {only.variantLabel || only.name}
              {" · "}
              {formatMoneyFromCents(only.priceCents, only.currency)}
            </p>
          );
        }

        return (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {family.products.map((product) => {
              const active = product.id === selectedProductId;
              const label = product.variantLabel || product.name;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => onSelect(product.id)}
                  className={`rounded-lg border-2 px-3 py-2.5 text-left transition ${
                    active
                      ? "border-brand bg-brand/5 shadow-sm"
                      : "border-slate-200 bg-white hover:border-brand/40"
                  }`}
                >
                  <span className="block text-sm font-semibold text-ink">{label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {product.stock > 0 ? "In stock" : "On request"}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-brand">
                    {formatMoneyFromCents(product.priceCents, product.currency)}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
