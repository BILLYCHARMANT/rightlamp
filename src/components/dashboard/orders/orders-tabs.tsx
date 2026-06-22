"use client";

import type { OrderTabFilter } from "@/components/dashboard/orders/orders-utils";
import { ORDER_TABS } from "@/components/dashboard/orders/orders-utils";

type Props = {
  tab: OrderTabFilter;
  onChange: (tab: OrderTabFilter) => void;
};

/** Stitch orders-management — segmented pill tabs in slate track */
export function OrdersTabs({ tab, onChange }: Props) {
  return (
    <nav
      className="inline-flex flex-wrap gap-1 rounded-sm bg-slate-100 p-1"
      aria-label="Order views"
    >
      {ORDER_TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`rounded-sm px-3 py-1.5 text-xs font-bold transition sm:px-4 ${
              active
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );
}
