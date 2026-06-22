import "server-only";

import type { BranchActivityAction, OrderStatus } from "@/generated/prisma/client";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatActivityAction } from "@/lib/dashboard/shop-activity";
import { prisma } from "@/lib/db";

export type ShopStaffSummary = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export type ShopSummary = {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  phone: string | null;
  active: boolean;
  isMain: boolean;
  createdAt: string;
  assignedInventoryCostCents: number;
  totalSalesCents: number;
  totalProfitCents: number;
  productsAssigned: number;
  productsSold: number;
  remainingStock: number;
  managers: ShopStaffSummary[];
  currency: string;
};

export type ShopInventoryRow = {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  quantitySold: number;
  remaining: number;
  unitCostCents: number;
  inventoryCostCents: number;
  currency: string;
};

export type ShopTopProduct = {
  productName: string;
  quantitySold: number;
  revenueCents: number;
  profitCents: number;
};

export type ShopTrendPoint = {
  label: string;
  salesCents: number;
  profitCents: number;
};

export type ShopActivityRow = {
  id: string;
  action: BranchActivityAction;
  actionLabel: string;
  description: string;
  userEmail: string | null;
  userName: string | null;
  createdAt: string;
};

export type ShopDetail = ShopSummary & {
  inventory: ShopInventoryRow[];
  topProducts: ShopTopProduct[];
  salesTrend: ShopTrendPoint[];
  profitTrend: ShopTrendPoint[];
  inventoryDistribution: { label: string; valueCents: number }[];
  staff: ShopStaffSummary[];
};

export type ShopsOverviewResult = {
  shops: ShopSummary[];
  total: number;
  page: number;
  pageSize: number;
  totals: {
    assignedInventoryCostCents: number;
    totalSalesCents: number;
    totalProfitCents: number;
    productsAssigned: number;
    productsSold: number;
    remainingStock: number;
  };
};

export type ShopsQueryParams = {
  query?: string;
  status?: "all" | "active" | "inactive";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

const FULFILLED_STATUSES: OrderStatus[] = ["FULFILLED", "PROCESSING"];

function parseDateRange(dateFrom?: string, dateTo?: string) {
  const start = dateFrom ? new Date(dateFrom) : null;
  const end = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;
  if (start && Number.isNaN(start.getTime())) return { start: null, end: null };
  if (end && Number.isNaN(end.getTime())) return { start, end: null };
  return { start, end };
}

function unitCostCents(costPriceCents: number | null, priceCents: number) {
  return costPriceCents ?? priceCents;
}

async function computeBranchMetrics(
  branchId: string,
  range: { start: Date | null; end: Date | null },
) {
  const [inventoryRows, orders] = await Promise.all([
    prisma.branchInventory.findMany({
      where: { branchId },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            costPriceCents: true,
            priceCents: true,
            currency: true,
          },
        },
      },
    }),
    prisma.order.findMany({
      where: {
        branchId,
        status: { not: "CANCELLED" },
        ...(range.start || range.end
          ? {
              placedAt: {
                ...(range.start ? { gte: range.start } : {}),
                ...(range.end ? { lte: range.end } : {}),
              },
            }
          : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: { costPriceCents: true, priceCents: true },
            },
          },
        },
      },
    }),
  ]);

  let assignedInventoryCostCents = 0;
  let productsAssigned = 0;
  let inventorySoldFromLedger = 0;
  let remainingStock = 0;

  const inventory: ShopInventoryRow[] = inventoryRows.map((row) => {
    const cost = unitCostCents(row.product.costPriceCents, row.product.priceCents);
    const remaining = Math.max(0, row.quantity - row.quantitySold);
    assignedInventoryCostCents += row.quantity * cost;
    productsAssigned += row.quantity;
    inventorySoldFromLedger += row.quantitySold;
    remainingStock += remaining;
    return {
      productId: row.productId,
      productName: row.product.name,
      sku: row.product.slug,
      quantity: row.quantity,
      quantitySold: row.quantitySold,
      remaining,
      unitCostCents: cost,
      inventoryCostCents: row.quantity * cost,
      currency: row.product.currency,
    };
  });

  let totalSalesCents = 0;
  let totalCogsCents = 0;
  let productsSold = 0;
  const productSales = new Map<string, ShopTopProduct>();

  for (const order of orders) {
    if (!FULFILLED_STATUSES.includes(order.status) && order.status !== "PENDING") {
      // count revenue for processing/fulfilled; skip cancelled only
    }
    for (const item of order.items) {
      const lineRevenue = item.unitPriceCents * item.quantity;
      const cost = item.product
        ? unitCostCents(item.product.costPriceCents, item.product.priceCents)
        : item.unitPriceCents;
      const lineCogs = cost * item.quantity;
      totalSalesCents += lineRevenue;
      totalCogsCents += lineCogs;
      productsSold += item.quantity;

      const existing = productSales.get(item.productName) ?? {
        productName: item.productName,
        quantitySold: 0,
        revenueCents: 0,
        profitCents: 0,
      };
      existing.quantitySold += item.quantity;
      existing.revenueCents += lineRevenue;
      existing.profitCents += lineRevenue - lineCogs;
      productSales.set(item.productName, existing);
    }
  }

  if (productsSold === 0 && inventorySoldFromLedger > 0) {
    productsSold = inventorySoldFromLedger;
  }

  const totalProfitCents = totalSalesCents - totalCogsCents;

  return {
    assignedInventoryCostCents,
    totalSalesCents,
    totalProfitCents,
    productsAssigned,
    productsSold,
    remainingStock,
    inventory,
    topProducts: [...productSales.values()]
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 8),
    currency: inventoryRows[0]?.product.currency ?? DEFAULT_CURRENCY,
  };
}

function buildTrendFromOrders(
  orders: {
    placedAt: Date;
    items: {
      quantity: number;
      unitPriceCents: number;
      product: { costPriceCents: number | null; priceCents: number } | null;
    }[];
  }[],
): ShopTrendPoint[] {
  const buckets = new Map<string, ShopTrendPoint>();
  for (const order of orders) {
    const label = new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "2-digit",
    }).format(order.placedAt);
    const bucket = buckets.get(label) ?? { label, salesCents: 0, profitCents: 0 };
    for (const item of order.items) {
      const revenue = item.unitPriceCents * item.quantity;
      const cost = item.product
        ? unitCostCents(item.product.costPriceCents, item.product.priceCents)
        : item.unitPriceCents;
      bucket.salesCents += revenue;
      bucket.profitCents += revenue - cost * item.quantity;
    }
    buckets.set(label, bucket);
  }
  return [...buckets.values()].slice(-12);
}

export async function getShopsOverview(params: ShopsQueryParams): Promise<ShopsOverviewResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(50, Math.max(6, params.pageSize ?? 12));
  const range = parseDateRange(params.dateFrom, params.dateTo);
  const q = params.query?.trim().toLowerCase() ?? "";
  const status = params.status ?? "all";

  const where = {
    ...(status === "active" ? { active: true } : status === "inactive" ? { active: false } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { code: { contains: q, mode: "insensitive" as const } },
            { location: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(range.start || range.end
      ? {
          createdAt: {
            ...(range.start ? { gte: range.start } : {}),
            ...(range.end ? { lte: range.end } : {}),
          },
        }
      : {}),
  };

  const [total, branches] = await Promise.all([
    prisma.branch.count({ where }),
    prisma.branch.findMany({
      where,
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        staffAssignments: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    }),
  ]);

  const shops: ShopSummary[] = [];
  const totals = {
    assignedInventoryCostCents: 0,
    totalSalesCents: 0,
    totalProfitCents: 0,
    productsAssigned: 0,
    productsSold: 0,
    remainingStock: 0,
  };

  for (const branch of branches) {
    const metrics = await computeBranchMetrics(branch.id, range);
    const managers = branch.staffAssignments
      .map(({ user }) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }))
      .sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));

    shops.push({
      id: branch.id,
      name: branch.name,
      code: branch.code,
      location: branch.location,
      phone: branch.phone,
      active: branch.active,
      isMain: branch.isMain,
      createdAt: branch.createdAt.toISOString(),
      assignedInventoryCostCents: metrics.assignedInventoryCostCents,
      totalSalesCents: metrics.totalSalesCents,
      totalProfitCents: metrics.totalProfitCents,
      productsAssigned: metrics.productsAssigned,
      productsSold: metrics.productsSold,
      remainingStock: metrics.remainingStock,
      managers,
      currency: metrics.currency,
    });

    totals.assignedInventoryCostCents += metrics.assignedInventoryCostCents;
    totals.totalSalesCents += metrics.totalSalesCents;
    totals.totalProfitCents += metrics.totalProfitCents;
    totals.productsAssigned += metrics.productsAssigned;
    totals.productsSold += metrics.productsSold;
    totals.remainingStock += metrics.remainingStock;
  }

  return { shops, total, page, pageSize, totals };
}

export async function getShopDetail(
  branchId: string,
  params: Pick<ShopsQueryParams, "dateFrom" | "dateTo"> = {},
): Promise<ShopDetail | null> {
  const range = parseDateRange(params.dateFrom, params.dateTo);

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      staffAssignments: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
    },
  });

  if (!branch) return null;

  const metrics = await computeBranchMetrics(branchId, range);

  const orders = await prisma.order.findMany({
    where: {
      branchId,
      status: { not: "CANCELLED" },
      ...(range.start || range.end
        ? {
            placedAt: {
              ...(range.start ? { gte: range.start } : {}),
              ...(range.end ? { lte: range.end } : {}),
            },
          }
        : {}),
    },
    include: {
      items: {
        include: {
          product: { select: { costPriceCents: true, priceCents: true } },
        },
      },
    },
    orderBy: { placedAt: "asc" },
  });

  const trend = buildTrendFromOrders(orders);
  const inventoryDistribution = metrics.inventory
    .slice()
    .sort((a, b) => b.inventoryCostCents - a.inventoryCostCents)
    .slice(0, 6)
    .map((row) => ({ label: row.productName, valueCents: row.inventoryCostCents }));

  const staff = branch.staffAssignments
    .map(({ user }) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }))
    .sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email));

  return {
    id: branch.id,
    name: branch.name,
    code: branch.code,
    location: branch.location,
    phone: branch.phone,
    active: branch.active,
    isMain: branch.isMain,
    createdAt: branch.createdAt.toISOString(),
    assignedInventoryCostCents: metrics.assignedInventoryCostCents,
    totalSalesCents: metrics.totalSalesCents,
    totalProfitCents: metrics.totalProfitCents,
    productsAssigned: metrics.productsAssigned,
    productsSold: metrics.productsSold,
    remainingStock: metrics.remainingStock,
    managers: staff,
    currency: metrics.currency,
    inventory: metrics.inventory,
    topProducts: metrics.topProducts,
    salesTrend: trend,
    profitTrend: trend,
    inventoryDistribution,
    staff,
  };
}

export async function getShopActivityLog(params: {
  branchId: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: ShopActivityRow[]; total: number; page: number; pageSize: number }> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(10, params.pageSize ?? 20));

  const where = { branchId: params.branchId };

  const [total, rows] = await Promise.all([
    prisma.branchActivityLog.count({ where }),
    prisma.branchActivityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    rows: rows.map((row) => ({
      id: row.id,
      action: row.action,
      actionLabel: formatActivityAction(row.action),
      description: row.description,
      userEmail: row.userEmail,
      userName: row.userName,
      createdAt: row.createdAt.toISOString(),
    })),
  };
}

export async function getShopExportRows(branchId: string, dateFrom?: string, dateTo?: string) {
  const detail = await getShopDetail(branchId, { dateFrom, dateTo });
  if (!detail) return null;
  const activity = await getShopActivityLog({ branchId, page: 1, pageSize: 500 });
  return { detail, activity: activity.rows };
}
