import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CalendarDays,
  FilePlus,
  LayoutDashboard,
  Package,
  PieChart,
  Receipt,
  ShoppingBag,
  Sparkles,
  Store,
  UsersRound,
  Warehouse,
} from "lucide-react";

export type DashboardNavSectionId =
  | "overview"
  | "sales"
  | "catalog"
  | "finance"
  | "insights"
  | "team";

export const DASHBOARD_NAV_SECTIONS: Record<
  DashboardNavSectionId,
  { label: string }
> = {
  overview: { label: "Overview" },
  sales: { label: "Sales & storefront" },
  catalog: { label: "Catalog & warehouse" },
  finance: { label: "Money & rhythm" },
  insights: { label: "Insights" },
  team: { label: "Team & access" },
};

export const DASHBOARD_SECTION_ORDER: DashboardNavSectionId[] = [
  "overview",
  "sales",
  "catalog",
  "finance",
  "insights",
  "team",
];

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  section: DashboardNavSectionId;
  match: (path: string) => boolean;
  /** Jump menu / future command search */
  keywords?: string[];
  /** When false, item is used for titles / routing only (not shown in sidebar or jump). */
  showInNav?: boolean;
};

/** Mirrors Rightlamps admin IA — order matters for `find` title fallback */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "overview",
    match: (path) => path === "/dashboard" || path === "/dashboard/",
    keywords: ["home", "overview"],
  },
  {
    href: "/dashboard/my-shop",
    label: "My shop",
    icon: Store,
    section: "sales",
    match: (path) => path.startsWith("/dashboard/my-shop"),
    keywords: ["shop", "storefront", "vendor"],
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: ShoppingBag,
    section: "sales",
    match: (path) => path.startsWith("/dashboard/orders"),
    keywords: ["sales", "purchases"],
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: Package,
    section: "catalog",
    match: (path) => path.startsWith("/dashboard/products"),
    keywords: ["sku", "inventory list", "create", "add sku", "quick create"],
  },
  {
    href: "/dashboard/stock",
    label: "Stock",
    icon: Warehouse,
    section: "catalog",
    match: (path) => path.startsWith("/dashboard/stock"),
    keywords: ["warehouse", "quantity"],
  },
  {
    href: "/dashboard/specials",
    label: "Specials",
    icon: Sparkles,
    section: "catalog",
    match: (path) => path.startsWith("/dashboard/specials"),
    keywords: ["promo", "offers"],
  },
  {
    href: "/dashboard/expenses",
    label: "Expenses",
    icon: Receipt,
    section: "finance",
    match: (path) => path.startsWith("/dashboard/expenses"),
    keywords: ["bills", "spend"],
  },
  {
    href: "/dashboard/monthly",
    label: "Monthly",
    icon: CalendarDays,
    section: "finance",
    match: (path) => path.startsWith("/dashboard/monthly"),
    keywords: ["calendar", "close"],
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: BarChart3,
    section: "insights",
    match: (path) =>
      path === "/dashboard/reports" || path === "/dashboard/reports/",
    keywords: ["analytics", "charts"],
  },
  {
    href: "/dashboard/reports/summary",
    label: "Report summary",
    icon: PieChart,
    section: "insights",
    match: (path) => path.startsWith("/dashboard/reports/summary"),
    keywords: ["totals", "rollup"],
  },
  {
    href: "/dashboard/reports/new",
    label: "Create report",
    icon: FilePlus,
    section: "insights",
    match: (path) => path.startsWith("/dashboard/reports/new"),
    keywords: ["write", "export"],
  },
  {
    href: "/dashboard/users",
    label: "Staff users",
    icon: UsersRound,
    section: "team",
    match: (path) => path.startsWith("/dashboard/users"),
    keywords: ["roles", "accounts"],
  },
];

/** Prefer longest href prefix match so nested routes resolve correctly */
export function getDashboardTitle(path: string): string {
  let best: DashboardNavItem | undefined;
  let bestLen = -1;
  for (const item of DASHBOARD_NAV_ITEMS) {
    if (!item.match(path)) continue;
    if (item.href.length > bestLen) {
      bestLen = item.href.length;
      best = item;
    }
  }
  return best?.label ?? "Dashboard overview";
}

export function dashboardJumpMatches(query: string): DashboardNavItem[] {
  const visible = DASHBOARD_NAV_ITEMS.filter((i) => i.showInNav !== false);
  const q = query.trim().toLowerCase();
  if (!q) return [...visible];
  const tokens = q.split(/\s+/).filter(Boolean);
  return visible.filter((item) => {
    const blobs = [
      item.label.toLowerCase(),
      item.href.toLowerCase(),
      ...(item.keywords ?? []).map((k) => k.toLowerCase()),
    ];
    return tokens.every((t) => blobs.some((b) => b.includes(t)));
  });
}

/** Related hubs for placeholder screens — speeds routine cross-navigation */
export const DASHBOARD_RELATED_HUBS: Record<string, string[]> = {
  "/dashboard/expenses": [
    "/dashboard/monthly",
    "/dashboard/reports/summary",
    "/dashboard/orders",
  ],
  "/dashboard/monthly": [
    "/dashboard/expenses",
    "/dashboard/reports",
    "/dashboard/reports/summary",
  ],
  "/dashboard/my-shop": [
    "/dashboard/products",
    "/dashboard/orders",
    "/dashboard/specials",
  ],
  "/dashboard/specials": [
    "/dashboard/products",
    "/dashboard/my-shop",
    "/dashboard/orders",
  ],
  "/dashboard/products": ["/dashboard/stock", "/dashboard/specials"],
  "/dashboard/reports/summary": [
    "/dashboard/reports",
    "/dashboard/reports/new",
    "/dashboard/monthly",
  ],
  "/dashboard/reports/new": [
    "/dashboard/reports",
    "/dashboard/reports/summary",
    "/dashboard/expenses",
  ],
};

export function getDashboardRelatedLinks(
  primaryHref: string,
): { href: string; label: string }[] {
  const hrefs = DASHBOARD_RELATED_HUBS[primaryHref] ?? [];
  return hrefs.map((href) => ({
    href,
    label: getDashboardTitle(href),
  }));
}
