import "server-only";

import { DEMO_DEBTS, DEMO_TOP_SKUS, type DemoOrder } from "@/lib/dashboard/demo-data";
import { fetchOrdersForAnalytics } from "@/lib/dashboard/orders-queries";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import type { ExpensePoint } from "@/lib/dashboard/financial-period";
import { getProductImageUrl } from "@/lib/dashboard/product-images";
import { prisma } from "@/lib/db";

export type DashboardNotification = {
  id: string;
  tone: "brand" | "warn" | "danger" | "accent";
  title: string;
  detail: string;
  href?: string;
  at: string;
};

export type DashboardTopProduct = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  priceCents: number;
  currency: string;
  qtySold: number;
  revenueRwf: number;
  trendPercent: number;
  trendUp: boolean;
  rank: number;
};

export type FinancialHomePayload = {
  orders: DemoOrder[];
  expenses: ExpensePoint[];
  debts: typeof DEMO_DEBTS;
  notifications: DashboardNotification[];
  topProducts: DashboardTopProduct[];
};

function normalizeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

function matchDemoSku(productName: string) {
  const normalized = normalizeName(productName);
  return DEMO_TOP_SKUS.find((demo) => {
    const demoNorm = normalizeName(demo.name);
    const tokens = demoNorm.split(" ").filter((t) => t.length > 2);
    return tokens.some((token) => normalized.includes(token));
  });
}

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function buildTopProducts(): Promise<DashboardTopProduct[]> {
  const rows = await prisma.product.findMany({
    orderBy: [{ published: "desc" }, { stock: "desc" }, { updatedAt: "desc" }],
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      priceCents: true,
      currency: true,
      stock: true,
    },
  });

  const products: DashboardTopProduct[] = rows.map((p, index) => {
    const demo = matchDemoSku(p.name);
    const qtySold = demo?.qty ?? Math.max(p.stock, 1);
    const revenueRwf =
      demo?.revenueRwf ?? Math.round((p.priceCents / 100) * qtySold);
    const trendPercent = demo ? Number((demo.rank * 2.1).toFixed(1)) : 4.8;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      imageUrl: getProductImageUrl(p.slug, p.category),
      priceCents: p.priceCents,
      currency: p.currency,
      qtySold,
      revenueRwf,
      trendPercent,
      trendUp: index % 3 !== 2,
      rank: index + 1,
    };
  });

  const usedNames = new Set(products.map((p) => normalizeName(p.name)));

  for (const demo of DEMO_TOP_SKUS) {
    if (products.length >= 6) break;
    const demoNorm = normalizeName(demo.name);
    const already = [...usedNames].some(
      (name) => name.includes(demoNorm.slice(0, 8)) || demoNorm.includes(name.slice(0, 8)),
    );
    if (already) continue;

    const slug = slugFromName(demo.name);
    products.push({
      id: `demo-sku-${demo.rank}`,
      name: demo.name,
      slug,
      imageUrl: getProductImageUrl(slug),
      priceCents: Math.round(demo.revenueRwf / Math.max(demo.qty, 1)) * 100,
      currency: "RWF",
      qtySold: demo.qty,
      revenueRwf: demo.revenueRwf,
      trendPercent: Number((demo.rank * 2.1).toFixed(1)),
      trendUp: demo.rank % 2 === 1,
      rank: products.length + 1,
    });
    usedNames.add(demoNorm);
  }

  return products
    .sort((a, b) => b.qtySold - a.qtySold)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export async function getFinancialHomePayload(): Promise<FinancialHomePayload> {
  const [expenseRows, lowStock, openOrders, orders, topProducts] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { paidAt: "desc" },
      select: { amountCents: true, paidAt: true, currency: true, title: true },
    }),
    prisma.product.count({
      where: {
        published: true,
        stock: { gt: 0, lte: LOW_STOCK_THRESHOLD },
      },
    }),
    prisma.order.count({
      where: { status: { in: ["PENDING", "PROCESSING"] } },
    }),
    fetchOrdersForAnalytics(),
    buildTopProducts(),
  ]);

  const expenses: ExpensePoint[] = expenseRows.map((e) => ({
    amountCents: e.amountCents,
    paidAt: e.paidAt.toISOString(),
    currency: e.currency,
  }));

  const notifications: DashboardNotification[] = [];
  const now = new Date().toISOString();

  if (openOrders > 0) {
    notifications.push({
      id: "n-orders",
      tone: "accent",
      title: `${openOrders} open orders`,
      detail: "Pending or processing sales need attention.",
      href: "/dashboard/orders",
      at: now,
    });
  }

  if (lowStock > 0) {
    notifications.push({
      id: "n-stock",
      tone: "warn",
      title: `${lowStock} products low on stock`,
      detail: "Published items at or below reorder level.",
      href: "/dashboard/stock",
      at: now,
    });
  }

  const overdue = DEMO_DEBTS.filter(
    (d) =>
      d.status === "outstanding" && new Date(d.dueAt) < new Date(),
  );
  if (overdue.length > 0) {
    notifications.push({
      id: "n-debts",
      tone: "danger",
      title: `${overdue.length} overdue debt${overdue.length > 1 ? "s" : ""}`,
      detail: overdue.map((d) => d.party).join(", "),
      at: now,
    });
  }

  const recentExpense = expenseRows[0];
  if (recentExpense) {
    notifications.push({
      id: "n-expense",
      tone: "brand",
      title: "Recent expense recorded",
      detail: recentExpense.title,
      href: "/dashboard/reports/expenses",
      at: recentExpense.paidAt.toISOString(),
    });
  }

  return {
    orders,
    expenses,
    debts: DEMO_DEBTS,
    notifications,
    topProducts,
  };
}
