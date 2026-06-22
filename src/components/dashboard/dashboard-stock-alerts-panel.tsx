import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardHomeLowItem } from "@/lib/dashboard/dashboard-home";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-panel";

export function DashboardStockAlertsPanel({
  items,
}: {
  items: DashboardHomeLowItem[];
}) {
  return (
    <DashboardPanel
      title="Stock alerts"
      description="Products on the shop that need restocking"
      gradient="warm"
      noPadding
      action={
        <Link
          href="/dashboard/stock"
          className="text-xs font-semibold text-accent hover:underline"
        >
          Warehouse
        </Link>
      }
    >
      {items.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.qty} on hand</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                    item.status === "out"
                      ? "bg-danger/12 text-danger"
                      : "bg-brand/12 text-brand"
                  }`}
                >
                  {item.status}
                </span>
                <Link
                  href="/dashboard/stock"
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  Fix
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          All products on the shop are above the reorder level.
        </p>
      )}
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
        <Link
          href="/dashboard/stock"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
        >
          Stock management
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </DashboardPanel>
  );
}
