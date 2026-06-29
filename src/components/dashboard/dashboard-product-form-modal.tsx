"use client";

import { DashboardMediaImage } from "@/components/dashboard/dashboard-media-image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { UploadCloud, Plus, Trash2 } from "lucide-react";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import {
  createDashboardProduct,
  createDashboardProductVersion,
  updateDashboardProduct,
  type ProductAccessoryInput,
} from "@/lib/dashboard/product-actions";
import {
  buildProductImagePayload,
  DashboardProductGalleryFields,
  galleryStateFromProductImages,
  type GalleryViewDraft,
} from "@/components/dashboard/dashboard-product-gallery-fields";
import { normalizeAccessoryImageUrl } from "@/lib/dashboard/product-media";
import {
  extractCapacityLabel,
  variantFamilyTitle,
} from "@/lib/store/product-variants";
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

type VersionContext = {
  familyId: string;
  familyName: string;
  currency: string;
  description?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategoryOption[];
  product?: ExplorerProduct | null;
  /** Stock hub uses warehouse-focused labels and defaults. */
  mode?: "product" | "stock" | "version";
  versionContext?: VersionContext;
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
  versionContext,
}: Props) {
  const isStock = mode === "stock";
  const isVersion = mode === "version";
  const isEdit = Boolean(product) && !isVersion;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(() => product?.name ?? "");
  const [familyName, setFamilyName] = useState(
    () => product?.familyName ?? "",
  );
  const [variantLabel, setVariantLabel] = useState(
    () => product?.variantLabel ?? "",
  );
  const [slug, setSlug] = useState(() => product?.slug ?? "");
  const [category, setCategory] = useState(() => product?.category ?? "");
  const [description, setDescription] = useState(
    () => product?.description ?? versionContext?.description ?? "",
  );
  const [priceMajor, setPriceMajor] = useState(() =>
    product ? (product.priceCents / 100).toFixed(2) : "",
  );
  const [costMajor, setCostMajor] = useState(() =>
    product?.costPriceCents != null
      ? (product.costPriceCents / 100).toFixed(2)
      : "",
  );
  const [currency, setCurrency] = useState(
    () => product?.currency || versionContext?.currency || DEFAULT_CURRENCY,
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

  const initialGallery = galleryStateFromProductImages(product?.images ?? []);
  const [primaryImageUrl, setPrimaryImageUrl] = useState(
    () => initialGallery.primaryImageUrl,
  );
  const [primaryPreviewUrl, setPrimaryPreviewUrl] = useState<string | null>(
    null,
  );
  const [galleryViews, setGalleryViews] = useState<GalleryViewDraft[]>(
    () => initialGallery.views,
  );

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
    if (isVersion && !variantLabel.trim()) {
      setError("Enter a version label (e.g. 50W, 120cm).");
      return;
    }
    if (isVersion && !versionContext?.familyId) {
      setError("Product family is missing.");
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
        imageUrl: normalizeAccessoryImageUrl(row.imageUrl),
        priceCents: Math.round((accessoryPriceParsed || 0) * 100),
      });
    }

    const imagePayload = buildProductImagePayload(
      primaryImageUrl,
      galleryViews,
      primaryPreviewUrl,
    );

    startTransition(async () => {
      try {
      if (isVersion && versionContext) {
        const result = await createDashboardProductVersion({
          familyId: versionContext.familyId,
          variantLabel: variantLabel.trim(),
          priceCents,
          costPriceCents,
          currency,
          stock: stockQty,
          published,
          description: description.trim() || versionContext.description || null,
          accessories: accessoryPayload,
          images: imagePayload,
        });
        if (!result.ok) {
          setError(result.message);
          return;
        }
        onClose();
        if (result.id) {
          router.push(`/dashboard/products/${result.id}`);
        } else {
          router.refresh();
        }
        return;
      }

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
        familyName: familyName.trim() || undefined,
        variantLabel: variantLabel.trim() || undefined,
        variantLabelOnUpdate: variantLabel.trim() || undefined,
        images: imagePayload,
      };

      const res = isEdit
        ? await updateDashboardProduct({
            id: product!.id,
            name: payload.name,
            slug: payload.slug,
            category: payload.category,
            description: payload.description,
            priceCents: payload.priceCents,
            costPriceCents: payload.costPriceCents,
            currency: payload.currency,
            stock: payload.stock,
            published: payload.published,
            accessories: payload.accessories,
            categoryRequired: payload.categoryRequired,
            variantLabel: payload.variantLabelOnUpdate,
            images: payload.images,
          })
        : await createDashboardProduct(payload);

      if (!res.ok) {
        setError(res.message);
        return;
      }
      onClose();
      if (!isEdit && !isStock && res.id) {
        router.push(`/dashboard/products/${res.id}`);
        return;
      }
      router.refresh();
      } catch (cause) {
        const msg =
          cause instanceof Error
            ? cause.message
            : "Could not save the product. Please try again.";
        setError(msg);
      }
    });
  };

  const modalTitle = isVersion
    ? "Add product version"
    : isEdit
    ? isStock
      ? "Edit item"
      : "Edit Product"
    : isStock
      ? "Create item"
      : "Add New Product";

  const submitLabel = pending
    ? "Saving…"
    : isVersion
      ? "Create version"
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
      maxWidthClass={isVersion ? "max-w-2xl" : "max-w-2xl"}
      footer={
        <div className="flex w-full flex-col gap-3">
          {error ? (
            <p
              className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <div className="flex gap-3">
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
          </div>
        </div>
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

        {isVersion && versionContext ? (
          <p className="rounded-xl border border-border bg-surface/80 px-4 py-3 text-sm text-muted-foreground">
            New capacity/size under{" "}
            <strong className="text-ink">{versionContext.familyName}</strong>.
            Each version can have its own images and accessories.
          </p>
        ) : null}

        <DashboardProductGalleryFields
          primaryImageUrl={primaryImageUrl}
          onPrimaryImageUrlChange={setPrimaryImageUrl}
          primaryPreviewUrl={primaryPreviewUrl}
          onPrimaryPreviewChange={setPrimaryPreviewUrl}
          views={galleryViews}
          onViewsChange={setGalleryViews}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!isVersion ? (
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-ink">
              {isStock ? "Item name" : "Product name"}
            </label>
            <input
              required
              value={name}
              onChange={(e) => {
                const next = e.target.value;
                setName(next);
                if (!isEdit && !familyName.trim()) {
                  setFamilyName(variantFamilyTitle(next));
                }
                if (!variantLabel.trim()) {
                  setVariantLabel(extractCapacityLabel(next));
                }
              }}
              placeholder="Enter product name"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          ) : (
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-ink">
                Version label (capacity / size)
              </label>
              <input
                required
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                placeholder="e.g. 100W, 2.1 Quarts"
                className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          )}
          {!isStock && !isVersion ? (
            <>
              <div>
                <label className="text-sm font-semibold text-ink">
                  Product line / family
                </label>
                <input
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  disabled={isEdit}
                  placeholder="e.g. Outdoor Flood LED"
                  className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:bg-slate-50 disabled:text-slate-500"
                />
                {isEdit ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add more sizes from the product detail page.
                  </p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-ink">
                  Version label (capacity / size)
                </label>
                <input
                  value={variantLabel}
                  onChange={(e) => setVariantLabel(e.target.value)}
                  placeholder="e.g. 50W, 120cm"
                  className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </>
          ) : null}
          {!isVersion ? (
          <div>
            <label className="text-sm font-semibold text-ink">URL slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated if empty"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
          ) : null}
          {!isVersion ? (
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
          ) : null}
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
                this product. Upload an image or paste an HTTPS URL.
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
                        <DashboardMediaImage src={row.imageUrl} alt="" fill />
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
