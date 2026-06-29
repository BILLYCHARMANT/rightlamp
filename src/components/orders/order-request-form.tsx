"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { OrderProductVariantPicker } from "@/components/orders/order-product-variant-picker";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { formatBranchLocationOption } from "@/lib/dashboard/order-types";
import type {
  OrderableProduct,
  OrderPickupBranch,
  OrderRequestInput,
} from "@/lib/dashboard/order-types";

type LineDraft = {
  key: string;
  productId: string;
  quantity: number;
  accessoryIds: string[];
};

type Props = {
  products: OrderableProduct[];
  /** Pickup locations from active branches. */
  branches?: OrderPickupBranch[];
  defaultProductId?: string;
  /** Pre-selected branch — used for branch managers. */
  defaultBranchId?: string;
  /** When true, branch is fixed to the manager's assignment (staff only). */
  branchLocked?: boolean;
  submitLabel: string;
  variant?: "store" | "dashboard";
  onSubmit: (
    input: OrderRequestInput,
  ) => Promise<{ ok: boolean; message?: string; orderId?: string }>;
  onSuccess?: (orderId: string) => void;
};

function emptyLine(productId = ""): LineDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId,
    quantity: 1,
    accessoryIds: [],
  };
}

const fieldLabel =
  "font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500";

export const orderRequestFieldLabel = fieldLabel;

const fieldInput =
  "w-full border-0 border-b border-slate-200 bg-transparent px-0 py-2.5 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand focus:outline-none focus:ring-0";

export const orderRequestFieldInput = fieldInput;

export const orderRequestFieldBox =
  "w-full rounded-sm border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20";

export function OrderRequestSectionTitle({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-5 border-b border-slate-100 pb-3">
      <h2 className="text-sm font-semibold tracking-tight text-ink">{children}</h2>
      {hint ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function OrderRequestForm({
  products,
  branches = [],
  defaultProductId,
  defaultBranchId,
  branchLocked = false,
  submitLabel,
  variant = "store",
  onSubmit,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branchId, setBranchId] = useState(defaultBranchId ?? "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>(() => [
    emptyLine(defaultProductId ?? products[0]?.id ?? ""),
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const branchMap = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch])),
    [branches],
  );

  const effectiveBranchId =
    branchLocked && defaultBranchId ? defaultBranchId : branchId;
  const selectedBranch = effectiveBranchId
    ? branchMap.get(effectiveBranchId)
    : undefined;
  const requiresBranch =
    branches.length > 0 &&
    (variant === "store" || (variant === "dashboard" && !branchLocked));
  const branchLabel = "Location";

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const estimatedTotal = useMemo(() => {
    let total = 0;
    let currency = products[0]?.currency ?? "RWF";
    for (const line of lines) {
      const product = productMap.get(line.productId);
      if (!product) continue;
      currency = product.currency;
      const qty = Math.max(1, line.quantity);
      total += product.priceCents * qty;
      for (const accessoryId of line.accessoryIds) {
        const accessory = product.accessories.find((a) => a.id === accessoryId);
        if (accessory) total += accessory.priceCents * qty;
      }
    }
    return { total, currency };
  }, [lines, productMap, products]);

  function updateLine(key: string, patch: Partial<LineDraft>) {
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine(products[0]?.id ?? "")]);
  }

  function removeLine(key: string) {
    setLines((prev) =>
      prev.length <= 1 ? prev : prev.filter((l) => l.key !== key),
    );
  }

  function toggleAccessory(lineKey: string, accessoryId: string) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.key !== lineKey) return line;
        const has = line.accessoryIds.includes(accessoryId);
        return {
          ...line,
          accessoryIds: has
            ? line.accessoryIds.filter((id) => id !== accessoryId)
            : [...line.accessoryIds, accessoryId],
        };
      }),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const input: OrderRequestInput = {
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      branchId: effectiveBranchId || undefined,
      notes: notes || undefined,
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        accessoryIds: l.accessoryIds.length ? l.accessoryIds : undefined,
      })),
    };

    startTransition(async () => {
      const result = await onSubmit(input);
      if (!result.ok) {
        setError(result.message ?? "Could not submit order.");
        return;
      }
      setSuccess(
        result.orderId
          ? `Order ${result.orderId} received — we will contact you shortly.`
          : "Order received — we will contact you shortly.",
      );
      onSuccess?.(result.orderId ?? "");
      setName("");
      setEmail("");
      setPhone("");
      setBranchId(defaultBranchId ?? "");
      setNotes("");
      setLines([emptyLine(defaultProductId ?? products[0]?.id ?? "")]);
    });
  }

  if (products.length === 0) {
    return (
      <p className="rounded-sm border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No products are available on the shop right now. Please check back later
        or contact us directly.
      </p>
    );
  }

  if (requiresBranch && branches.length === 0) {
    return (
      <p className="rounded-sm border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No branch locations are configured yet. Add locations under Branches in the
        dashboard, or contact us directly.
      </p>
    );
  }

  const submitClass =
    variant === "dashboard"
      ? "dash-btn-primary px-8 py-2.5 text-sm font-bold disabled:opacity-60"
      : "rounded-full bg-[#c55316] px-8 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a84310] disabled:opacity-60";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {success ? (
        <p
          role="status"
          className="rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {success}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-5 lg:gap-12">
        {/* Contact — compact column */}
        <div className="lg:col-span-2">
          <OrderRequestSectionTitle hint="How we reach you about this order.">
            Contact
          </OrderRequestSectionTitle>

          <div className="space-y-5">
            <label className="block">
              <span className={fieldLabel}>Full name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Bosco"
                className={fieldInput}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="block">
                <span className={fieldLabel}>Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className={fieldInput}
                />
              </label>
              <label className="block">
                <span className={fieldLabel}>Phone</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 …"
                  className={fieldInput}
                />
              </label>
            </div>

            {branches.length > 0 ? (
              branchLocked && selectedBranch ? (
                <div className="block">
                  <span className={fieldLabel}>{branchLabel}</span>
                  <div className="mt-2 flex items-start gap-2 rounded-sm border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-brand"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {selectedBranch.location}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selectedBranch.name}
                        {selectedBranch.phone ? ` · ${selectedBranch.phone}` : ""}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        This location is set from your assigned branch.
                      </p>
                    </div>
                  </div>
                  <input type="hidden" name="branchId" value={effectiveBranchId} />
                </div>
              ) : (
                <label className="block">
                  <span className={fieldLabel}>
                    {branchLabel}{" "}
                    <span className={variant === "store" ? "text-[#c55316]" : "text-brand"}>
                      *
                    </span>
                  </span>
                  <div className="relative mt-1">
                    <MapPin
                      size={16}
                      className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden
                    />
                    <select
                      required={requiresBranch}
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      className="w-full appearance-none border-0 border-b border-slate-200 bg-transparent py-2.5 pl-6 pr-8 text-sm text-ink focus:border-brand focus:outline-none focus:ring-0"
                    >
                      <option value="" disabled>
                        Select location
                      </option>
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {formatBranchLocationOption(branch)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedBranch ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {selectedBranch.name}
                      {selectedBranch.phone ? ` · ${selectedBranch.phone}` : ""}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Pick one of our branch locations — no manual address entry.
                    </p>
                  )}
                </label>
              )
            ) : variant === "dashboard" ? (
              <p className="rounded-sm border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                No branch is assigned to your account, or your branch has no location
                set. Ask an admin to update it under Branches.
              </p>
            ) : (
              <p className="rounded-sm border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                No pickup locations are available yet. Please contact us directly.
              </p>
            )}
          </div>
        </div>

        {/* Products — main column */}
        <div className="lg:col-span-3">
          <OrderRequestSectionTitle hint="Choose from published shop items. Add more lines if needed.">
            Products
          </OrderRequestSectionTitle>

          <div className="space-y-0">
            <div className="hidden grid-cols-[1fr_4.5rem_5.5rem_2rem] gap-3 border-b border-slate-100 pb-2 sm:grid">
              <span className={fieldLabel}>Item</span>
              <span className={`${fieldLabel} text-center`}>Qty</span>
              <span className={`${fieldLabel} text-right`}>Subtotal</span>
              <span className="sr-only">Remove</span>
            </div>

            <ul className="divide-y divide-slate-100">
              {lines.map((line, index) => {
                const selected = productMap.get(line.productId);
                const qty = Math.max(1, line.quantity);
                const accessoryTotal =
                  selected?.accessories.reduce((sum, accessory) => {
                    if (!line.accessoryIds.includes(accessory.id)) return sum;
                    return sum + accessory.priceCents * qty;
                  }, 0) ?? 0;
                const subtotal = selected
                  ? selected.priceCents * qty + accessoryTotal
                  : 0;

                return (
                  <li key={line.key} className="py-4">
                    <div className="grid gap-3 sm:grid-cols-[1fr_4.5rem_5.5rem_2rem] sm:items-end">
                      <div className="block min-w-0">
                        {index === 0 ? (
                          <span className={`${fieldLabel} sm:hidden`}>Item</span>
                        ) : null}
                        <div className="mt-1 sm:mt-0">
                          <OrderProductVariantPicker
                            products={products}
                            selectedProductId={line.productId}
                            onSelect={(productId) =>
                              updateLine(line.key, {
                                productId,
                                accessoryIds: [],
                              })
                            }
                            compact={variant === "dashboard"}
                          />
                        </div>
                      </div>

                      <label className="block">
                        <span className={`${fieldLabel} sm:sr-only`}>Qty</span>
                        <input
                          type="number"
                          min={1}
                          required
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, {
                              quantity: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="mt-1 w-full rounded-sm border border-slate-200 bg-white px-2 py-2 text-center text-sm tabular-nums focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20 sm:mt-0"
                        />
                      </label>

                      <p className="pb-2 text-right text-sm font-medium tabular-nums text-ink sm:pb-2.5">
                        {selected
                          ? formatMoneyFromCents(subtotal, selected.currency)
                          : "—"}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        disabled={lines.length <= 1}
                        className="flex h-9 w-9 items-center justify-center self-end rounded-sm text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:invisible sm:self-auto"
                        aria-label="Remove line"
                      >
                        <Trash2 size={15} aria-hidden />
                      </button>
                    </div>

                    {selected && selected.accessories.length > 0 ? (
                      <div className="mt-3 rounded-sm border border-slate-100 bg-slate-50/80 px-3 py-3">
                        <p className={fieldLabel}>Accessories for this item</p>
                        <ul className="mt-2 space-y-2">
                          {selected.accessories.map((accessory) => {
                            const checked = line.accessoryIds.includes(accessory.id);
                            return (
                              <li key={accessory.id}>
                                <label className="flex cursor-pointer items-start gap-3 rounded-sm px-1 py-1 transition hover:bg-white/80">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      toggleAccessory(line.key, accessory.id)
                                    }
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand/30"
                                  />
                                  <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border border-slate-200 bg-white">
                                    {accessory.imageUrl ? (
                                      <Image
                                        src={accessory.imageUrl}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        unoptimized
                                      />
                                    ) : null}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-medium text-ink">
                                      {accessory.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {accessory.priceCents > 0
                                        ? `+ ${formatMoneyFromCents(accessory.priceCents, selected.currency)} each`
                                        : "Included"}
                                    </span>
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={addLine}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand transition hover:text-brand-hover"
            >
              <Plus size={14} aria-hidden />
              Add product
            </button>
          </div>

          <label className="mt-8 block">
            <span className={fieldLabel}>
              Notes <span className="normal-case tracking-normal text-slate-400">· optional</span>
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Timing, specs, or questions…"
              className={`${fieldInput} resize-none`}
            />
          </label>
        </div>
      </div>

      {/* Footer — total + submit */}
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={fieldLabel}>Estimated total</p>
          <p className="mt-1 font-[family-name:var(--font-hanken)] text-2xl font-bold tabular-nums tracking-tight text-ink">
            {formatMoneyFromCents(estimatedTotal.total, estimatedTotal.currency)}
          </p>
        </div>
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex shrink-0 items-center justify-center ${submitClass}`}
        >
          {pending ? "Submitting…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
