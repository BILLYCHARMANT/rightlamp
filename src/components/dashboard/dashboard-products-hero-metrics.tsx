import { Box, TrendingUp } from "lucide-react";

type Props = {
  totalProducts: number;
  newThisMonth: number;
  publishedSkus: number;
  totalSkus: number;
};

export function DashboardProductsHeroMetrics({
  totalProducts,
  newThisMonth,
  publishedSkus,
  totalSkus,
}: Props) {
  const livePct =
    totalSkus > 0 ? Math.round((publishedSkus / totalSkus) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="dash-stat-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Total products
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-ink">
              {totalProducts}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-brand" aria-hidden />
              <span>
                <span className="font-semibold text-brand">+{newThisMonth}</span>{" "}
                new this month
              </span>
            </p>
          </div>
          <div className="rounded-xl bg-brand/12 p-3 text-brand ring-1 ring-brand/20">
            <Box className="h-6 w-6" aria-hidden />
          </div>
        </div>
      </div>

      <div className="dash-stat-card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Live on storefront
            </p>
            <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-ink">
              {livePct}%
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-brand">{publishedSkus}</span>{" "}
              of {totalSkus} products visible to shoppers
            </p>
          </div>
          <div className="rounded-xl bg-[var(--dash-accent-yellow)]/25 p-3 text-brand ring-1 ring-brand/20">
            <TrendingUp className="h-6 w-6" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
