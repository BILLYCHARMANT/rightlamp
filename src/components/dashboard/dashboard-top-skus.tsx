import type { DemoSkuRank } from "@/lib/dashboard/demo-data";

export function DashboardTopSkus({ rows }: { rows: DemoSkuRank[] }) {
  const maxQty = Math.max(...rows.map((r) => r.qty), 1);

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li
          key={r.rank}
          className="rounded-lg border border-border bg-surface p-3 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/12 text-xs font-bold text-accent ring-1 ring-accent/20">
                {r.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.qty} units · {r.revenueRwf.toLocaleString()} RWF
                </p>
              </div>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-accent/70"
              style={{ width: `${Math.round((r.qty / maxQty) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
