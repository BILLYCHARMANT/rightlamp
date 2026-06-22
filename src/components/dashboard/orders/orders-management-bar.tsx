"use client";

import { Download, Plus } from "lucide-react";

type Props = {
  onExport: () => void;
  onCreate: () => void;
};

export function OrdersManagementBar({ onExport, onCreate }: Props) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-hanken)] text-3xl font-black tracking-tight text-slate-900">
          Orders
        </h1>
        <p className="mt-2 text-xs text-slate-500">
          Manage sales requests from the shop and staff-entered orders.
        </p>
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
          onClick={onCreate}
          className="dash-btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm"
        >
          <Plus size={15} aria-hidden />
          New sales order
        </button>
      </div>
    </div>
  );
}
