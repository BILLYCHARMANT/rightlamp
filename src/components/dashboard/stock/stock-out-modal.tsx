"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  BranchRow,
  StockMovementReasonCode,
  StockMovementRow,
  StockProductDetail,
} from "@/lib/dashboard/stock-shared-types";
import {
  submitStockChange,
  updateStockMovement,
} from "@/lib/dashboard/stock-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";

const OUT_REASONS: { value: StockMovementReasonCode; label: string }[] = [
  { value: "WASTE", label: "Waste / damage" },
  { value: "TRANSFER", label: "Stock out" },
  { value: "ADJUSTMENT", label: "Adjustment" },
  { value: "OTHER", label: "Other" },
];

type InnerProps = {
  onClose: () => void;
  products: StockProductDetail[];
  branches: BranchRow[];
  initialProductId?: string;
  movement?: StockMovementRow | null;
};

function StockOutModalInner({
  onClose,
  products,
  branches,
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
    movement ? String(Math.abs(movement.delta)) : "",
  );
  const [reason, setReason] = useState<StockMovementReasonCode>(
    () => movement?.reason ?? "WASTE",
  );
  const [destinationBranchId, setDestinationBranchId] = useState(
    () => movement?.destinationBranchId ?? "",
  );
  const [note, setNote] = useState(() => movement?.note ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  const activeBranches = useMemo(
    () => branches.filter((b) => b.active),
    [branches],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const quantity = parseInt(qty, 10);
    if (!productId || Number.isNaN(quantity) || quantity <= 0) {
      setMsg("Choose a product and a positive quantity to remove.");
      return;
    }

    if (reason === "TRANSFER" && !destinationBranchId) {
      setMsg("Select the branch receiving this stock out.");
      return;
    }

    if (reason === "TRANSFER" && activeBranches.length === 0) {
      setMsg("Add at least one active branch before recording a stock out.");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!isEdit && product && quantity > product.stock) {
      setMsg(`Only ${product.stock} units on hand.`);
      return;
    }

    startTransition(async () => {
      const payload = {
        delta: -quantity,
        reason,
        note: note.trim() || null,
        destinationBranchId:
          reason === "TRANSFER" ? destinationBranchId || null : null,
      };

      const res = isEdit
        ? await updateStockMovement({
            movementId: movement!.id,
            ...payload,
          })
        : await submitStockChange({
            productId,
            ...payload,
          });
      if (res.ok) {
        setQty("");
        setNote("");
        setDestinationBranchId("");
        onClose();
        router.refresh();
      } else {
        setMsg(res.message);
      }
    });
  };

  return (
    <PodShellModal
      isOpen
      title={isEdit ? "Edit stock-out" : "Record stock-out"}
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
            form="stock-out-form"
            disabled={pending || (!isEdit && products.length === 0)}
            className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : isEdit ? "Save changes" : "Post removal"}
          </button>
        </>
      }
    >
      <form id="stock-out-form" onSubmit={submit} className="space-y-4">
        <p className="text-xs text-muted-foreground">
          {isEdit
            ? "Update removal details. Quantity changes adjust on-hand stock."
            : "Only items with a stock-in receipt and units on hand appear here. Choose Stock out to send items to another branch."}
        </p>
        {products.length === 0 && !isEdit ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No eligible items yet. Record a stock-in receipt first, then return here
            to stock out.
          </p>
        ) : null}
        <label className="block text-sm font-semibold">
          Product
          <select
            required
            disabled={isEdit || products.length === 0}
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
          Quantity to remove
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
        <label className="block text-sm font-semibold">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as StockMovementReasonCode)}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
          >
            {OUT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        {reason === "TRANSFER" ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold">
              Destination branch
              <select
                required
                value={destinationBranchId}
                onChange={(e) => setDestinationBranchId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              >
                <option value="">Select receiving branch…</option>
                {activeBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    {b.code ? ` (${b.code})` : ""}
                    {b.location ? ` — ${b.location}` : ""}
                  </option>
                ))}
              </select>
            </label>
            {activeBranches.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No active branches yet.{" "}
                <Link
                  href="/dashboard/branches"
                  className="font-semibold text-brand hover:underline"
                >
                  Add a branch
                </Link>{" "}
                before stocking out to a branch.
              </p>
            ) : null}
          </div>
        ) : null}
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
  branches: BranchRow[];
  initialProductId?: string;
  movement?: StockMovementRow | null;
};

export function StockOutModal({
  isOpen,
  onClose,
  products,
  branches,
  initialProductId = "",
  movement = null,
}: Props) {
  if (!isOpen) return null;

  return (
    <StockOutModalInner
      key={movement?.id ?? initialProductId ?? "new"}
      onClose={onClose}
      products={products}
      branches={branches}
      initialProductId={initialProductId}
      movement={movement}
    />
  );
}
