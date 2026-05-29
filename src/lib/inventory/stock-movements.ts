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

/** Single transactional write: append ledger then mutate authoritative shelf qty (Rightlamps-style product field). */
export async function persistStockMovement(params: {
  productId: string;
  delta: number;
  reason: StockMovementReason;
  note?: string | null;
  receiptStatus?: string | null;
  createdByEmail?: string | null;
}): Promise<void> {
  const rounded = Math.trunc(params.delta);
  assertMovementSemantics({ delta: rounded, reason: params.reason });

  await prisma.$transaction(async (tx) => {
    const row = await tx.product.findUnique({
      where: { id: params.productId },
      select: { stock: true },
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
        createdByEmail: params.createdByEmail ?? undefined,
      },
    });
    await tx.product.update({
      where: { id: params.productId },
      data: { stock: next },
    });
  });
}

export type MovementFlowPoint = { label: string; in: number; out: number };

/** Buckets ledger rows into consecutive weekly windows ending “now” — feeds the overview chart without demo data when possible. */
export function movementsToWeeklyFlow(
  rows: { createdAt: Date; delta: number }[],
  bucketCount = 8,
): MovementFlowPoint[] {
  const WEEK_MS = 7 * 86400000;
  const now = Date.now();
  type Bucket = MovementFlowPoint & { rangeStart: number; rangeEnd: number };
  const buckets: Bucket[] = [];
  for (let i = bucketCount - 1; i >= 0; i--) {
    const rangeEnd = now - i * WEEK_MS;
    const rangeStart = rangeEnd - WEEK_MS;
    const startDate = new Date(rangeStart);
    buckets.push({
      rangeStart,
      rangeEnd,
      label: `${startDate.getMonth() + 1}/${startDate.getDate()}`,
      in: 0,
      out: 0,
    });
  }
  for (const r of rows) {
    const t = r.createdAt.getTime();
    for (const b of buckets) {
      if (t > b.rangeStart && t <= b.rangeEnd) {
        if (r.delta > 0) b.in += r.delta;
        else b.out += -r.delta;
        break;
      }
    }
  }
  return buckets.map(({ label, in: inbound, out: outbound }) => ({
    label,
    in: inbound,
    out: outbound,
  }));
}
