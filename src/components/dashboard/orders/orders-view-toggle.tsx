"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import type { OrderViewMode } from "@/components/dashboard/orders/orders-utils";

const OPTIONS: { id: OrderViewMode; label: string; icon: typeof Table2 }[] = [
  { id: "table", label: "Table", icon: Table2 },
  { id: "cards", label: "Cards", icon: LayoutGrid },
];

type Props = {
  view: OrderViewMode;
  onChange: (view: OrderViewMode) => void;
};

export function OrdersViewToggle({ view, onChange }: Props) {
  return (
    <div
      className="inline-flex shrink-0 gap-1 rounded-sm bg-slate-100 p-1"
      role="group"
      aria-label="Display layout"
    >
      {OPTIONS.map((option) => {
        const active = view === option.id;
        const Icon = option.icon;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-bold transition sm:px-3 ${
              active
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            <Icon size={14} aria-hidden />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
