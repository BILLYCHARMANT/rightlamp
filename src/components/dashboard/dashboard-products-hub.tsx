"use client";

import { useState } from "react";
import { DashboardProductCreateModal } from "@/components/dashboard/dashboard-product-create-modal";
import { DashboardProductsExplorer } from "@/components/dashboard/dashboard-products-explorer";
import { DashboardProductsHeroMetrics } from "@/components/dashboard/dashboard-products-hero-metrics";
import { DashboardProductsManagementBar } from "@/components/dashboard/dashboard-products-management-bar";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";

type Props = {
  explorerProducts: ExplorerProduct[];
  totalProducts: number;
  newThisMonth: number;
  publishedSkus: number;
  totalSkus: number;
  categorySuggestions: string[];
  initialCreateOpen: boolean;
  /** Shown when catalog queries failed (e.g. DB host unreachable). */
  connectionWarning?: string | null;
};

export function DashboardProductsHub({
  explorerProducts,
  totalProducts,
  newThisMonth,
  publishedSkus,
  totalSkus,
  categorySuggestions,
  initialCreateOpen,
  connectionWarning,
}: Props) {
  const [createOpen, setCreateOpen] = useState(initialCreateOpen);
  const [createModalKey, setCreateModalKey] = useState(0);

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {connectionWarning ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-ink"
        >
          {connectionWarning}
        </p>
      ) : null}
      <DashboardProductsHeroMetrics
        totalProducts={totalProducts}
        newThisMonth={newThisMonth}
        publishedSkus={publishedSkus}
        totalSkus={totalSkus}
      />

      <DashboardProductsManagementBar
        products={explorerProducts}
        onOpenCreate={() => {
          setCreateModalKey((k) => k + 1);
          setCreateOpen(true);
        }}
      />

      <DashboardProductsExplorer products={explorerProducts} />

      <DashboardProductCreateModal
        key={createModalKey}
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        categorySuggestions={categorySuggestions}
      />
    </div>
  );
}
