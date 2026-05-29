/** Mirrors Prisma `StockMovementReason` — duplicated here so client modules avoid importing `@/generated/prisma/client`. */
export type StockMovementReasonCode =
  | "RECEIPT"
  | "WASTE"
  | "TRANSFER"
  | "ADJUSTMENT"
  | "OTHER";

export type StockProductDetail = {
  id: string;
  name: string;
  slug: string;
  stock: number;
  published: boolean;
  priceCents: number;
  currency: string;
};

export type StockOverviewStats = {
  skuCount: number;
  unitsOnHand: number;
  lowStockCount: number;
  outOfStockCount: number;
};

export type StockLowRow = {
  id: string;
  name: string;
  qty: number;
  status: "low" | "out";
};

export type StockMovementRow = {
  id: string;
  productId: string;
  productName: string;
  delta: number;
  reason: StockMovementReasonCode;
  note: string | null;
  receiptStatus: string | null;
  createdAt: string;
  createdByEmail: string | null;
};

export type MovementFlowPoint = { label: string; in: number; out: number };
