import Link from "next/link";
import { Star } from "lucide-react";
import type { DashboardTopProduct } from "@/lib/dashboard/financial-overview";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DashboardProductThumb } from "@/components/dashboard/ui/dashboard-product-thumb";
import {
  DashboardEcomCard,
  DashboardEcomPanelHeader,
  DashboardEcomViewAll,
} from "@/components/dashboard/ui/dashboard-ecom";

function Stars() {
  return (
    <span className="inline-flex gap-0.5 text-[var(--dash-accent-yellow)]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={11} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function DashboardHomeBestProducts({
  rows,
  previewCount = 5,
}: {
  rows: DashboardTopProduct[];
  previewCount?: number;
}) {
  const items = rows.slice(0, previewCount);

  return (
    <DashboardEcomCard className="flex h-full flex-col">
      <DashboardEcomPanelHeader title="Best selling products" />
      <ul className="flex flex-1 flex-col divide-y divide-slate-100">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              href="/dashboard/products"
              className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/80"
            >
              <DashboardProductThumb src={p.imageUrl} alt={p.name} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Stars />
                  <span
                    className={`text-xs font-semibold ${
                      p.trendUp ? "text-success" : "text-danger"
                    }`}
                  >
                    {p.trendUp ? "+" : "-"}
                    {p.trendPercent}%
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-ink">
                  {formatMoneyFromCents(p.priceCents, p.currency)}
                </p>
                <p className="text-[11px] text-muted-foreground">{p.qtySold} sold</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <DashboardEcomViewAll href="/dashboard/products" />
    </DashboardEcomCard>
  );
}
