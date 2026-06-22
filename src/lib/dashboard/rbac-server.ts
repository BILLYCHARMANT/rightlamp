import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  canAccessDashboardPath,
  canManageUsers,
  hasGlobalOrderAccess,
  hasGlobalShopAccess,
  normalizeStaffRole,
  type StaffRoleCode,
} from "@/lib/dashboard/rbac";
import { prisma } from "@/lib/db";

export type DashboardSession = {
  id: string;
  email: string;
  name: string;
  role: StaffRoleCode;
};

export async function getDashboardSession(): Promise<DashboardSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
    role: normalizeStaffRole(session.user.role),
  };
}

export async function requireDashboardSession(): Promise<DashboardSession> {
  const dash = await getDashboardSession();
  if (!dash) redirect("/login");
  return dash;
}

export async function requireAdminSession() {
  const dash = await requireDashboardSession();
  if (!canManageUsers(dash.role)) {
    redirect("/dashboard");
  }
  return dash;
}

export async function requireDashboardPath(path: string): Promise<DashboardSession> {
  const dash = await requireDashboardSession();
  if (!canAccessDashboardPath(dash.role, path)) {
    redirect("/dashboard");
  }
  return dash;
}

export async function getStaffBranchIds(userId: string): Promise<string[]> {
  const rows = await prisma.branchStaffAssignment.findMany({
    where: { userId },
    select: { branchId: true },
  });
  return rows.map((row) => row.branchId);
}

export type OrderViewerScope = {
  role: StaffRoleCode;
  branchIds: string[] | null;
};

export async function getOrderViewerScope(): Promise<OrderViewerScope | null> {
  const dash = await getDashboardSession();
  if (!dash) return null;

  if (hasGlobalOrderAccess(dash.role)) {
    return { role: dash.role, branchIds: null };
  }

  const branchIds = await getStaffBranchIds(dash.id);
  return { role: dash.role, branchIds };
}

export function canAccessOrderBranch(
  orderBranchId: string | null,
  scope: OrderViewerScope,
): boolean {
  if (scope.branchIds === null) return true;
  if (!orderBranchId) return false;
  return scope.branchIds.includes(orderBranchId);
}

export async function getShopViewerScope(): Promise<{
  role: StaffRoleCode;
  branchIds: string[] | null;
} | null> {
  const dash = await getDashboardSession();
  if (!dash) return null;

  if (hasGlobalShopAccess(dash.role)) {
    return { role: dash.role, branchIds: null };
  }

  if (dash.role === "BRANCH_MANAGER") {
    const branchIds = await getStaffBranchIds(dash.id);
    return { role: dash.role, branchIds };
  }

  return null;
}
