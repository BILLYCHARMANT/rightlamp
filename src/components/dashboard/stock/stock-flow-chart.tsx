import type { MovementFlowPoint, FlowPeriod } from "@/lib/dashboard/stock-shared-types";
import { flowHasSignal } from "@/lib/inventory/stock-flow";
import { STOCK_FLOW_BY_PERIOD } from "@/lib/dashboard/demo-data";

function StockPanelCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface-elevated/95 shadow-sm backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

type Props = {
  period: FlowPeriod;
  onPeriod: (p: FlowPeriod) => void;
  flowByPeriod: Record<FlowPeriod, MovementFlowPoint[]>;
};

export function StockFlowChart({ period, onPeriod, flowByPeriod }: Props) {
  const live = flowByPeriod[period];
  const usingLive = flowHasSignal(live);
  const data = usingLive ? live : STOCK_FLOW_BY_PERIOD[period];
  const max = Math.max(...data.flatMap((d) => [d.in, d.out]), 1);

  return (
    <StockPanelCard className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-ink">
          Stock flow — inbound vs outbound
        </h3>
        <div className="flex flex-wrap gap-2">
          {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? "bg-brand/94 text-ink ring-1 ring-brand/15"
                  : "bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-ink"
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {usingLive
          ? "Totals from your append-only ledger — each bar pair is stock-in (green) vs stock-out (red)."
          : "No movements in this window yet — showing sample rhythm until receipts and removals are logged."}
      </p>
      <div className="flex h-72 items-end gap-2 border-b border-border pb-2 pt-2">
        {data.map((row) => (
          <div
            key={row.label}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="flex h-56 w-full items-end justify-center gap-1 px-0.5">
              <div
                className="max-w-[48%] flex-1 rounded-t-md bg-success/85 shadow-sm ring-1 ring-success/25"
                style={{
                  height: `${Math.max(10, Math.round((row.in / max) * 100))}%`,
                  minHeight: "8px",
                }}
                title={`In: ${row.in}`}
              />
              <div
                className="max-w-[48%] flex-1 rounded-t-md bg-danger/80 shadow-sm ring-1 ring-danger/25"
                style={{
                  height: `${Math.max(10, Math.round((row.out / max) * 100))}%`,
                  minHeight: "8px",
                }}
                title={`Out: ${row.out}`}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {row.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-success/85" aria-hidden />
          Stock in
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded bg-danger/80" aria-hidden />
          Stock out
        </span>
      </div>
    </StockPanelCard>
  );
}
