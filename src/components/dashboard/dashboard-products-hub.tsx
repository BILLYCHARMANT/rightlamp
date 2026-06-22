"use client";

import { useState } from "react";
import { DashboardProductFormModal } from "@/components/dashboard/dashboard-product-form-modal";
import { DashboardProductsExplorer } from "@/components/dashboard/dashboard-products-explorer";
import { DashboardProductsManagementBar } from "@/components/dashboard/dashboard-products-management-bar";
import { DashboardEcomCard } from "@/components/dashboard/ui/dashboard-ecom";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";

import type { ProductCategoryOption } from "@/components/dashboard/dashboard-product-form-modal";

type Props = {
  explorerProducts: ExplorerProduct[];
  categories: ProductCategoryOption[];
  initialCreateOpen: boolean;
  connectionWarning?: string | null;
};

export function DashboardProductsHub({
  explorerProducts,
  categories,
  initialCreateOpen,
  connectionWarning,
}: Props) {
  const [formOpen, setFormOpen] = useState(initialCreateOpen);
  const [editingProduct, setEditingProduct] = useState<ExplorerProduct | null>(
    null,
  );
  const [formKey, setFormKey] = useState(0);
  const [search, setSearch] = useState("");

  const openCreate = () => {
    setEditingProduct(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = (product: ExplorerProduct) => {
    setEditingProduct(product);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  return (
    <div>
      {connectionWarning ? (
        <p
          role="alert"
          className="mb-6 rounded-sm border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-ink"
        >
          {connectionWarning}
        </p>
      ) : null}

      <DashboardProductsManagementBar
        products={explorerProducts}
        onOpenCreate={openCreate}
      />

      <DashboardEcomCard className="overflow-hidden">
        <DashboardProductsExplorer
          products={explorerProducts}
          search={search}
          onSearchChange={setSearch}
          onEdit={openEdit}
        />
      </DashboardEcomCard>

      <DashboardProductFormModal
        key={formKey}
        isOpen={formOpen}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        categories={categories}
      />
    </div>
  );
}
