import Link from "next/link";
import { Star } from "lucide-react";
import type { DashboardTopProduct } from "@/lib/dashboard/financial-overview";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { DashboardProductThumb } from "@/components/dashboard/ui/dashboard-product-thumb";
import {
  DashboardEcomCard,
  DashboardEcomPanelHeader,
  dashboardEcomStatCardClass,
} from "@/components/dashboard/ui/dashboard-ecom";

function Stars() {
  return (
    <span className="inline-flex gap-0.5 text-[var(--dash-accent-yellow)]" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={10} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function DashboardHomeProductsGrid({
  rows,
  previewCount = 6,
}: {
  rows: DashboardTopProduct[];
  previewCount?: number;
}) {
  const items = rows.slice(0, previewCount);

  return (
    <DashboardEcomCard>
      <DashboardEcomPanelHeader title="Best selling products" />
      <div className="grid grid-cols-2 gap-2.5 p-4 sm:gap-3">
        {items.map((p) => (
          <Link
            key={p.id}
            href="/dashboard/products"
            className={`${dashboardEcomStatCardClass} flex items-center gap-2.5 p-2.5 transition hover:brightness-[0.99] sm:gap-3 sm:p-3`}
          >
            <DashboardProductThumb src={p.imageUrl} alt={p.name} size="md" />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                {p.name}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Stars />
                <span
                  className={`text-[11px] font-semibold ${
                    p.trendUp ? "text-success" : "text-danger"
                  }`}
                >
                  {p.trendUp ? "+" : "-"}
                  {p.trendPercent}%
                </span>
              </div>
              <p className="mt-1 text-sm font-bold tabular-nums text-ink">
                {formatMoneyFromCents(p.priceCents, p.currency)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </DashboardEcomCard>
  );
}
