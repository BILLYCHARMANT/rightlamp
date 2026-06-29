"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { OrderRequestDetailsStep } from "@/components/orders/order-request-details-step";
import {
  OrderRequestSectionTitle,
  orderRequestFieldLabel,
} from "@/components/orders/order-request-form";
import { OrderProductVariantPicker } from "@/components/orders/order-product-variant-picker";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import type {
  OrderableProduct,
  OrderPickupBranch,
  OrderRequestInput,
} from "@/lib/dashboard/order-types";
import {
  emptyOrderRequestDetails,
  validateOrderRequestDetails,
  type OrderRequestDetails,
} from "@/lib/orders/order-request-details";
import { submitOrderRequest } from "@/lib/dashboard/order-actions";

type LineDraft = {
  key: string;
  productId: string;
  quantity: number;
  accessoryIds: string[];
};

type Props = {
  products: OrderableProduct[];
  branches?: OrderPickupBranch[];
  defaultProductId?: string;
  compactHeader?: boolean;
};

function emptyLine(productId = ""): LineDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId,
    quantity: 1,
    accessoryIds: [],
  };
}

export function ProductOrderRequestWizard({
  products,
  branches = [],
  defaultProductId,
  compactHeader = false,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [lines, setLines] = useState<LineDraft[]>(() => [
    emptyLine(defaultProductId ?? products[0]?.id ?? ""),
  ]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [branchId, setBranchId] = useState(() => branches[0]?.id ?? "");
  const [details, setDetails] = useState<OrderRequestDetails>(() =>
    emptyOrderRequestDetails(),
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );

  const requiresBranch = branches.length > 0;

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
        const accessory = product.accessories.find((item) => item.id === accessoryId);
        if (accessory) total += accessory.priceCents * qty;
      }
    }
    return { total, currency };
  }, [lines, productMap, products]);

  const categoryHint = useMemo(() => {
    const categories = new Set<string>();
    for (const line of lines) {
      const product = productMap.get(line.productId);
      // category not on OrderableProduct - skip
      void product;
    }
    return [...categories].join(", ");
  }, [lines, productMap]);

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
      prev.length <= 1 ? prev : prev.filter((line) => line.key !== key),
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

  function goToDetails() {
    setError(null);
    if (!lines.every((line) => line.productId)) {
      setError("Select a product for each line.");
      return;
    }
    if (requiresBranch && !branchId) {
      // branch picked in step 2
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToFeedback() {
    document
      .getElementById("order-request-feedback")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!lines.every((line) => line.productId)) {
      setError("Select a product for each line.");
      scrollToFeedback();
      return;
    }

    const detailsError = validateOrderRequestDetails(details);
    if (detailsError) {
      setError(detailsError);
      scrollToFeedback();
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail.includes("@")) {
      setError("A valid email address is required.");
      scrollToFeedback();
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone.length < 6) {
      setError("Phone number is required.");
      scrollToFeedback();
      return;
    }

    if (requiresBranch && !branchId) {
      setError("Select your nearest branch or pickup location.");
      scrollToFeedback();
      return;
    }

    const input: OrderRequestInput = {
      customerName: details.fullName ?? details.contactPerson ?? "",
      customerEmail: trimmedEmail,
      customerPhone: trimmedPhone,
      branchId: branchId || undefined,
      requestDetails: details,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        accessoryIds: line.accessoryIds.length ? line.accessoryIds : undefined,
      })),
    };

    startTransition(async () => {
      try {
        const result = await submitOrderRequest(input);
        if (!result.ok) {
          setError(result.message ?? "Could not submit order.");
          scrollToFeedback();
          return;
        }
        setSuccess(
          result.orderId
            ? `Order ${result.orderId} received. Our team will contact you shortly.`
            : "Order received. Our team will contact you shortly.",
        );
        scrollToFeedback();
        setStep(1);
        setLines([emptyLine(products[0]?.id ?? "")]);
        setEmail("");
        setPhone("");
        setBranchId(branches[0]?.id ?? "");
        setDetails(emptyOrderRequestDetails());
      } catch {
        setError(
          "Something went wrong while submitting. Please try again or contact us directly.",
        );
        scrollToFeedback();
      }
    });
  }

  if (products.length === 0) {
    return (
      <p className="rounded-sm border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No products are available right now. Please check back later or contact us
        directly.
      </p>
    );
  }

  return (
    <div>
      {!compactHeader ? (
        <header className="mb-8 max-w-2xl">
          <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-[0.2em] text-[#c55316]">
            Product order request
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-hanken)] text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Request a quote or place an order
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Step 1 — choose products. Step 2 — complete the official order request
            form with delivery, payment, and declaration details.
          </p>
        </header>
      ) : null}

      <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm font-medium">
        <li
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
            step === 1 ? "bg-[#c55316] text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          <span className="font-mono text-xs">1</span> Products
        </li>
        <ArrowRight size={14} className="text-slate-400" aria-hidden />
        <li
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${
            step === 2 ? "bg-[#c55316] text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          <span className="font-mono text-xs">2</span> Order request form
        </li>
      </ol>

      <div id="order-request-feedback">
        {success ? (
          <p
            role="status"
            className="mb-6 flex items-start gap-2 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden />
            {success}
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mb-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
      </div>

      {step === 1 ? (
        <div className="space-y-8">
          <OrderRequestSectionTitle hint="Add every product you need. You will complete the full request form next.">
            Products requested
          </OrderRequestSectionTitle>

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
                      <span className={`${orderRequestFieldLabel} sm:hidden`}>
                        Product
                      </span>
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
                        />
                      </div>
                    </div>
                    <label className="block">
                      <span className={`${orderRequestFieldLabel} sm:sr-only`}>Qty</span>
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
                        className="mt-1 w-full rounded-sm border border-slate-200 px-2 py-2 text-center text-sm tabular-nums sm:mt-0"
                      />
                    </label>
                    <p className="pb-2 text-right text-sm font-medium tabular-nums sm:pb-2.5">
                      {selected
                        ? formatMoneyFromCents(subtotal, selected.currency)
                        : "—"}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      disabled={lines.length <= 1}
                      className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-red-500 disabled:invisible"
                      aria-label={`Remove product line ${index + 1}`}
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>

                  {selected && selected.accessories.length > 0 ? (
                    <div className="mt-3 rounded-sm border border-slate-100 bg-slate-50/80 px-3 py-3">
                      <p className={orderRequestFieldLabel}>Accessories</p>
                      <ul className="mt-2 space-y-2">
                        {selected.accessories.map((accessory) => {
                          const checked = line.accessoryIds.includes(accessory.id);
                          return (
                            <li key={accessory.id}>
                              <label className="flex cursor-pointer items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleAccessory(line.key, accessory.id)
                                  }
                                  className="mt-1 h-4 w-4"
                                />
                                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm border bg-white">
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
                                <span className="min-w-0 flex-1 text-sm">
                                  <span className="font-medium">{accessory.name}</span>
                                  <span className="block text-xs text-muted-foreground">
                                    {accessory.priceCents > 0
                                      ? `+ ${formatMoneyFromCents(accessory.priceCents, selected.currency)}`
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
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#c55316]"
          >
            <Plus size={14} aria-hidden />
            Add another product
          </button>

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className={orderRequestFieldLabel}>Estimated total</p>
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {formatMoneyFromCents(estimatedTotal.total, estimatedTotal.currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={goToDetails}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c55316] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a84310]"
            >
              Continue to order form
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#c55316]"
          >
            <ArrowLeft size={16} aria-hidden />
            Back to products
          </button>

          <OrderRequestDetailsStep
            details={details}
            onChange={(patch) => setDetails((prev) => ({ ...prev, ...patch }))}
            email={email}
            phone={phone}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
            branchId={branchId}
            onBranchChange={setBranchId}
            branches={branches}
            requiresBranch={requiresBranch}
            productCategoryHint={categoryHint || undefined}
          />

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Estimated total:{" "}
              <span className="font-bold text-ink">
                {formatMoneyFromCents(estimatedTotal.total, estimatedTotal.currency)}
              </span>
            </p>
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {error ? (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center rounded-full bg-[#c55316] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a84310] disabled:opacity-60"
              >
                {pending ? "Submitting…" : "Submit order request"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
