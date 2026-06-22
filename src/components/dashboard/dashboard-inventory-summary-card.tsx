import { Boxes } from "lucide-react";
import { DashboardGridBox } from "@/components/dashboard/ui/dashboard-grid-box";

type Props = {
  inventoryValue: string;
  unitsOnHand: number;
  publishedSkus: number;
};

export function DashboardInventorySummaryCard({
  inventoryValue,
  unitsOnHand,
  publishedSkus,
}: Props) {
  return (
    <DashboardGridBox as="section" gradient="warm" className="flex h-full flex-col p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/12 text-brand ring-1 ring-brand/15">
          <Boxes size={20} strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Inventory &amp; assets</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Stock valuation at cost
          </p>
        </div>
      </div>

      <p className="mt-6 text-[1.75rem] font-bold leading-tight tracking-tight text-brand sm:text-3xl">
        <span className="tabular-nums">{inventoryValue}</span>
      </p>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Current asset valuation
      </p>

      <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Units
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-ink">
            {unitsOnHand.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Products on shop
          </p>
          <p className="mt-1 text-lg font-bold tabular-nums text-ink">
            {publishedSkus}
          </p>
        </div>
      </div>
    </DashboardGridBox>
  );
}
