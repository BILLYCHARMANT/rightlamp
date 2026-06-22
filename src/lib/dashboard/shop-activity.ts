import "server-only";

import type { BranchActivityAction } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export async function logBranchActivity(params: {
  branchId: string;
  action: BranchActivityAction;
  description: string;
  userEmail?: string | null;
  userName?: string | null;
}) {
  await prisma.branchActivityLog.create({
    data: {
      branchId: params.branchId,
      action: params.action,
      description: params.description.slice(0, 2000),
      userEmail: params.userEmail ?? undefined,
      userName: params.userName ?? undefined,
    },
  });
}

export function formatActivityAction(action: BranchActivityAction): string {
  switch (action) {
    case "PRODUCT_ASSIGNED":
      return "Product assigned";
    case "PRODUCT_SOLD":
      return "Product sold";
    case "STOCK_ADJUSTED":
      return "Stock adjusted";
    case "STAFF_ASSIGNED":
      return "Staff assigned";
    case "STAFF_REMOVED":
      return "Staff removed";
    case "SHOP_UPDATED":
      return "Shop updated";
    default:
      return action;
  }
}
