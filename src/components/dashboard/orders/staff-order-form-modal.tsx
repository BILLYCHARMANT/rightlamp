"use client";

import { useRouter } from "next/navigation";
import { OrderRequestForm } from "@/components/orders/order-request-form";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { submitStaffOrderRequest } from "@/lib/dashboard/order-actions";
import type { StaffOrderFormContext } from "@/lib/dashboard/order-branches";
import type { OrderableProduct } from "@/lib/dashboard/order-types";

type Props = {
  isOpen: boolean;
  products: OrderableProduct[];
  orderFormContext: StaffOrderFormContext;
  onClose: () => void;
};

export function StaffOrderFormModal({
  isOpen,
  products,
  orderFormContext,
  onClose,
}: Props) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <PodShellModal
      isOpen={isOpen}
      title="New sales order"
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <p className="mb-5 text-xs text-muted-foreground">
        Record a buyer order — contact details, shop location, and products from
        the live catalog.
      </p>
      <OrderRequestForm
        key={orderFormContext.defaultBranchId ?? "staff-order"}
        products={products}
        branches={orderFormContext.branches}
        defaultBranchId={orderFormContext.defaultBranchId ?? undefined}
        branchLocked={!orderFormContext.canEditBranch}
        submitLabel="Create order"
        variant="dashboard"
        onSubmit={submitStaffOrderRequest}
        onSuccess={() => {
          router.refresh();
          onClose();
        }}
      />
    </PodShellModal>
  );
}
