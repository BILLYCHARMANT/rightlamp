"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BarChart3, CalendarDays, FilePlus, PieChart, Receipt } from "lucide-react";

export type ReportTab = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
};

export const REPORT_TABS: ReportTab[] = [
  {
    href: "/dashboard/reports",
    label: "Overview",
    icon: BarChart3,
    match: (path) => path === "/dashboard/reports" || path === "/dashboard/reports/",
  },
  {
    href: "/dashboard/reports/expenses",
    label: "Expenses",
    icon: Receipt,
    match: (path) => path.startsWith("/dashboard/reports/expenses"),
  },
  {
    href: "/dashboard/reports/monthly",
    label: "Monthly",
    icon: CalendarDays,
    match: (path) => path.startsWith("/dashboard/reports/monthly"),
  },
  {
    href: "/dashboard/reports/summary",
    label: "Report summary",
    icon: PieChart,
    match: (path) => path.startsWith("/dashboard/reports/summary"),
  },
  {
    href: "/dashboard/reports/new",
    label: "Create report",
    icon: FilePlus,
    match: (path) => path.startsWith("/dashboard/reports/new"),
  },
];

export function ReportsTabs() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="inline-flex max-w-full flex-wrap gap-1 rounded-sm bg-slate-100 p-1"
      aria-label="Reports views"
    >
      {REPORT_TABS.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition sm:px-4 ${
              active
                ? "bg-white text-ink shadow-sm"
                : "text-muted-foreground hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            <Icon size={14} aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
