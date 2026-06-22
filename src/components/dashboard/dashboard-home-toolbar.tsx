import Link from "next/link";
import {
  ArrowDownCircle,
  PackagePlus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export function DashboardHomeToolbar() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
        Dashboard
      </h1>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <Link
          href="/dashboard/stock"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-ink shadow-sm shadow-brand/20 transition hover:bg-brand-hover"
        >
          <ArrowDownCircle size={16} aria-hidden />
          Stock-in
        </Link>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/30 hover:bg-canvas"
        >
          <ShoppingBag size={16} aria-hidden />
          Orders
        </Link>
        <Link
          href="/dashboard/products?create=1"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/30 hover:bg-canvas"
        >
          <PackagePlus size={16} aria-hidden />
          New product
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/30 hover:bg-canvas"
        >
          <Sparkles size={16} aria-hidden />
          Storefront
        </Link>
      </div>
    </div>
  );
}
