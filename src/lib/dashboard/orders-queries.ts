import "server-only";

import { mapOrderToRow } from "@/lib/dashboard/order-mapper";
import type { OrderViewerScope } from "@/lib/dashboard/order-access";
import type { OrderRow } from "@/lib/dashboard/order-types";
import { prisma } from "@/lib/db";
import { isPrismaConnectionError } from "@/lib/dashboard/prisma-connection";

const orderInclude = {
  branch: {
    select: { id: true, name: true, location: true },
  },
  items: {
    orderBy: { id: "asc" as const },
    include: {
      accessories: { orderBy: { id: "asc" as const } },
    },
  },
};

function branchWhere(scope: OrderViewerScope | null | undefined) {
  if (!scope || scope.branchIds === null) return {};
  if (scope.branchIds.length === 0) {
    return { branchId: { in: [] as string[] } };
  }
  return { branchId: { in: scope.branchIds } };
}

export async function fetchAllOrders(
  scope?: OrderViewerScope | null,
): Promise<OrderRow[]> {
  try {
    const rows = await prisma.order.findMany({
      where: branchWhere(scope),
      orderBy: { placedAt: "desc" },
      include: orderInclude,
    });
    return rows.map(mapOrderToRow);
  } catch (e) {
    if (isPrismaConnectionError(e)) return [];
    throw e;
  }
}

export async function fetchRecentOrders(
  limit: number,
  scope?: OrderViewerScope | null,
): Promise<OrderRow[]> {
  try {
    const rows = await prisma.order.findMany({
      where: branchWhere(scope),
      orderBy: { placedAt: "desc" },
      take: limit,
      include: orderInclude,
    });
    return rows.map(mapOrderToRow);
  } catch (e) {
    if (isPrismaConnectionError(e)) return [];
    throw e;
  }
}
