import type { OrderItem, Order as PrismaOrder, OrderItemAccessory } from "@/generated/prisma/client";
import type { OrderLineItem, OrderRow, OrderStatus } from "@/lib/dashboard/order-types";

type OrderItemWithAccessories = OrderItem & {
  accessories: OrderItemAccessory[];
};

type OrderWithItems = PrismaOrder & {
  items: OrderItemWithAccessories[];
  branch?: { id: string; name: string; location: string | null } | null;
};

export function formatOrderId(orderNumber: number): string {
  return `RL-${orderNumber}`;
}

export function parseOrderDisplayId(id: string): number | null {
  const match = /^RL-(\d+)$/i.exec(id.trim());
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export function buildLineSummary(items: OrderLineItem[]): string {
  return items
    .map((item) => {
      const base = `${item.productName} × ${item.quantity}`;
      if (!item.accessories.length) return base;
      const accessoryNames = item.accessories.map((a) => a.name).join(", ");
      return `${base} (+ ${accessoryNames})`;
    })
    .join(" · ");
}

/** Derive workflow status from pack / fulfill / paid flags. */
export function deriveOrderStatus(
  packed: boolean,
  fulfilled: boolean,
  paid: boolean,
  current: OrderStatus,
): OrderStatus {
  if (current === "CANCELLED") return "CANCELLED";
  if (packed && fulfilled && paid) return "FULFILLED";
  if (packed || fulfilled || paid) return "PROCESSING";
  return "PENDING";
}

export function mapOrderToRow(order: OrderWithItems): OrderRow {
  const items: OrderLineItem[] = order.items.map((i) => ({
    productName: i.productName,
    productSlug: i.productSlug,
    quantity: i.quantity,
    unitPriceCents: i.unitPriceCents,
    currency: i.currency,
    accessories: i.accessories.map((a) => ({
      name: a.name,
      imageUrl: a.imageUrl,
      quantity: a.quantity,
      unitPriceCents: a.unitPriceCents,
      currency: a.currency,
    })),
  }));

  const status = order.status as OrderStatus;

  return {
    id: formatOrderId(order.orderNumber),
    customer: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    channel: order.channel,
    lineSummary: buildLineSummary(items),
    items,
    totalCents: order.totalCents,
    currency: order.currency,
    status,
    packed: order.packed,
    fulfilled: order.fulfilled,
    paid: order.paid,
    placedAt: order.placedAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    notes: order.notes,
    branchId: order.branchId,
    branchName: order.branch?.name ?? null,
    branchLocation: order.branch?.location ?? null,
  };
}
