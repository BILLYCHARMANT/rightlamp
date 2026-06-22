"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizeCurrency } from "@/lib/dashboard/constants";
import { OrderStatus as PrismaOrderStatus } from "@/generated/prisma/client";
import { deriveOrderStatus, formatOrderId, mapOrderToRow, parseOrderDisplayId } from "@/lib/dashboard/order-mapper";
import { getOrderViewerScope, canAccessOrderBranch } from "@/lib/dashboard/rbac-server";
import { hasGlobalOrderAccess, normalizeStaffRole } from "@/lib/dashboard/rbac";
import { validateActiveBranchId } from "@/lib/dashboard/order-branches";
import { logBranchActivity } from "@/lib/dashboard/shop-activity";
import type { OrderStatus } from "@/lib/dashboard/order-types";
import type {
  OrderRequestInput,
  OrderableProduct,
  OrderRow,
} from "@/lib/dashboard/order-types";
import { prisma } from "@/lib/db";

export type OrderActionResult =
  | { ok: true; orderId: string }
  | { ok: false; message: string };

export type OrderProgressField = "packed" | "fulfilled" | "paid";

export type OrderProgressResult =
  | { ok: true; order: OrderRow }
  | { ok: false; message: string };

function revalidateOrderSurfaces() {
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/my-shops");
  revalidatePath("/request-order");
  revalidatePath("/custom-product");
}

async function resolveStaffBranchId(userId: string | undefined): Promise<string | null> {
  if (!userId) return null;
  const assignment = await prisma.branchStaffAssignment.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { branchId: true },
  });
  return assignment?.branchId ?? null;
}

async function recordBranchFulfillment(params: {
  branchId: string;
  orderNumber: number;
  items: { productId: string | null; productName: string; quantity: number }[];
  userEmail: string | null;
  userName: string | null;
}) {
  const lines = params.items.filter((item) => item.productId);
  if (!lines.length) return;

  await prisma.$transaction(async (tx) => {
    for (const item of lines) {
      await tx.branchInventory.updateMany({
        where: {
          branchId: params.branchId,
          productId: item.productId!,
        },
        data: { quantitySold: { increment: item.quantity } },
      });
    }
  });

  const summary = params.items
    .map((item) => `${item.quantity}× ${item.productName}`)
    .join(", ");
  await logBranchActivity({
    branchId: params.branchId,
    action: "PRODUCT_SOLD",
    description: `Order ${formatOrderId(params.orderNumber)} fulfilled — sold ${summary}.`,
    userEmail: params.userEmail,
    userName: params.userName,
  });
}

async function requireStaffSession(): Promise<{ ok: false; message: string } | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }
  return null;
}

export async function getOrderableProducts(): Promise<OrderableProduct[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      currency: true,
      stock: true,
      accessories: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          priceCents: true,
        },
      },
    },
  });
  return rows;
}

function validateRequest(input: OrderRequestInput): string | null {
  const name = input.customerName.trim();
  if (!name) return "Name is required.";

  const email = input.customerEmail.trim();
  if (!email || !email.includes("@")) return "A valid email is required.";

  const phone = input.customerPhone.trim();
  if (!phone || phone.length < 6) return "Phone number is required.";

  if (!input.items.length) return "Select at least one product.";

  for (const line of input.items) {
    if (!line.productId) return "Each line must have a product.";
    const qty = Math.floor(Number(line.quantity));
    if (!Number.isFinite(qty) || qty < 1) {
      return "Quantity must be at least 1 for each product.";
    }
  }

  return null;
}

async function resolveOrderLines(items: OrderRequestInput["items"]) {
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
    select: {
      id: true,
      name: true,
      slug: true,
      priceCents: true,
      currency: true,
      accessories: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          priceCents: true,
        },
      },
    },
  });

  const byId = new Map(products.map((p) => [p.id, p]));
  const resolved: {
    productId: string;
    productName: string;
    productSlug: string;
    quantity: number;
    unitPriceCents: number;
    currency: string;
    accessories: {
      accessoryId: string;
      name: string;
      imageUrl: string | null;
      quantity: number;
      unitPriceCents: number;
      currency: string;
    }[];
  }[] = [];

  let totalCents = 0;
  let currency = normalizeCurrency(products[0]?.currency ?? "RWF");

  for (const line of items) {
    const product = byId.get(line.productId);
    if (!product) {
      return { error: "One or more selected products are unavailable." as const };
    }

    const quantity = Math.max(1, Math.floor(Number(line.quantity)));
    currency = normalizeCurrency(product.currency);
    totalCents += product.priceCents * quantity;

    const accessoryById = new Map(
      product.accessories.map((accessory) => [accessory.id, accessory]),
    );
    const selectedIds = [...new Set(line.accessoryIds ?? [])];
    const lineAccessories: (typeof resolved)[number]["accessories"] = [];

    for (const accessoryId of selectedIds) {
      const accessory = accessoryById.get(accessoryId);
      if (!accessory) {
        return {
          error: `Invalid accessory selected for ${product.name}.` as const,
        };
      }

      lineAccessories.push({
        accessoryId: accessory.id,
        name: accessory.name,
        imageUrl: accessory.imageUrl,
        quantity,
        unitPriceCents: accessory.priceCents,
        currency,
      });
      totalCents += accessory.priceCents * quantity;
    }

    resolved.push({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quantity,
      unitPriceCents: product.priceCents,
      currency,
      accessories: lineAccessories,
    });
  }

  return { resolved, totalCents, currency };
}

async function persistOrder(
  input: OrderRequestInput,
  channel: string,
  createdByEmail: string | null,
  branchId: string | null = null,
): Promise<OrderActionResult> {
  const validationError = validateRequest(input);
  if (validationError) return { ok: false, message: validationError };

  const lines = await resolveOrderLines(input.items);
  if ("error" in lines) {
    return { ok: false, message: lines.error ?? "Invalid product selection." };
  }

  let customerAddress = input.customerAddress?.trim() || null;
  if (branchId) {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { location: true },
    });
    if (branch?.location?.trim()) {
      customerAddress = branch.location.trim();
    }
  }

  const order = await prisma.order.create({
    data: {
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim(),
      customerPhone: input.customerPhone.trim(),
      customerAddress,
      notes: input.notes?.trim() || null,
      channel,
      totalCents: lines.totalCents,
      currency: lines.currency,
      createdByEmail,
      branchId,
      items: {
        create: lines.resolved.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          productSlug: line.productSlug,
          quantity: line.quantity,
          unitPriceCents: line.unitPriceCents,
          currency: line.currency,
          accessories: line.accessories.length
            ? {
                create: line.accessories.map((accessory) => ({
                  accessoryId: accessory.accessoryId,
                  name: accessory.name,
                  imageUrl: accessory.imageUrl,
                  quantity: accessory.quantity,
                  unitPriceCents: accessory.unitPriceCents,
                  currency: accessory.currency,
                })),
              }
            : undefined,
        })),
      },
    },
    select: { orderNumber: true },
  });

  revalidateOrderSurfaces();
  return { ok: true, orderId: formatOrderId(order.orderNumber) };
}

/** Public storefront — buyer submits an order request. */
export async function submitOrderRequest(
  input: OrderRequestInput,
): Promise<OrderActionResult> {
  const branchCheck = await validateActiveBranchId(input.branchId);
  if (!branchCheck.ok) {
    return { ok: false, message: branchCheck.message };
  }

  return persistOrder(input, "Web request", null, branchCheck.branchId);
}

/** Staff dashboard — seller/admin records an order on behalf of a customer. */
export async function submitStaffOrderRequest(
  input: OrderRequestInput,
): Promise<OrderActionResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const session = await getServerSession(authOptions);
  const role = normalizeStaffRole(session?.user?.role);
  const canPickBranch = hasGlobalOrderAccess(role);

  let branchId: string | null = null;

  if (canPickBranch) {
    const branchCheck = await validateActiveBranchId(input.branchId);
    if (!branchCheck.ok) {
      return { ok: false, message: "Select a shop location for this order." };
    }
    branchId = branchCheck.branchId;
  } else {
    branchId = await resolveStaffBranchId(session?.user?.id);
    if (!branchId) {
      return {
        ok: false,
        message: "Your account is not assigned to a branch. Contact an admin.",
      };
    }
  }

  return persistOrder(
    input,
    "Staff entry",
    session?.user?.email ?? null,
    branchId,
  );
}

const orderInclude = {
  branch: {
    select: { id: true, name: true, location: true },
  },
  items: {
    orderBy: { id: "asc" as const },
    include: {
      accessories: { orderBy: { id: "asc" as const } },
    },
  },
};

async function assertStaffCanManageOrder(orderBranchId: string | null): Promise<OrderProgressResult | null> {
  const scope = await getOrderViewerScope();
  if (!scope) {
    return { ok: false, message: "You must be signed in." };
  }
  if (!canAccessOrderBranch(orderBranchId, scope)) {
    return { ok: false, message: "You cannot manage orders for this location." };
  }
  return null;
}

/** Toggle pack / fulfill / paid — status updates automatically. */
export async function updateOrderProgress(
  orderDisplayId: string,
  field: OrderProgressField,
  value: boolean,
): Promise<OrderProgressResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const orderNumber = parseOrderDisplayId(orderDisplayId);
  if (orderNumber == null) {
    return { ok: false, message: "Invalid order number." };
  }

  const existing = await prisma.order.findUnique({
    where: { orderNumber },
    include: orderInclude,
  });

  if (!existing) {
    return { ok: false, message: "Order not found." };
  }

  const accessErr = await assertStaffCanManageOrder(existing.branchId);
  if (accessErr) return accessErr;

  if (existing.status === "CANCELLED") {
    return { ok: false, message: "Cancelled orders cannot be updated." };
  }

  const nextPacked = field === "packed" ? value : Boolean(existing.packed);
  const nextFulfilled =
    field === "fulfilled" ? value : Boolean(existing.fulfilled);
  const nextPaid = field === "paid" ? value : Boolean(existing.paid);

  const nextStatus = deriveOrderStatus(
    nextPacked,
    nextFulfilled,
    nextPaid,
    existing.status as OrderStatus,
  );

  const updated = await prisma.order.update({
    where: { id: existing.id },
    data: {
      packed: nextPacked,
      fulfilled: nextFulfilled,
      paid: nextPaid,
      status: nextStatus as PrismaOrderStatus,
    },
    include: orderInclude,
  });

  if (nextFulfilled && !existing.fulfilled && existing.branchId) {
    const session = await getServerSession(authOptions);
    await recordBranchFulfillment({
      branchId: existing.branchId,
      orderNumber: existing.orderNumber,
      items: existing.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
      })),
      userEmail: session?.user?.email ?? null,
      userName: session?.user?.name ?? null,
    });
  }

  revalidateOrderSurfaces();
  return { ok: true, order: mapOrderToRow(updated) };
}

/** Mark an order as cancelled — does not remove ledger history. */
export async function cancelOrder(
  orderDisplayId: string,
): Promise<OrderProgressResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const orderNumber = parseOrderDisplayId(orderDisplayId);
  if (orderNumber == null) {
    return { ok: false, message: "Invalid order number." };
  }

  const existing = await prisma.order.findUnique({
    where: { orderNumber },
    include: orderInclude,
  });

  if (!existing) {
    return { ok: false, message: "Order not found." };
  }

  const accessErr = await assertStaffCanManageOrder(existing.branchId);
  if (accessErr) return accessErr;

  if (existing.status === "CANCELLED") {
    return { ok: false, message: "Order is already cancelled." };
  }

  const updated = await prisma.order.update({
    where: { id: existing.id },
    data: { status: "CANCELLED" as PrismaOrderStatus },
    include: orderInclude,
  });

  revalidateOrderSurfaces();
  return { ok: true, order: mapOrderToRow(updated) };
}
