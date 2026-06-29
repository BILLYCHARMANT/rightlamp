"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import {
  DashboardProductFormModal,
  type ProductCategoryOption,
} from "@/components/dashboard/dashboard-product-form-modal";
import { fetchDashboardProductForEdit } from "@/lib/dashboard/product-actions";
import { toExplorerProductFromEdit } from "@/lib/dashboard/explorer-product";

type Props = {
  product: ExplorerProduct;
  categories: ProductCategoryOption[];
};

export function DashboardProductEditButton({ product, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingProduct, setEditingProduct] = useState<ExplorerProduct | null>(
    null,
  );
  const [, startEditTransition] = useTransition();

  const openEdit = () => {
    startEditTransition(async () => {
      const result = await fetchDashboardProductForEdit(product.id);
      setEditingProduct(
        result.ok ? toExplorerProductFromEdit(result.product) : product,
      );
      setFormKey((key) => key + 1);
      setOpen(true);
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openEdit}
        className="inline-flex items-center gap-2 rounded-sm bg-brand/94 px-4 py-2 text-sm font-semibold text-ink shadow-sm ring-1 ring-brand/15 transition hover:bg-brand-hover"
      >
        <Pencil size={15} aria-hidden />
        Edit product
      </button>

      <DashboardProductFormModal
        key={formKey}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct ?? product}
        categories={categories}
      />
    </>
  );
}
