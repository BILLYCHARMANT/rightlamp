import type { OrderRow, OrderStatus } from "@/lib/dashboard/order-types";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import {
  filterOrdersByPeriod,
  type OrderPeriodFilter,
} from "@/lib/dashboard/orders-period";

export type OrderStatusFilter = OrderStatus | "ALL";

export type OrderTabFilter =
  | "active"
  | "all"
  | "to_invoice"
  | "to_ship"
  | "to_backorder";

export const ORDER_TABS: { id: OrderTabFilter; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "all", label: "All orders" },
  { id: "to_invoice", label: "To invoice" },
  { id: "to_ship", label: "To ship" },
  { id: "to_backorder", label: "To backorder" },
];

export type OrderProgress = {
  packed: boolean;
  fulfilled: boolean;
  invoiced: boolean;
  paid: boolean;
};

export type OrdersPeriodSummary = {
  periodRevenueDisplay: string;
  paidOrders: number;
  pendingOrders: number;
};

export function computeOrdersPeriodSummary(
  orders: OrderRow[],
): OrdersPeriodSummary {
  const revenueCents = orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.totalCents, 0);
  const currency = orders.find((o) => o.currency)?.currency ?? DEFAULT_CURRENCY;

  return {
    periodRevenueDisplay: formatMoneyFromCents(revenueCents, currency),
    paidOrders: orders.filter((o) => getOrderProgress(o).paid).length,
    pendingOrders: orders.filter((o) => o.status === "PENDING").length,
  };
}

export function getOrderProgress(order: OrderRow): OrderProgress {
  if (order.status === "CANCELLED") {
    return { packed: false, fulfilled: false, invoiced: false, paid: false };
  }
  return {
    packed: order.packed,
    fulfilled: order.fulfilled,
    invoiced: order.paid,
    paid: order.paid,
  };
}

export function filterOrdersByTab(
  orders: OrderRow[],
  tab: OrderTabFilter,
): OrderRow[] {
  switch (tab) {
    case "active":
      return orders.filter(
        (o) => o.status === "PENDING" || o.status === "PROCESSING",
      );
    case "to_invoice":
      return orders.filter((o) => o.status === "PENDING");
    case "to_ship":
      return orders.filter((o) => o.status === "PROCESSING");
    case "to_backorder":
      return orders.filter(
        (o) =>
          o.status === "PENDING" &&
          /b2b|installation/i.test(o.channel),
      );
    case "all":
    default:
      return orders;
  }
}

export function filterOrders(
  orders: OrderRow[],
  tab: OrderTabFilter,
  query: string,
  period: OrderPeriodFilter = "all",
  customDate: string | null = null,
): OrderRow[] {
  const q = query.trim().toLowerCase();
  return filterOrdersByPeriod(filterOrdersByTab(orders, tab), period, customDate).filter(
    (o) => {
      if (!q) return true;
      const hay =
        `${o.id} ${o.customer} ${o.channel} ${o.lineSummary} ${o.branchName ?? ""} ${o.branchLocation ?? ""}`.toLowerCase();
      return hay.includes(q);
    },
  );
}

export type { OrderPeriodFilter };

export function orderUpdatedAt(order: OrderRow): string {
  return order.updatedAt;
}

export function ordersToCsv(rows: OrderRow[]): string {
  const header = [
    "id",
    "customer",
    "channel",
    "lines",
    "total_cents",
    "currency",
    "status",
    "placed_at",
  ];
  const lines = rows.map((o) =>
    [
      o.id,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.channel.replace(/"/g, '""')}"`,
      `"${o.lineSummary.replace(/"/g, '""')}"`,
      o.totalCents,
      o.currency,
      o.status,
      o.placedAt,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function downloadOrdersCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatOrderWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatOrderDateShort(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
