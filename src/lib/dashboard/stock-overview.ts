import "server-only";

import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import type {
  MovementFlowPoint,
  StockLowRow,
  StockMovementReasonCode,
  StockMovementRow,
  StockOverviewStats,
  StockProductDetail,
} from "@/lib/dashboard/stock-shared-types";
import { movementsToWeeklyFlow } from "@/lib/inventory/stock-movements";
import { prisma } from "@/lib/db";

export async function getStockManagementPayload(): Promise<{
  products: StockProductDetail[];
  stats: StockOverviewStats;
  inventoryValueDisplay: string;
  lowOrOutList: StockLowRow[];
  suppliersCount: number;
  movements: StockMovementRow[];
  weeklyFlowLive: MovementFlowPoint[] | null;
}> {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      stock: true,
      published: true,
      priceCents: true,
      currency: true,
    },
  });

  let unitsOnHand = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const valueByCurrency = new Map<string, number>();

  for (const p of products) {
    unitsOnHand += p.stock;
    const lineValue = p.priceCents * p.stock;
    valueByCurrency.set(
      p.currency,
      (valueByCurrency.get(p.currency) ?? 0) + lineValue,
    );
    if (p.published) {
      if (p.stock === 0) outOfStockCount += 1;
      else if (p.stock <= LOW_STOCK_THRESHOLD) lowStockCount += 1;
    }
  }

  const inventoryValueDisplay =
    valueByCurrency.size === 0
      ? "—"
      : [...valueByCurrency.entries()]
          .map(([currency, cents]) => formatMoneyFromCents(cents, currency))
          .join(" · ");

  const lowOrOutList: StockLowRow[] = products
    .filter(
      (p) =>
        p.published &&
        (p.stock === 0 || p.stock <= LOW_STOCK_THRESHOLD),
    )
    .sort((a, b) => a.stock - b.stock)
    .map((p) => ({
      id: p.id,
      name: p.name,
      qty: p.stock,
      status: p.stock === 0 ? "out" : "low",
    }));

  const ledgerSince = new Date();
  ledgerSince.setDate(ledgerSince.getDate() - 112);

  const movementRows = await prisma.stockMovement.findMany({
    where: { createdAt: { gte: ledgerSince } },
    orderBy: { createdAt: "desc" },
    take: 4000,
    include: { product: { select: { name: true } } },
  });

  const weeklyBuckets = movementsToWeeklyFlow(
    movementRows.map((m) => ({
      createdAt: m.createdAt,
      delta: m.delta,
    })),
    8,
  );

  const flowHasSignal = weeklyBuckets.some((b) => b.in > 0 || b.out > 0);

  const movements: StockMovementRow[] = movementRows.map((m) => ({
    id: m.id,
    productId: m.productId,
    productName: m.product.name,
    delta: m.delta,
    reason: m.reason as StockMovementReasonCode,
    note: m.note,
    receiptStatus: m.receiptStatus,
    createdAt: m.createdAt.toISOString(),
    createdByEmail: m.createdByEmail,
  }));

  return {
    products,
    stats: {
      skuCount: products.length,
      unitsOnHand,
      lowStockCount,
      outOfStockCount,
    },
    inventoryValueDisplay,
    lowOrOutList,
    suppliersCount: 0,
    movements,
    weeklyFlowLive: flowHasSignal ? weeklyBuckets : null,
  };
}
