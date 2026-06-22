"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { UploadCloud, Plus, Trash2 } from "lucide-react";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import {
  createDashboardProduct,
  updateDashboardProduct,
  type ProductAccessoryInput,
} from "@/lib/dashboard/product-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";

export type ProductCategoryOption = {
  id: string;
  name: string;
};

type AccessoryDraft = {
  key: string;
  name: string;
  imageUrl: string;
  priceMajor: string;
};

function emptyAccessory(): AccessoryDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    imageUrl: "",
    priceMajor: "",
  };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategoryOption[];
  product?: ExplorerProduct | null;
  /** Stock hub uses warehouse-focused labels and defaults. */
  mode?: "product" | "stock";
};

export function DashboardProductFormModal(props: Props) {
  if (!props.isOpen) return null;

  return (
    <DashboardProductFormModalInner
      key={props.product?.id ?? "create"}
      {...props}
    />
  );
}

function DashboardProductFormModalInner({
  onClose,
  categories,
  product = null,
  mode = "product",
}: Props) {
  const isStock = mode === "stock";
  const isEdit = Boolean(product);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(() => product?.name ?? "");
  const [slug, setSlug] = useState(() => product?.slug ?? "");
  const [category, setCategory] = useState(() => product?.category ?? "");
  const [description, setDescription] = useState(() => product?.description ?? "");
  const [priceMajor, setPriceMajor] = useState(() =>
    product ? (product.priceCents / 100).toFixed(2) : "",
  );
  const [costMajor, setCostMajor] = useState(() =>
    product?.costPriceCents != null
      ? (product.costPriceCents / 100).toFixed(2)
      : "",
  );
  const [currency, setCurrency] = useState(
    () => product?.currency || DEFAULT_CURRENCY,
  );
  const [stock, setStock] = useState(() => String(product?.stock ?? 0));
  const [published, setPublished] = useState(() => product?.published ?? false);
  const [accessories, setAccessories] = useState<AccessoryDraft[]>(() =>
    product
      ? product.accessories.map((a) => ({
          key: a.id,
          name: a.name,
          imageUrl: a.imageUrl ?? "",
          priceMajor:
            a.priceCents > 0 ? (a.priceCents / 100).toFixed(2) : "",
        }))
      : [],
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadedPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const major = Number.parseFloat(priceMajor);
    if (!Number.isFinite(major) || major < 0) {
      setError("Enter a valid price (0 or greater).");
      return;
    }
    if (isStock && !category.trim()) {
      setError("Select a category.");
      return;
    }
    if (isStock && categories.length === 0) {
      setError("Create a category first.");
      return;
    }
    const costParsed = costMajor.trim()
      ? Number.parseFloat(costMajor)
      : null;
    if (
      costParsed != null &&
      (!Number.isFinite(costParsed) || costParsed < 0)
    ) {
      setError("Enter a valid purchase price or leave it empty.");
      return;
    }
    const stockQty = isStock
      ? 0
      : Math.max(0, Math.floor(Number.parseInt(stock, 10) || 0));
    const priceCents = Math.round(major * 100);
    const costPriceCents =
      costParsed != null ? Math.round(costParsed * 100) : null;

    const accessoryPayload: ProductAccessoryInput[] = [];
    for (const row of accessories) {
      const accessoryName = row.name.trim();
      if (!accessoryName) continue;

      const accessoryPriceParsed = row.priceMajor.trim()
        ? Number.parseFloat(row.priceMajor)
        : 0;
      if (
        row.priceMajor.trim() &&
        (!Number.isFinite(accessoryPriceParsed) || accessoryPriceParsed < 0)
      ) {
        setError("Enter valid accessory prices or leave them empty.");
        return;
      }

      accessoryPayload.push({
        name: accessoryName,
        imageUrl: row.imageUrl.trim() || null,
        priceCents: Math.round((accessoryPriceParsed || 0) * 100),
      });
    }

    startTransition(async () => {
      const payload = {
        name,
        slug: slug.trim() || undefined,
        category: category.trim() || null,
        description: description.trim() || null,
        priceCents,
        costPriceCents,
        currency,
        stock: stockQty,
        published: isStock ? false : published,
        accessories: accessoryPayload,
        categoryRequired: isStock,
      };

      const res = isEdit
        ? await updateDashboardProduct({ id: product!.id, ...payload })
        : await createDashboardProduct(payload);

      if (!res.ok) {
        setError(res.message);
        return;
      }
      void selectedFile;
      onClose();
      router.refresh();
    });
  };

  const modalTitle = isEdit
    ? isStock
      ? "Edit item"
      : "Edit Product"
    : isStock
      ? "Create item"
      : "Add New Product";

  const submitLabel = pending
    ? "Saving…"
    : isEdit
      ? "Save Changes"
      : isStock
        ? "Create item"
        : "Create Product";

  return (
    <PodShellModal
      isOpen
      title={modalTitle}
      onClose={() => !pending && onClose()}
      footer={
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => !pending && onClose()}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-muted/40 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="dashboard-product-form"
            disabled={pending}
            className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </>
      }
    >
      <form
        id="dashboard-product-form"
        onSubmit={onFormSubmit}
        className="space-y-5"
      >
        {error ? (
          <p
            className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">
            Product image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="sr-only"
          />
          <div className="flex items-stretch gap-4">
            {uploadedPreview ? (
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
                <Image
                  src={uploadedPreview}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  ev.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(ev) => ev.preventDefault()}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface/80 transition-colors hover:bg-surface ${
                !uploadedPreview ? "min-h-[7rem]" : ""
              }`}
            >
              <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="px-4 text-center text-sm text-ink">
                Drag and drop or{" "}
                <span className="font-medium text-brand">browse</span>
              </p>
              <p className="px-4 text-center text-xs text-muted-foreground">
                Image preview only — storefront media upload can be wired later.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-ink">
              {isStock ? "Item name" : "Product name"}
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">URL slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if empty"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Category</label>
            <select
              required={isStock}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">
                {categories.length === 0
                  ? "Create a category first"
                  : "Select category"}
              </option>
              {categories.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            rows={3}
            className="mt-2 w-full resize-y rounded-md border border-border bg-surface p-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-sm font-semibold text-ink">Retail price</label>
            <input
              required
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={priceMajor}
              onChange={(e) => setPriceMajor(e.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm tabular-nums text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Purchase price</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={costMajor}
              onChange={(e) => setCostMajor(e.target.value)}
              placeholder="Optional"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm tabular-nums text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Currency</label>
            <input
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm uppercase text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        {!isStock ? (
          <div>
            <label className="text-sm font-semibold text-ink">Shelf quantity</label>
            <input
              type="number"
              min={0}
              step={1}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="mt-2 w-full max-w-xs rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              For stock receipts and adjustments, use the Stock hub ledger.
            </p>
          </div>
        ) : null}

        <div className="rounded-xl border border-border bg-surface/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Related accessories</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bulbs, dimmers, mounts, and other items buyers can add when ordering
                this product.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setAccessories((prev) => [...prev, emptyAccessory()])
              }
              className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-muted/40"
            >
              <Plus size={14} aria-hidden />
              Add accessory
            </button>
          </div>

          {accessories.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No accessories yet. Add items that ship with or complement this product.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {accessories.map((row, index) => (
                <li
                  key={row.key}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Accessory {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setAccessories((prev) =>
                          prev.filter((item) => item.key !== row.key),
                        )
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove accessory ${index + 1}`}
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
                    <label className="relative block h-[4.5rem] w-[4.5rem] cursor-pointer overflow-hidden rounded-md border border-dashed border-border bg-muted/20 transition hover:border-brand/40">
                      {row.imageUrl ? (
                        <Image
                          src={row.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground">
                          <UploadCloud size={16} aria-hidden />
                          Image
                        </span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () =>
                            setAccessories((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? {
                                      ...item,
                                      imageUrl: reader.result as string,
                                    }
                                  : item,
                              ),
                            );
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-ink">
                          Name
                        </label>
                        <input
                          value={row.name}
                          onChange={(e) =>
                            setAccessories((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, name: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="e.g. E27 LED bulb"
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ink">
                          Add-on price
                        </label>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min={0}
                          value={row.priceMajor}
                          onChange={(e) =>
                            setAccessories((prev) =>
                              prev.map((item) =>
                                item.key === row.key
                                  ? { ...item, priceMajor: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          placeholder="0 = included"
                          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm tabular-nums text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isStock ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface/80 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Publish to storefront</p>
              <p className="text-xs text-muted-foreground">
                {published
                  ? "Product is live and visible to shoppers."
                  : "Product is saved as a draft (hidden on shop)."}
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center">
              <span className="relative inline-flex h-6 w-11 shrink-0">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-success peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand" />
                <span className="pointer-events-none absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-border bg-surface-elevated shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:border-white" />
              </span>
            </label>
          </div>
        ) : null}
      </form>
    </PodShellModal>
  );
}
