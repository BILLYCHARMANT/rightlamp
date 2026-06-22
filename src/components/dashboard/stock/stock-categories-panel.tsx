"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  createProductCategory,
  deleteProductCategory,
  updateProductCategory,
  type ProductCategoryRow,
} from "@/lib/dashboard/category-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";

type Props = {
  categories: ProductCategoryRow[];
};

function PanelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-elevated/95 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function StockCategoriesPanel({ categories }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [viewCategory, setViewCategory] = useState<ProductCategoryRow | null>(
    null,
  );
  const [editCategory, setEditCategory] = useState<ProductCategoryRow | null>(
    null,
  );
  const [editName, setEditName] = useState("");

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createProductCategory(name);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setName("");
      router.refresh();
    });
  }

  function openEdit(category: ProductCategoryRow) {
    setEditCategory(category);
    setEditName(category.name);
    setError(null);
  }

  function handleUpdate() {
    if (!editCategory) return;
    setError(null);

    startTransition(async () => {
      const result = await updateProductCategory(editCategory.id, editName);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setEditCategory(null);
      router.refresh();
    });
  }

  function handleDelete(id: string, categoryName: string) {
    if (
      !window.confirm(
        `Delete "${categoryName}"? Items in this category will become uncategorized.`,
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteProductCategory(id);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 pb-6">
      <PanelCard className="p-4 md:p-6">
        <h2 className="text-sm font-semibold text-ink">Create category</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Add categories here before creating warehouse items.
        </p>

        <form
          onSubmit={handleCreate}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="min-w-0 flex-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. LED fixtures"
              className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <button
            type="submit"
            disabled={pending || !name.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
          >
            <Plus size={16} aria-hidden />
            {pending ? "Saving…" : "Create category"}
          </button>
        </form>

        {error && !editCategory ? (
          <p role="alert" className="mt-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </PanelCard>

      <PanelCard className="overflow-hidden">
        <table className="dash-data-table dash-data-table--flush w-full min-w-[520px] text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 md:px-6">Category</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3 md:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-10 text-center text-muted-foreground md:px-6"
                >
                  No categories yet. Create one above, then add items.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-medium md:px-6">
                    {category.name}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{category.itemCount}</td>
                  <td className="px-4 py-3 md:px-6">
                    <DashboardTableRowActions
                      disabled={pending}
                      onView={() => setViewCategory(category)}
                      onEdit={() => openEdit(category)}
                      onDelete={() => handleDelete(category.id, category.name)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </PanelCard>

      <PodShellModal
        isOpen={Boolean(viewCategory)}
        title="Category details"
        onClose={() => setViewCategory(null)}
        footer={
          <button
            type="button"
            onClick={() => setViewCategory(null)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
          >
            Close
          </button>
        }
      >
        {viewCategory ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Name
              </dt>
              <dd className="mt-1 font-medium text-ink">{viewCategory.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Items
              </dt>
              <dd className="mt-1 tabular-nums">{viewCategory.itemCount}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1 text-muted-foreground">
                {formatWhen(viewCategory.createdAt)}
              </dd>
            </div>
          </dl>
        ) : null}
      </PodShellModal>

      <PodShellModal
        isOpen={Boolean(editCategory)}
        title="Edit category"
        onClose={() => {
          setEditCategory(null);
          setError(null);
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditCategory(null)}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || !editName.trim()}
              onClick={handleUpdate}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </>
        }
      >
        {error && editCategory ? (
          <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <label className="block text-sm font-medium">
          Category name
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
          />
        </label>
      </PodShellModal>
    </div>
  );
}
