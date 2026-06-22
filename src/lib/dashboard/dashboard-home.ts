import "server-only";

import { DEFAULT_CURRENCY, LOW_STOCK_THRESHOLD, normalizeCurrency } from "@/lib/dashboard/constants";
import type { OrderRow } from "@/lib/dashboard/order-types";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import {
  getDashboardOverviewStats,
  type DashboardOverviewStats,
} from "@/lib/dashboard/overview-stats";
import { fetchAllOrders, fetchRecentOrders } from "@/lib/dashboard/orders-queries";
import { prisma } from "@/lib/db";

export type DashboardHomeMovement = {
  id: string;
  productName: string;
  delta: number;
  reason: string;
  createdAt: string;
};

export type DashboardHomeLowItem = {
  id: string;
  name: string;
  qty: number;
  status: "low" | "out";
};

export type DashboardHomePayload = {
  stats: DashboardOverviewStats;
  stock: {
    unitsOnHand: number;
    outOfStockSkus: number;
    inventoryCostDisplay: string;
    lowItems: DashboardHomeLowItem[];
    recentMovements: DashboardHomeMovement[];
  };
  orders: {
    pending: number;
    processing: number;
    fulfilledWeek: number;
    weekRevenueDisplay: string;
    recent: OrderRow[];
  };
  finance: {
    monthExpenseDisplay: string;
    monthExpenseCount: number;
  };
};

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function weekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

export async function getDashboardHomePayload(): Promise<DashboardHomePayload> {
  const [stats, products, movements, expenseAgg, allOrders, recentOrders] =
    await Promise.all([
    getDashboardOverviewStats(),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        published: true,
        priceCents: true,
        costPriceCents: true,
        currency: true,
      },
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { product: { select: { name: true } } },
    }),
    prisma.expense.aggregate({
      where: { paidAt: { gte: startOfMonth() } },
      _sum: { amountCents: true },
      _count: true,
    }),
    fetchAllOrders(),
    fetchRecentOrders(6),
  ]);

  let unitsOnHand = 0;
  let outOfStockSkus = 0;
  const costByCurrency = new Map<string, number>();

  for (const p of products) {
    unitsOnHand += p.stock;
    const unitCost = p.costPriceCents ?? p.priceCents;
    costByCurrency.set(
      p.currency,
      (costByCurrency.get(p.currency) ?? 0) + unitCost * p.stock,
    );
    if (p.published && p.stock === 0) outOfStockSkus += 1;
  }

  const inventoryCostDisplay =
    costByCurrency.size === 0
      ? "—"
      : [...costByCurrency.entries()]
          .map(([c, cents]) => formatMoneyFromCents(cents, c))
          .join(" · ");

  const lowItems: DashboardHomeLowItem[] = products
    .filter(
      (p) =>
        p.published &&
        (p.stock === 0 || (p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD)),
    )
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      qty: p.stock,
      status: p.stock === 0 ? "out" : "low",
    }));

  const recentMovements: DashboardHomeMovement[] = movements.map((m) => ({
    id: m.id,
    productName: m.product.name,
    delta: m.delta,
    reason: m.reason,
    createdAt: m.createdAt.toISOString(),
  }));

  const weekStart = weekAgo();
  const weekOrders = allOrders.filter(
    (o) => new Date(o.placedAt) >= weekStart,
  );
  const weekRevenueCents = weekOrders
    .filter((o) => o.status === "FULFILLED" || o.status === "PROCESSING")
    .reduce((s, o) => s + o.totalCents, 0);
  const currency = normalizeCurrency(allOrders[0]?.currency ?? DEFAULT_CURRENCY);

  const expenseCents = expenseAgg._sum.amountCents ?? 0;
  const expenseCurrency = DEFAULT_CURRENCY;

  return {
    stats,
    stock: {
      unitsOnHand,
      outOfStockSkus,
      inventoryCostDisplay,
      lowItems,
      recentMovements,
    },
    orders: {
      pending: allOrders.filter((o) => o.status === "PENDING").length,
      processing: allOrders.filter((o) => o.status === "PROCESSING").length,
      fulfilledWeek: weekOrders.filter((o) => o.status === "FULFILLED").length,
      weekRevenueDisplay: formatMoneyFromCents(weekRevenueCents, currency),
      recent: recentOrders,
    },
    finance: {
      monthExpenseDisplay: formatMoneyFromCents(expenseCents, expenseCurrency),
      monthExpenseCount: expenseAgg._count,
    },
  };
}
