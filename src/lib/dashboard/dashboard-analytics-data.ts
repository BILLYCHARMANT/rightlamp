import "server-only";

import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import type { FinancialHomePayload } from "@/lib/dashboard/financial-overview";
import { getFinancialHomePayload } from "@/lib/dashboard/financial-overview";
import { prisma } from "@/lib/db";

export type AnalyticsSlice = {
  label: string;
  value: number;
  color: string;
};

export type AnalyticsProgressRow = {
  label: string;
  value: number;
  max: number;
};

export type AnalyticsRankedRow = {
  label: string;
  value: number;
  href?: string;
};

export type DashboardAnalyticsPayload = FinancialHomePayload & {
  stock: {
    unitsOnHand: number;
    skuCount: number;
    publishedSkus: number;
    lowStock: number;
    outOfStock: number;
    inventoryDisplay: string;
  };
  team: {
    activeStaff: number;
    activeBranches: number;
  };
  orderStatus: AnalyticsProgressRow[];
  orderChannels: AnalyticsSlice[];
  expenseCategories: AnalyticsSlice[];
  rankedProducts: AnalyticsRankedRow[];
};

const SLICE_COLORS = [
  "#f97316",
  "#6366f1",
  "#ef4444",
  "#0ea5e9",
  "#22d3ee",
  "#f43f5e",
];

function groupSum<T>(
  rows: T[],
  keyFn: (row: T) => string,
  valueFn: (row: T) => number,
): AnalyticsSlice[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = keyFn(row) || "Other";
    map.set(key, (map.get(key) ?? 0) + valueFn(row));
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      color: SLICE_COLORS[index % SLICE_COLORS.length],
    }));
}

export async function getDashboardAnalyticsPayload(): Promise<DashboardAnalyticsPayload> {
  const [base, products, activeStaff, activeBranches, expenseRows] = await Promise.all([
    getFinancialHomePayload(),
    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stock: true,
        published: true,
        priceCents: true,
        costPriceCents: true,
        currency: true,
      },
    }),
    prisma.user.count({ where: { active: true } }),
    prisma.branch.count({ where: { active: true } }),
    prisma.expense.findMany({
      select: { category: true, amountCents: true },
    }),
  ]);

  let unitsOnHand = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let publishedSkus = 0;
  const costByCurrency = new Map<string, number>();

  for (const product of products) {
    unitsOnHand += product.stock;
    if (product.published) {
      publishedSkus += 1;
      if (product.stock === 0) outOfStock += 1;
      else if (product.stock <= LOW_STOCK_THRESHOLD) lowStock += 1;
    }
    const unitCost = product.costPriceCents ?? product.priceCents;
    costByCurrency.set(
      product.currency,
      (costByCurrency.get(product.currency) ?? 0) + unitCost * product.stock,
    );
  }

  const inventoryDisplay =
    costByCurrency.size === 0
      ? "—"
      : [...costByCurrency.entries()]
          .map(([currency, cents]) => formatMoneyFromCents(cents, currency))
          .join(" · ");

  const statusCounts = {
    Pending: base.orders.filter((o) => o.status === "PENDING").length,
    Processing: base.orders.filter((o) => o.status === "PROCESSING").length,
    Fulfilled: base.orders.filter((o) => o.status === "FULFILLED").length,
    Cancelled: base.orders.filter((o) => o.status === "CANCELLED").length,
  };
  const statusMax = Math.max(...Object.values(statusCounts), 1);

  const orderStatus: AnalyticsProgressRow[] = Object.entries(statusCounts).map(
    ([label, value]) => ({
      label,
      value,
      max: statusMax,
    }),
  );

  const orderChannels = groupSum(
    base.orders.filter((o) => o.status !== "CANCELLED"),
    (o) => o.channel,
    () => 1,
  );

  const expenseCategories = groupSum(
    expenseRows,
    (e) => e.category ?? "Other",
    (e) => e.amountCents,
  );

  const rankedProducts: AnalyticsRankedRow[] = base.topProducts.slice(0, 8).map((p) => ({
    label: p.name,
    value: p.revenueRwf,
    href: `/shop/${p.slug}`,
  }));

  return {
    ...base,
    stock: {
      unitsOnHand,
      skuCount: products.length,
      publishedSkus,
      lowStock,
      outOfStock,
      inventoryDisplay,
    },
    team: {
      activeStaff,
      activeBranches,
    },
    orderStatus,
    orderChannels,
    expenseCategories,
    rankedProducts,
  };
}
