"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { StockMovementReason } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { persistStockMovement } from "@/lib/inventory/stock-movements";
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

/** Unified ledger write — maps Stock-In / Stock-Out / adjustments to append-only rows + Product.stock */
export async function submitStockChange(params: {
  productId: string;
  delta: number;
  reason: StockMovementReasonCode;
  note?: string | null;
  receiptStatus?: string | null;
}): Promise<AdjustStockResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }

  if (!params.productId || typeof params.delta !== "number") {
    return { ok: false, message: "Invalid movement." };
  }

  try {
    await persistStockMovement({
      productId: params.productId,
      delta: params.delta,
      reason: coerceMovementReason(params.reason),
      note: params.note ?? null,
      receiptStatus: params.receiptStatus ?? null,
      createdByEmail: actorEmail(session),
    });

    revalidatePath("/dashboard/stock");
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
