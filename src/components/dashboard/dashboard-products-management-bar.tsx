"use client";

import { useCallback } from "react";
import { Plus, Upload } from "lucide-react";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function buildProductsCsv(rows: ExplorerProduct[]): string {
  const header = [
    "name",
    "slug",
    "category",
    "price_cents",
    "currency",
    "stock",
    "published",
    "updated_at",
  ];
  const lines = rows.map((p) =>
    [
      csvEscape(p.name),
      csvEscape(p.slug),
      csvEscape((p.category ?? "").trim()),
      String(p.priceCents),
      csvEscape(p.currency),
      String(p.stock),
      p.published ? "true" : "false",
      csvEscape(p.updatedAt),
    ].join(","),
  );
  return [header.join(","), ...lines].join("\r\n");
}

type Props = {
  products: ExplorerProduct[];
  onOpenCreate: () => void;
};

export function DashboardProductsManagementBar({
  products,
  onOpenCreate,
}: Props) {
  const onExport = useCallback(() => {
    const csv = buildProductsCsv(products);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rightlamps-products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [products]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Product management
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time control center for products.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-medium text-ink shadow-sm shadow-ink/[0.02] transition hover:bg-surface"
        >
          <Upload className="h-4 w-4 text-muted-foreground" aria-hidden />
          Export
        </button>
        <button
          type="button"
          onClick={onOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/20 ring-1 ring-brand/25 transition hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New product
        </button>
      </div>
    </div>
  );
}
