import "server-only";

import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import type {
  FlowPeriod,
  MovementFlowPoint,
  StockLowRow,
  StockMovementReasonCode,
  StockMovementRow,
  StockOverviewStats,
  StockProductDetail,
  SupplierRow,
  BranchRow,
} from "@/lib/dashboard/stock-shared-types";
import { buildAllPeriodFlows } from "@/lib/inventory/stock-flow";
import { prisma } from "@/lib/db";

function unitCostCents(p: {
  costPriceCents: number | null;
  priceCents: number;
}): number {
  return p.costPriceCents ?? p.priceCents;
}

export async function getStockManagementPayload(): Promise<{
  products: StockProductDetail[];
  stats: StockOverviewStats;
  inventoryValueDisplay: string;
  costValueDisplay: string;
  lowOrOutList: StockLowRow[];
  suppliers: SupplierRow[];
  movements: StockMovementRow[];
  flowByPeriod: Record<FlowPeriod, MovementFlowPoint[]>;
  branches: BranchRow[];
}> {
  const [products, supplierRows, movementRows, branchRows] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        stock: true,
        published: true,
        priceCents: true,
        costPriceCents: true,
        currency: true,
      },
    }),
    prisma.supplier.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        phone: true,
        active: true,
        _count: { select: { movements: true } },
      },
    }),
    prisma.stockMovement.findMany({
      where: {
        createdAt: { gte: new Date(Date.now() - 400 * 86400000) },
      },
      orderBy: { createdAt: "desc" },
      take: 5000,
      include: {
        product: { select: { name: true } },
        supplier: { select: { name: true } },
        destinationBranch: { select: { name: true } },
      },
    }),
    prisma.branch.findMany({
      orderBy: [{ isMain: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        code: true,
        location: true,
        phone: true,
        active: true,
        isMain: true,
      },
    }),
  ]);

  let unitsOnHand = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const retailByCurrency = new Map<string, number>();
  const costByCurrency = new Map<string, number>();

  for (const p of products) {
    unitsOnHand += p.stock;
    retailByCurrency.set(
      p.currency,
      (retailByCurrency.get(p.currency) ?? 0) + p.priceCents * p.stock,
    );
    costByCurrency.set(
      p.currency,
      (costByCurrency.get(p.currency) ?? 0) + unitCostCents(p) * p.stock,
    );
    if (p.published) {
      if (p.stock === 0) outOfStockCount += 1;
      else if (p.stock <= LOW_STOCK_THRESHOLD) lowStockCount += 1;
    }
  }

  const formatMap = (map: Map<string, number>) =>
    map.size === 0
      ? "—"
      : [...map.entries()]
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

  const flowRows = movementRows.map((m) => ({
    createdAt: m.createdAt,
    delta: m.delta,
  }));

  const itemCountBySupplier = new Map<string, Set<string>>();
  for (const m of movementRows) {
    if (!m.supplierId) continue;
    let set = itemCountBySupplier.get(m.supplierId);
    if (!set) {
      set = new Set<string>();
      itemCountBySupplier.set(m.supplierId, set);
    }
    set.add(m.productId);
  }

  const movements: StockMovementRow[] = movementRows.map((m) => ({
    id: m.id,
    productId: m.productId,
    productName: m.product.name,
    delta: m.delta,
    reason: m.reason as StockMovementReasonCode,
    note: m.note,
    receiptStatus: m.receiptStatus,
    supplierId: m.supplierId,
    supplierName: m.supplier?.name ?? null,
    destinationBranchId: m.destinationBranchId,
    destinationBranchName: m.destinationBranch?.name ?? null,
    createdAt: m.createdAt.toISOString(),
    createdByEmail: m.createdByEmail,
  }));

  const suppliers: SupplierRow[] = supplierRows.map((s) => ({
    id: s.id,
    name: s.name,
    contact: s.contact,
    email: s.email,
    phone: s.phone,
    active: s.active,
    receiptCount: s._count.movements,
    itemCount: itemCountBySupplier.get(s.id)?.size ?? 0,
  }));

  const branches: BranchRow[] = branchRows.map((b) => ({
    id: b.id,
    name: b.name,
    code: b.code,
    location: b.location,
    phone: b.phone,
    active: b.active,
    isMain: b.isMain,
  }));

  return {
    products,
    stats: {
      skuCount: products.length,
      unitsOnHand,
      lowStockCount,
      outOfStockCount,
    },
    inventoryValueDisplay: formatMap(retailByCurrency),
    costValueDisplay: formatMap(costByCurrency),
    lowOrOutList,
    suppliers,
    movements,
    flowByPeriod: buildAllPeriodFlows(flowRows),
    branches,
  };
}
