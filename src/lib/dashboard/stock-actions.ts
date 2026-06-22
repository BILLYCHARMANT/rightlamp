"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { StockMovementReason } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  deleteStockMovementRecord,
  persistStockMovement,
  updateStockMovementRecord,
} from "@/lib/inventory/stock-movements";
import { PUBLISHED_CATALOG_CACHE_TAG } from "@/lib/store/published-catalog";
import type { StockMovementReasonCode } from "@/lib/dashboard/stock-shared-types";

export type AdjustStockResult =
  | { ok: true }
  | { ok: false; message: string };

function actorEmail(session: { user?: { email?: string | null } } | null) {
  return session?.user?.email ?? null;
}

function coerceMovementReason(raw: StockMovementReasonCode): StockMovementReason {
  switch (raw) {
    case "RECEIPT":
      return StockMovementReason.RECEIPT;
    case "WASTE":
      return StockMovementReason.WASTE;
    case "TRANSFER":
      return StockMovementReason.TRANSFER;
    case "ADJUSTMENT":
      return StockMovementReason.ADJUSTMENT;
    case "OTHER":
      return StockMovementReason.OTHER;
    default:
      return StockMovementReason.OTHER;
  }
}

async function assertProductHadStockIn(
  productId: string,
): Promise<AdjustStockResult | null> {
  const receipt = await prisma.stockMovement.findFirst({
    where: {
      productId,
      reason: StockMovementReason.RECEIPT,
      delta: { gt: 0 },
    },
    select: { id: true },
  });
  if (!receipt) {
    return {
      ok: false,
      message: "Record a stock-in receipt for this item before stock-out.",
    };
  }
  return null;
}

async function assertTransferDestination(
  reason: StockMovementReason,
  destinationBranchId?: string | null,
): Promise<AdjustStockResult | null> {
  if (reason !== StockMovementReason.TRANSFER) return null;

  const branchId = destinationBranchId?.trim();
  if (!branchId) {
    return {
      ok: false,
      message: "Select the destination branch for a stock out.",
    };
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: { id: true, active: true },
  });
  if (!branch) {
    return { ok: false, message: "Destination branch not found." };
  }
  if (!branch.active) {
    return { ok: false, message: "Destination branch is inactive." };
  }
  return null;
}

/** Unified ledger write — maps Stock-In / Stock-Out / adjustments to append-only rows + Product.stock */
export async function submitStockChange(params: {
  productId: string;
  delta: number;
  reason: StockMovementReasonCode;
  note?: string | null;
  receiptStatus?: string | null;
  supplierId?: string | null;
  destinationBranchId?: string | null;
}): Promise<AdjustStockResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }

  if (!params.productId || typeof params.delta !== "number") {
    return { ok: false, message: "Invalid movement." };
  }

  if (params.delta < 0) {
    const receiptErr = await assertProductHadStockIn(params.productId);
    if (receiptErr) return receiptErr;
  }

  const reason = coerceMovementReason(params.reason);
  const transferErr = await assertTransferDestination(
    reason,
    params.destinationBranchId,
  );
  if (transferErr) return transferErr;

  try {
    await persistStockMovement({
      productId: params.productId,
      delta: params.delta,
      reason,
      note: params.note ?? null,
      receiptStatus: params.receiptStatus ?? null,
      supplierId: params.supplierId ?? null,
      destinationBranchId: params.destinationBranchId ?? null,
      createdByEmail: actorEmail(session),
    });

    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard/branches");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidateTag(PUBLISHED_CATALOG_CACHE_TAG, "max");
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not record stock movement.";
    return { ok: false, message: msg };
  }
}

export async function updateStockMovement(params: {
  movementId: string;
  delta: number;
  reason: StockMovementReasonCode;
  note?: string | null;
  receiptStatus?: string | null;
  supplierId?: string | null;
  destinationBranchId?: string | null;
}): Promise<AdjustStockResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }

  if (!params.movementId || typeof params.delta !== "number") {
    return { ok: false, message: "Invalid movement." };
  }

  try {
    const reason = coerceMovementReason(params.reason);
    const transferErr = await assertTransferDestination(
      reason,
      params.destinationBranchId,
    );
    if (transferErr) return transferErr;

    await updateStockMovementRecord({
      movementId: params.movementId,
      delta: params.delta,
      reason,
      note: params.note ?? null,
      receiptStatus: params.receiptStatus ?? null,
      supplierId: params.supplierId ?? null,
      destinationBranchId: params.destinationBranchId ?? null,
    });

    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard/branches");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidateTag(PUBLISHED_CATALOG_CACHE_TAG, "max");
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not update stock movement.";
    return { ok: false, message: msg };
  }
}

export async function deleteStockMovement(
  movementId: string,
): Promise<AdjustStockResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }

  if (!movementId) {
    return { ok: false, message: "Invalid movement." };
  }

  try {
    await deleteStockMovementRecord(movementId);

    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard/branches");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidateTag(PUBLISHED_CATALOG_CACHE_TAG, "max");
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not delete stock movement.";
    return { ok: false, message: msg };
  }
}
