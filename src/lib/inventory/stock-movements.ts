import "server-only";

import { StockMovementReason } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

/** Validates ops semantics before touching Product.stock + ledger row. */
export function assertMovementSemantics(params: {
  delta: number;
  reason: StockMovementReason;
}): void {
  const d = Math.trunc(params.delta);
  if (d === 0) throw new Error("Movement quantity cannot be zero.");
  switch (params.reason) {
    case StockMovementReason.RECEIPT:
      if (d <= 0) throw new Error("Receipts must increase on-hand quantity.");
      break;
    case StockMovementReason.WASTE:
    case StockMovementReason.TRANSFER:
      if (d >= 0) throw new Error("This removal type expects a negative quantity.");
      break;
    default:
      break;
  }
}

/** Single transactional write: append ledger then mutate authoritative shelf qty (PV-GRID-style product field). */
export async function persistStockMovement(params: {
  productId: string;
  delta: number;
  reason: StockMovementReason;
  note?: string | null;
  receiptStatus?: string | null;
  supplierId?: string | null;
  destinationBranchId?: string | null;
  createdByEmail?: string | null;
}): Promise<void> {
  const rounded = Math.trunc(params.delta);
  assertMovementSemantics({ delta: rounded, reason: params.reason });

  await prisma.$transaction(async (tx) => {
    const row = await tx.product.findUnique({
      where: { id: params.productId },
      select: { stock: true, name: true },
    });
    if (!row) throw new Error("Product not found.");
    const next = row.stock + rounded;
    if (next < 0) throw new Error("Stock cannot go below zero.");

    await tx.stockMovement.create({
      data: {
        productId: params.productId,
        delta: rounded,
        reason: params.reason,
        note: params.note?.trim() ? params.note.trim() : undefined,
        receiptStatus: params.receiptStatus?.trim()
          ? params.receiptStatus.trim()
          : undefined,
        supplierId: params.supplierId?.trim() ? params.supplierId.trim() : undefined,
        destinationBranchId: params.destinationBranchId?.trim()
          ? params.destinationBranchId.trim()
          : undefined,
        createdByEmail: params.createdByEmail ?? undefined,
      },
    });
    await tx.product.update({
      where: { id: params.productId },
      data: { stock: next },
    });

    if (
      params.reason === StockMovementReason.TRANSFER &&
      params.destinationBranchId &&
      rounded < 0
    ) {
      const qty = Math.abs(rounded);
      await tx.branchInventory.upsert({
        where: {
          branchId_productId: {
            branchId: params.destinationBranchId,
            productId: params.productId,
          },
        },
        create: {
          branchId: params.destinationBranchId,
          productId: params.productId,
          quantity: qty,
        },
        update: {
          quantity: { increment: qty },
        },
      });
    }
  });

  if (
    params.reason === StockMovementReason.TRANSFER &&
    params.destinationBranchId &&
    rounded < 0
  ) {
    const [product, branch] = await Promise.all([
      prisma.product.findUnique({
        where: { id: params.productId },
        select: { name: true },
      }),
      prisma.branch.findUnique({
        where: { id: params.destinationBranchId },
        select: { name: true },
      }),
    ]);
    const qty = Math.abs(rounded);
    const { logBranchActivity } = await import("@/lib/dashboard/shop-activity");
    await logBranchActivity({
      branchId: params.destinationBranchId,
      action: "PRODUCT_ASSIGNED",
      description: `Assigned ${qty} × ${product?.name ?? "product"} to ${branch?.name ?? "branch"} from central stock.`,
      userEmail: params.createdByEmail,
    });
  }
}

/** Removes a ledger row and reverses its effect on Product.stock. */
export async function deleteStockMovementRecord(movementId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const movement = await tx.stockMovement.findUnique({
      where: { id: movementId },
      select: { id: true, productId: true, delta: true },
    });
    if (!movement) throw new Error("Movement not found.");

    const product = await tx.product.findUnique({
      where: { id: movement.productId },
      select: { stock: true },
    });
    if (!product) throw new Error("Product not found.");

    const next = product.stock - movement.delta;
    if (next < 0) {
      throw new Error("Deleting this movement would drop stock below zero.");
    }

    await tx.stockMovement.delete({ where: { id: movementId } });
    await tx.product.update({
      where: { id: movement.productId },
      data: { stock: next },
    });
  });
}

/** Updates movement metadata and quantity, adjusting shelf stock by the delta difference. */
export async function updateStockMovementRecord(params: {
  movementId: string;
  delta: number;
  reason: StockMovementReason;
  note?: string | null;
  receiptStatus?: string | null;
  supplierId?: string | null;
  destinationBranchId?: string | null;
}): Promise<void> {
  const rounded = Math.trunc(params.delta);
  assertMovementSemantics({ delta: rounded, reason: params.reason });

  await prisma.$transaction(async (tx) => {
    const existing = await tx.stockMovement.findUnique({
      where: { id: params.movementId },
      select: { id: true, productId: true, delta: true, reason: true },
    });
    if (!existing) throw new Error("Movement not found.");

    const product = await tx.product.findUnique({
      where: { id: existing.productId },
      select: { stock: true },
    });
    if (!product) throw new Error("Product not found.");

    const next = product.stock - existing.delta + rounded;
    if (next < 0) throw new Error("Stock cannot go below zero.");

    await tx.stockMovement.update({
      where: { id: params.movementId },
      data: {
        delta: rounded,
        reason: params.reason,
        note: params.note?.trim() ? params.note.trim() : null,
        receiptStatus: params.receiptStatus?.trim()
          ? params.receiptStatus.trim()
          : null,
        supplierId: params.supplierId?.trim() ? params.supplierId.trim() : null,
        destinationBranchId: params.destinationBranchId?.trim()
          ? params.destinationBranchId.trim()
          : null,
      },
    });
    await tx.product.update({
      where: { id: existing.productId },
      data: { stock: next },
    });
  });
}
