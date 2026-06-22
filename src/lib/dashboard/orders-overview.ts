import "server-only";



import type { OrderRow, OrderStatus } from "@/lib/dashboard/order-types";

import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";

import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

import { fetchAllOrders } from "@/lib/dashboard/orders-queries";
import type { OrderViewerScope } from "@/lib/dashboard/order-access";
import { startOfCurrentMonth } from "@/lib/dashboard/orders-period";



export type OrdersChannelSlice = {

  channel: string;

  orderCount: number;

  revenueCents: number;

};



export type OrdersOverviewPayload = {

  orders: OrderRow[];

  summary: {

    totalOrders: number;

    openCount: number;

    pendingCount: number;

    processingCount: number;

    fulfilledCount: number;

    cancelledCount: number;

    weekRevenueDisplay: string;

    weekOrderCount: number;

    avgOrderDisplay: string;

    openRevenueDisplay: string;

  };

  channels: OrdersChannelSlice[];

  openQueue: OrderRow[];

  viewMode: {
    monthOnly: boolean;
  };

};



const MS_WEEK = 7 * 86400000;



function countByStatus(orders: OrderRow[], status: OrderStatus) {

  return orders.filter((o) => o.status === status).length;

}



function buildOverviewPayload(orders: OrderRow[]): OrdersOverviewPayload {

  const now = Date.now();

  const weekOrders = orders.filter(

    (o) => now - new Date(o.placedAt).getTime() <= MS_WEEK,

  );

  const weekRevenueCents = weekOrders

    .filter((o) => o.status !== "CANCELLED")

    .reduce((s, o) => s + o.totalCents, 0);



  const activeOrders = orders.filter((o) => o.status !== "CANCELLED");

  const avgCents =

    activeOrders.length > 0

      ? Math.round(

          activeOrders.reduce((s, o) => s + o.totalCents, 0) /

            activeOrders.length,

        )

      : 0;



  const openOrders = orders.filter(

    (o) => o.status === "PENDING" || o.status === "PROCESSING",

  );

  const openRevenueCents = openOrders.reduce((s, o) => s + o.totalCents, 0);



  const channelMap = new Map<string, OrdersChannelSlice>();

  for (const o of orders) {

    if (o.status === "CANCELLED") continue;

    const key = o.channel.trim() || "Other";

    const slice = channelMap.get(key) ?? {

      channel: key,

      orderCount: 0,

      revenueCents: 0,

    };

    slice.orderCount += 1;

    slice.revenueCents += o.totalCents;

    channelMap.set(key, slice);

  }



  const channels = [...channelMap.values()].sort(

    (a, b) => b.revenueCents - a.revenueCents,

  );



  return {

    orders,

    summary: {

      totalOrders: orders.length,

      openCount: openOrders.length,

      pendingCount: countByStatus(orders, "PENDING"),

      processingCount: countByStatus(orders, "PROCESSING"),

      fulfilledCount: countByStatus(orders, "FULFILLED"),

      cancelledCount: countByStatus(orders, "CANCELLED"),

      weekRevenueDisplay: formatMoneyFromCents(

        weekRevenueCents,

        DEFAULT_CURRENCY,

      ),

      weekOrderCount: weekOrders.length,

      avgOrderDisplay: formatMoneyFromCents(avgCents, DEFAULT_CURRENCY),

      openRevenueDisplay: formatMoneyFromCents(

        openRevenueCents,

        DEFAULT_CURRENCY,

      ),

    },

    channels,

    openQueue: openOrders.slice(0, 6),

    viewMode: { monthOnly: false },

  };

}



export async function getOrdersOverviewPayload(
  scope?: OrderViewerScope | null,
): Promise<OrdersOverviewPayload> {
  const orders = await fetchAllOrders(scope, {
    placedAtGte: startOfCurrentMonth(),
  });
  const payload = buildOverviewPayload(orders);
  return { ...payload, viewMode: { monthOnly: true } };
}

