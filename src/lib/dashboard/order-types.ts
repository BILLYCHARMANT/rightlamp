import type { OrderRequestDetails } from "@/lib/orders/order-request-details";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "FULFILLED"
  | "CANCELLED";

export type OrderLineAccessory = {
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPriceCents: number;
  currency: string;
};

export type OrderLineItem = {
  productName: string;
  productSlug: string;
  quantity: number;
  unitPriceCents: number;
  currency: string;
  accessories: OrderLineAccessory[];
};

/** Row shape consumed by orders dashboard UI. */
export type OrderRow = {
  id: string;
  customer: string;
  customerEmail: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
  channel: string;
  lineSummary: string;
  items: OrderLineItem[];
  totalCents: number;
  currency: string;
  status: OrderStatus;
  packed: boolean;
  fulfilled: boolean;
  paid: boolean;
  placedAt: string;
  updatedAt: string;
  notes: string | null;
  requestDetails: OrderRequestDetails | null;
  branchId: string | null;
  branchName: string | null;
  branchLocation: string | null;
};

export type OrderableProductAccessory = {
  id: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
};

export type OrderableProduct = {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  stock: number;
  familyId: string | null;
  familyName: string | null;
  variantLabel: string | null;
  accessories: OrderableProductAccessory[];
};

export type OrderPickupBranch = {
  id: string;
  name: string;
  location: string | null;
  phone: string | null;
};

/** Label for location dropdown — branch address is the selectable value. */
export function formatBranchLocationOption(branch: OrderPickupBranch): string {
  return branch.location?.trim()
    ? `${branch.location.trim()} (${branch.name})`
    : branch.name;
}

export type OrderRequestLineInput = {
  productId: string;
  quantity: number;
  accessoryIds?: string[];
};

export type OrderRequestInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  /** Nearest branch / pickup location for web orders. */
  branchId?: string;
  notes?: string;
  items: OrderRequestLineInput[];
  requestDetails?: import("@/lib/orders/order-request-details").OrderRequestDetails;
};
