import { Plus } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/ui/dashboard-panel";

export function OrdersCtaCard() {
  return (
    <DashboardCard>
      <h2 className="text-base font-semibold text-ink">Create your first order</h2>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Record walk-in, phone, and delivery sales in one place. Orders sync with
        stock and financial reports when POS is connected.
      </p>
      <button
        type="button"
        disabled
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink opacity-60 cursor-not-allowed"
      >
        <Plus size={16} aria-hidden />
        Create a new sales order
      </button>
    </DashboardCard>
  );
}
