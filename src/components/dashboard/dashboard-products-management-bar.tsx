"use client";

import { useCallback, useState } from "react";
import { Download, Plus, RefreshCw } from "lucide-react";
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
    "description",
    "price_cents",
    "cost_price_cents",
    "currency",
    "stock",
    "published",
    "created_at",
    "updated_at",
  ];
  const lines = rows.map((p) =>
    [
      csvEscape(p.name),
      csvEscape(p.slug),
      csvEscape((p.category ?? "").trim()),
      csvEscape((p.description ?? "").trim()),
      String(p.priceCents),
      p.costPriceCents != null ? String(p.costPriceCents) : "",
      csvEscape(p.currency),
      String(p.stock),
      p.published ? "true" : "false",
      csvEscape(p.createdAt),
      csvEscape(p.updatedAt),
    ].join(","),
  );
  return [header.join(","), ...lines].join("\r\n");
}

type Props = {
  products: ExplorerProduct[];
  onOpenCreate: () => void;
};

function formatRefreshedAt(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function DashboardProductsManagementBar({
  products,
  onOpenCreate,
}: Props) {
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  const onExport = useCallback(() => {
    const csv = buildProductsCsv(products);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pv-grid-products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [products]);

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-hanken)] text-3xl font-black tracking-tight text-slate-900">
          Products Management
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => setRefreshedAt(new Date())}
            className="inline-flex items-center gap-1 transition hover:text-[var(--dash-teal)]"
          >
            <RefreshCw size={12} aria-hidden />
            Data refreshed
          </button>
          {refreshedAt ? (
            <span className="rounded-sm border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-600">
              {formatRefreshedAt(refreshedAt)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="dash-btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
        >
          <Download size={15} className="text-slate-500" aria-hidden />
          Export CSV
        </button>
        <button
          type="button"
          onClick={onOpenCreate}
          className="dash-btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm"
        >
          <Plus size={15} aria-hidden />
          Add New Product
        </button>
      </div>
    </div>
  );
}
