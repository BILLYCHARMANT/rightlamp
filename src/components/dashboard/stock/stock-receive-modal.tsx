"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  StockMovementRow,
  StockProductDetail,
  SupplierRow,
} from "@/lib/dashboard/stock-shared-types";
import {
  submitStockChange,
  updateStockMovement,
} from "@/lib/dashboard/stock-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";

type InnerProps = {
  onClose: () => void;
  products: StockProductDetail[];
  suppliers: SupplierRow[];
  initialProductId?: string;
  movement?: StockMovementRow | null;
};

function StockReceiveModalInner({
  onClose,
  products,
  suppliers,
  initialProductId = "",
  movement = null,
}: InnerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(movement);
  const [productId, setProductId] = useState(
    () => movement?.productId ?? initialProductId,
  );
  const [qty, setQty] = useState(() =>
    movement ? String(movement.delta) : "",
  );
  const [note, setNote] = useState(() => movement?.note ?? "");
  const [receiptStatus, setReceiptStatus] = useState(
    () => movement?.receiptStatus ?? "CONFIRMED",
  );
  const [supplierId, setSupplierId] = useState(
    () => movement?.supplierId ?? "",
  );
  const [msg, setMsg] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const quantity = parseInt(qty, 10);
    if (!productId || Number.isNaN(quantity) || quantity <= 0) {
      setMsg("Choose a product and a positive whole quantity.");
      return;
    }
    startTransition(async () => {
      const res = isEdit
        ? await updateStockMovement({
            movementId: movement!.id,
            delta: quantity,
            reason: "RECEIPT",
            note: note.trim() || null,
            receiptStatus,
            supplierId: supplierId || null,
          })
        : await submitStockChange({
            productId,
            delta: quantity,
            reason: "RECEIPT",
            note: note.trim() || null,
            receiptStatus,
            supplierId: supplierId || null,
          });
      if (res.ok) {
        setQty("");
        setNote("");
        onClose();
        router.refresh();
      } else {
        setMsg(res.message);
      }
    });
  };

  const activeSuppliers = suppliers.filter((s) => s.active);

  return (
    <PodShellModal
      isOpen
      title={isEdit ? "Edit receipt" : "Record stock-in"}
      onClose={() => !pending && onClose()}
      footer={
        <>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="stock-receive-form"
            disabled={pending}
            className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : isEdit ? "Save changes" : "Post receipt"}
          </button>
        </>
      }
    >
      <form id="stock-receive-form" onSubmit={submit} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? "Update receipt details. Quantity changes adjust on-hand stock."
            : "Increases on-hand quantity and appends an inbound ledger row."}
        </p>
        <label className="block text-sm font-semibold">
          Product
          <select
            required
            disabled={isEdit}
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm disabled:opacity-60"
          >
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — on hand {p.stock}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Quantity received
          <input
            type="number"
            required
            min={1}
            step={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 font-mono text-sm"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Receipt status
            <select
              value={receiptStatus}
              onChange={(e) => setReceiptStatus(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            >
              <option value="CONFIRMED">Confirmed</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Supplier (optional)
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            >
              <option value="">—</option>
              {activeSuppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-semibold">
          Note (optional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
          />
        </label>
        {msg ? (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{msg}</p>
        ) : null}
      </form>
    </PodShellModal>
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  products: StockProductDetail[];
  suppliers: SupplierRow[];
  initialProductId?: string;
  movement?: StockMovementRow | null;
};

export function StockReceiveModal({
  isOpen,
  onClose,
  products,
  suppliers,
  initialProductId = "",
  movement = null,
}: Props) {
  if (!isOpen) return null;

  return (
    <StockReceiveModalInner
      key={movement?.id ?? initialProductId ?? "new"}
      onClose={onClose}
      products={products}
      suppliers={suppliers}
      initialProductId={initialProductId}
      movement={movement}
    />
  );
}
