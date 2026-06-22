import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  FilePlus,
  LayoutGrid,
  Package,
  Receipt,
  ShoppingBag,
  Warehouse,
} from "lucide-react";
import { DashboardGridBox } from "@/components/dashboard/ui/dashboard-grid-box";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/stock", label: "Stock", icon: Warehouse },
  { href: "/dashboard/reports/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/reports/monthly", label: "Monthly", icon: CalendarDays },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/reports/new", label: "New report", icon: FilePlus },
];

export function DashboardHomeShortcuts() {
  return (
    <DashboardGridBox as="section" gradient="neutral" className="p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-muted-foreground ring-1 ring-border/80">
          <LayoutGrid size={20} strokeWidth={2} aria-hidden />
        </span>
        <div>
          <h2 className="text-base font-bold text-ink">Quick links</h2>
          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Jump to any hub
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-brand/40 hover:bg-brand/5"
          >
            <Icon size={15} className="text-brand" aria-hidden />
            {label}
          </Link>
        ))}
      </div>
    </DashboardGridBox>
  );
}
