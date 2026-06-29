"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DashboardProductFormModal } from "@/components/dashboard/dashboard-product-form-modal";
import { DashboardProductsExplorer } from "@/components/dashboard/dashboard-products-explorer";
import { DashboardProductsManagementBar } from "@/components/dashboard/dashboard-products-management-bar";
import { DashboardEcomCard } from "@/components/dashboard/ui/dashboard-ecom";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import { fetchDashboardProductForEdit } from "@/lib/dashboard/product-actions";
import { toExplorerProductFromEdit } from "@/lib/dashboard/explorer-product";

import type { ProductCategoryOption } from "@/components/dashboard/dashboard-product-form-modal";

type Props = {
  explorerProducts: ExplorerProduct[];
  categories: ProductCategoryOption[];
  initialCreateOpen: boolean;
  initialEditId?: string | null;
  connectionWarning?: string | null;
};

export function DashboardProductsHub({
  explorerProducts,
  categories,
  initialCreateOpen,
  initialEditId = null,
  connectionWarning,
}: Props) {
  const router = useRouter();
  const [, startEditTransition] = useTransition();
  const initialEditProduct =
    initialEditId != null
      ? explorerProducts.find((item) => item.id === initialEditId) ?? null
      : null;

  const [formOpen, setFormOpen] = useState(
    initialCreateOpen || initialEditProduct != null,
  );
  const [editingProduct, setEditingProduct] = useState<ExplorerProduct | null>(
    initialEditProduct,
  );
  const [formKey, setFormKey] = useState(initialEditProduct ? 1 : 0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!initialEditId) return;

    startEditTransition(async () => {
      const result = await fetchDashboardProductForEdit(initialEditId);
      if (!result.ok) return;
      setEditingProduct(toExplorerProductFromEdit(result.product));
      setFormKey((k) => k + 1);
    });
  }, [initialEditId]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  };

  const openEdit = (product: ExplorerProduct) => {
    startEditTransition(async () => {
      const result = await fetchDashboardProductForEdit(product.id);
      setEditingProduct(
        result.ok ? toExplorerProductFromEdit(result.product) : product,
      );
      setFormKey((k) => k + 1);
      setFormOpen(true);
    });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
    router.replace("/dashboard/products", { scroll: false });
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
        onClose={closeForm}
        categories={categories}
      />
    </div>
  );
}
