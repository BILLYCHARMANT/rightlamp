import "server-only";

import type { OrderViewerScope } from "@/lib/dashboard/rbac-server";
import { hasGlobalOrderAccess } from "@/lib/dashboard/rbac";
import { prisma } from "@/lib/db";
import type { OrderPickupBranch } from "@/lib/dashboard/order-types";

export type StaffOrderFormContext = {
  branches: OrderPickupBranch[];
  defaultBranchId: string | null;
  /** Admins may choose any active branch; staff are locked to their assignment. */
  canEditBranch: boolean;
};

/** Active branches with a defined location — shown as selectable pickup points only. */
export async function getActiveOrderBranches(): Promise<OrderPickupBranch[]> {
  const rows = await prisma.branch.findMany({
    where: { active: true },
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      location: true,
      phone: true,
    },
  });

  return rows
    .filter((row) => Boolean(row.location?.trim()))
    .map((row) => ({
      id: row.id,
      name: row.name,
      location: row.location!.trim(),
      phone: row.phone,
    }));
}

export async function validateActiveBranchId(
  branchId: string | undefined | null,
): Promise<{ ok: true; branchId: string } | { ok: false; message: string }> {
  const id = branchId?.trim();
  if (!id) {
    return { ok: false, message: "Select a location from the list." };
  }

  const branch = await prisma.branch.findFirst({
    where: { id, active: true },
    select: { id: true },
  });

  if (!branch) {
    return { ok: false, message: "Selected location is no longer available." };
  }

  return { ok: true, branchId: branch.id };
}

/** Branch picker context for the dashboard “New sales order” form. */
export async function getStaffOrderFormContext(
  scope: OrderViewerScope | null,
): Promise<StaffOrderFormContext> {
  const allBranches = await getActiveOrderBranches();

  if (!scope || hasGlobalOrderAccess(scope.role)) {
    return {
      branches: allBranches,
      defaultBranchId: allBranches[0]?.id ?? null,
      canEditBranch: hasGlobalOrderAccess(scope?.role ?? "BRANCH_SELLER"),
    };
  }

  const assignedIds = scope.branchIds ?? [];
  if (assignedIds.length === 0) {
    return { branches: [], defaultBranchId: null, canEditBranch: false };
  }

  const assignedRows = await prisma.branch.findMany({
    where: { id: { in: assignedIds }, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true, phone: true },
  });

  const assigned = assignedRows.map((row) => ({
    id: row.id,
    name: row.name,
    location: row.location?.trim() ?? null,
    phone: row.phone,
  }));

  return {
    branches: assigned.filter((branch) => Boolean(branch.location)),
    defaultBranchId: assigned.find((branch) => branch.location)?.id ?? null,
    canEditBranch: false,
  };
}
