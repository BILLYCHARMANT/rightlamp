/**
 * Role-based access — safe for client and server imports (no Prisma).
 */

export const STAFF_ROLES = [
  "ADMIN",
  "MAIN_STORE_MANAGER",
  "BRANCH_MANAGER",
  "BRANCH_SELLER",
  "PARTNER_INVESTOR",
  "STAFF",
] as const;

export type StaffRoleCode = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<StaffRoleCode, string> = {
  ADMIN: "Administrator",
  MAIN_STORE_MANAGER: "Main store manager",
  BRANCH_MANAGER: "Branch manager",
  BRANCH_SELLER: "Branch seller",
  PARTNER_INVESTOR: "Partner / investor",
  STAFF: "Branch seller",
};

export const ROLE_DESCRIPTIONS: Record<StaffRoleCode, string> = {
  ADMIN: "Full system access — users, branches, stock, shops, and reports.",
  MAIN_STORE_MANAGER:
    "Central warehouse operations — stock, transfers, all branches, and orders.",
  BRANCH_MANAGER:
    "Runs one shop — branch orders, assigned inventory, and local sales.",
  BRANCH_SELLER: "Records sales and serves customers at an assigned branch.",
  PARTNER_INVESTOR:
    "Read-only performance view — shop analytics, revenue, and reports.",
  STAFF: "Legacy role — same access as branch seller.",
};

/** Roles shown when an admin creates a user (excludes deprecated STAFF). */
export const ASSIGNABLE_ROLES: StaffRoleCode[] = [
  "ADMIN",
  "MAIN_STORE_MANAGER",
  "BRANCH_MANAGER",
  "BRANCH_SELLER",
  "PARTNER_INVESTOR",
];

export type DashboardHomeVariant =
  | "admin"
  | "main_store"
  | "branch_manager"
  | "branch_seller"
  | "partner";

const ROUTE_ROLE_ACCESS: Record<string, StaffRoleCode[] | "all"> = {
  "/dashboard": "all",
  "/dashboard/my-shops": ["ADMIN", "MAIN_STORE_MANAGER", "PARTNER_INVESTOR", "BRANCH_MANAGER"],
  "/dashboard/orders": [
    "ADMIN",
    "MAIN_STORE_MANAGER",
    "BRANCH_MANAGER",
    "BRANCH_SELLER",
    "STAFF",
  ],
  "/dashboard/products": [
    "ADMIN",
    "MAIN_STORE_MANAGER",
    "BRANCH_MANAGER",
    "BRANCH_SELLER",
    "STAFF",
  ],
  "/dashboard/stock": ["ADMIN", "MAIN_STORE_MANAGER", "BRANCH_MANAGER"],
  "/dashboard/branches": ["ADMIN", "MAIN_STORE_MANAGER"],
  "/dashboard/reports": [
    "ADMIN",
    "MAIN_STORE_MANAGER",
    "PARTNER_INVESTOR",
    "BRANCH_MANAGER",
  ],
  "/dashboard/users": ["ADMIN"],
  "/dashboard/categories": ["ADMIN", "MAIN_STORE_MANAGER"],
  "/dashboard/create": ["ADMIN", "MAIN_STORE_MANAGER"],
};

export function normalizeStaffRole(raw: string | null | undefined): StaffRoleCode {
  if (!raw) return "BRANCH_SELLER";
  if (raw === "STAFF") return "BRANCH_SELLER";
  if ((STAFF_ROLES as readonly string[]).includes(raw)) {
    return raw as StaffRoleCode;
  }
  return "BRANCH_SELLER";
}

export function formatStaffRoleLabel(role: string | null | undefined): string {
  return ROLE_LABELS[normalizeStaffRole(role)];
}

export function roleRequiresBranchAssignment(role: StaffRoleCode): boolean {
  return (
    role === "BRANCH_MANAGER" ||
    role === "BRANCH_SELLER" ||
    role === "STAFF"
  );
}

export function hasGlobalOrderAccess(role: StaffRoleCode): boolean {
  return role === "ADMIN" || role === "MAIN_STORE_MANAGER";
}

export function hasGlobalShopAccess(role: StaffRoleCode): boolean {
  return (
    role === "ADMIN" ||
    role === "MAIN_STORE_MANAGER" ||
    role === "PARTNER_INVESTOR"
  );
}

export function canManageUsers(role: StaffRoleCode): boolean {
  return role === "ADMIN";
}

export function canWriteStock(role: StaffRoleCode): boolean {
  return role === "ADMIN" || role === "MAIN_STORE_MANAGER" || role === "BRANCH_MANAGER";
}

export function canWriteProducts(role: StaffRoleCode): boolean {
  return role === "ADMIN" || role === "MAIN_STORE_MANAGER";
}

export function getDashboardHomeVariant(role: StaffRoleCode): DashboardHomeVariant {
  switch (normalizeStaffRole(role)) {
    case "ADMIN":
      return "admin";
    case "MAIN_STORE_MANAGER":
      return "main_store";
    case "BRANCH_MANAGER":
      return "branch_manager";
    case "BRANCH_SELLER":
    case "STAFF":
      return "branch_seller";
    case "PARTNER_INVESTOR":
      return "partner";
    default:
      return "branch_seller";
  }
}

function matchRouteAccess(path: string): StaffRoleCode[] | "all" {
  const entries = Object.entries(ROUTE_ROLE_ACCESS).sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [prefix, allowed] of entries) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return allowed;
    }
  }
  return "all";
}

export function canAccessDashboardPath(
  role: string | null | undefined,
  path: string,
): boolean {
  const normalized = normalizeStaffRole(role);
  const allowed = matchRouteAccess(path);
  if (allowed === "all") return true;
  return allowed.includes(normalized);
}

export function canAccessNavHref(
  role: string | null | undefined,
  href: string,
): boolean {
  return canAccessDashboardPath(role, href);
}
