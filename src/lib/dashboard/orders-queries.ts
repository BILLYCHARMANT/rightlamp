import "server-only";

import { formatOrderId, mapOrderToRow } from "@/lib/dashboard/order-mapper";
import type { DemoOrder, DemoOrderStatus } from "@/lib/dashboard/demo-data";
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

type FetchOrdersOptions = {
  placedAtGte?: Date;
};

function orderWhere(
  scope: OrderViewerScope | null | undefined,
  options?: FetchOrdersOptions,
) {
  const where = branchWhere(scope);
  if (!options?.placedAtGte) return where;
  return {
    ...where,
    placedAt: { gte: options.placedAtGte },
  };
}

export async function fetchAllOrders(
  scope?: OrderViewerScope | null,
  options?: FetchOrdersOptions,
): Promise<OrderRow[]> {
  try {
    const rows = await prisma.order.findMany({
      where: orderWhere(scope, options),
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

/** Lightweight order rows for charts and KPIs (no line items). */
export async function fetchOrdersForAnalytics(
  scope?: OrderViewerScope | null,
): Promise<DemoOrder[]> {
  try {
    const rows = await prisma.order.findMany({
      where: branchWhere(scope),
      orderBy: { placedAt: "desc" },
      select: {
        orderNumber: true,
        customerName: true,
        channel: true,
        totalCents: true,
        currency: true,
        status: true,
        placedAt: true,
      },
    });
    return rows.map((order) => ({
      id: formatOrderId(order.orderNumber),
      customer: order.customerName,
      channel: order.channel,
      lineSummary: "",
      totalCents: order.totalCents,
      currency: order.currency,
      status: order.status as DemoOrderStatus,
      placedAt: order.placedAt.toISOString(),
    }));
  } catch (e) {
    if (isPrismaConnectionError(e)) return [];
    throw e;
  }
}
