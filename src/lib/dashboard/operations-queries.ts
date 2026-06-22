import "server-only";
import { prisma } from "@/lib/db";
import { DEMO_ORDERS } from "@/lib/dashboard/demo-data";

export type ExpenseRow = {
  id: string;
  title: string;
  vendor: string | null;
  amountCents: number;
  currency: string;
  category: string | null;
  paidAt: Date;
  note: string | null;
};

export type ReportRow = {
  id: string;
  title: string;
  periodStart: Date;
  periodEnd: Date;
  summary: string | null;
  status: "DRAFT" | "PUBLISHED";
  createdAt: Date;
};

export type MonthlyRollup = {
  key: string;
  label: string;
  expenseCents: number;
  orderRevenueCents: number;
  expenseCount: number;
  orderCount: number;
};

export async function listExpenses(limit = 200): Promise<ExpenseRow[]> {
  return prisma.expense.findMany({
    orderBy: { paidAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      vendor: true,
      amountCents: true,
      currency: true,
      category: true,
      paidAt: true,
      note: true,
    },
  });
}

export async function listReports(limit = 50): Promise<ReportRow[]> {
  return prisma.operationalReport.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      periodStart: true,
      periodEnd: true,
      summary: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getOperationsSummary() {
  const [expenseAgg, productAgg, reportCount, expenses] = await Promise.all([
    prisma.expense.aggregate({ _sum: { amountCents: true }, _count: true }),
    prisma.product.aggregate({
      _sum: { stock: true, priceCents: true },
      _count: true,
    }),
    prisma.operationalReport.count({ where: { status: "PUBLISHED" } }),
    prisma.expense.findMany({
        orderBy: { paidAt: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          amountCents: true,
          currency: true,
          paidAt: true,
        },
      }),
    ]);

  const orderRevenueCents = DEMO_ORDERS.filter(
    (o) => o.status === "FULFILLED" || o.status === "PROCESSING",
  ).reduce((s, o) => s + o.totalCents, 0);

  return {
    totalExpenseCents: expenseAgg._sum.amountCents ?? 0,
    expenseCount: expenseAgg._count,
    totalSkus: productAgg._count,
    totalStockUnits: productAgg._sum.stock ?? 0,
    publishedReports: reportCount,
    orderRevenueCents,
    pendingOrders: DEMO_ORDERS.filter((o) => o.status === "PENDING").length,
    recentExpenses: expenses,
  };
}

export async function getMonthlyRollups(months = 6): Promise<MonthlyRollup[]> {
  const expenses = await prisma.expense.findMany({
    select: { amountCents: true, paidAt: true },
  });

  const now = new Date();
  const buckets: MonthlyRollup[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-GB", {
      month: "short",
      year: "numeric",
    }).format(d);
    buckets.push({
      key,
      label,
      expenseCents: 0,
      orderRevenueCents: 0,
      expenseCount: 0,
      orderCount: 0,
    });
  }

  const bucketMap = new Map(buckets.map((b) => [b.key, b]));

  for (const e of expenses) {
    const d = e.paidAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    bucket.expenseCents += e.amountCents;
    bucket.expenseCount += 1;
  }

  for (const o of DEMO_ORDERS) {
    const d = new Date(o.placedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const bucket = bucketMap.get(key);
    if (!bucket) continue;
    if (o.status === "FULFILLED" || o.status === "PROCESSING") {
      bucket.orderRevenueCents += o.totalCents;
      bucket.orderCount += 1;
    }
  }

  return buckets;
}
