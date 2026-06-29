import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  LayoutDashboard,
  MapPin,
  Package,
  ShoppingBag,
  Store,
  UsersRound,
  Warehouse,
} from "lucide-react";
import { canAccessNavHref, type StaffRoleCode } from "@/lib/dashboard/rbac";
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
  /** If set, only these roles see the item. When omitted, all dashboard roles may see it. */
  roles?: StaffRoleCode[];
};

/** Mirrors PV-GRID admin IA — order matters for `find` title fallback */
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
    href: "/dashboard/my-shops",
    label: "My Shops",
    icon: Store,
    section: "sales",
    match: (path) => path.startsWith("/dashboard/my-shops"),
    keywords: ["shops", "branches", "multi-branch", "inventory", "profit"],
    roles: ["ADMIN", "MAIN_STORE_MANAGER", "PARTNER_INVESTOR", "BRANCH_MANAGER"],
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
    keywords: ["product", "inventory list", "create", "add product", "quick create"],
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
    href: "/dashboard/branches",
    label: "Branches",
    icon: MapPin,
    section: "catalog",
    match: (path) => path.startsWith("/dashboard/branches"),
    keywords: ["locations", "shops", "transfer", "warehouse sites"],
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: BarChart3,
    section: "insights",
    match: (path) => path.startsWith("/dashboard/reports"),
    keywords: [
      "analytics",
      "charts",
      "summary",
      "create report",
      "rollup",
      "expenses",
      "bills",
      "spend",
      "monthly",
      "calendar",
    ],
  },
  {
    href: "/dashboard/users",
    label: "Staff users",
    icon: UsersRound,
    section: "team",
    match: (path) => path.startsWith("/dashboard/users"),
    keywords: ["roles", "accounts"],
    roles: ["ADMIN"],
  },
];

/** Prefer longest href prefix match so nested routes resolve correctly */
export function getDashboardTitle(path: string): string {
  if (path.startsWith("/dashboard/reports")) return "Reports";
  if (path.match(/^\/dashboard\/products\/[^/]+$/)) return "Product details";
  if (path.startsWith("/dashboard/my-shops/")) return "Shop details";
  if (path.startsWith("/dashboard/my-shops")) return "My Shops";

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

export function getVisibleNavItems(role?: string | null): DashboardNavItem[] {
  return DASHBOARD_NAV_ITEMS.filter(
    (item) => item.showInNav !== false && canAccessNavHref(role, item.href),
  );
}

export function dashboardJumpMatches(query: string, role?: string | null): DashboardNavItem[] {
  const visible = getVisibleNavItems(role);
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
  "/dashboard/products": ["/dashboard/stock", "/dashboard/branches"],
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
