import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { DashboardHomeMovement } from "@/lib/dashboard/dashboard-home";
import { DashboardPanel } from "@/components/dashboard/ui/dashboard-panel";

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function DashboardWarehouseActivityPanel({
  movements,
}: {
  movements: DashboardHomeMovement[];
}) {
  return (
    <DashboardPanel
      title="Warehouse pulse"
      description="Latest ledger movements"
      gradient="lavender"
      noPadding
      action={
        <Link
          href="/dashboard/stock"
          className="text-xs font-semibold text-accent hover:underline"
        >
          History
        </Link>
      }
    >
      {movements.length > 0 ? (
        <ul className="divide-y divide-slate-200">
          {movements.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 px-5 py-3.5 transition hover:bg-slate-50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">
                  {m.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {m.reason} · {formatWhen(m.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${
                  m.delta > 0 ? "text-success" : "text-danger"
                }`}
              >
                {m.delta > 0 ? "+" : ""}
                {m.delta}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No movements yet — post a stock-in to start the ledger.
        </p>
      )}
      <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
        <Link
          href="/dashboard/stock"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
        >
          Record stock-in
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </DashboardPanel>
  );
}
