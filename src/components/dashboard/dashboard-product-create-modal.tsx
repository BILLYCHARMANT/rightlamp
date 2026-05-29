"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { UploadCloud } from "lucide-react";
import { createDashboardProduct } from "@/lib/dashboard/product-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";

const CATEGORY_DATALIST_ID = "rightlamps-product-category-suggestions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categorySuggestions: string[];
};

/**
 * Create-product flow — same interaction model as Pod Café `ProductModal`
 * (overlay + brand header + scroll form + footer Cancel / primary).
 */
export function DashboardProductCreateModal({
  isOpen,
  onClose,
  categorySuggestions,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priceMajor, setPriceMajor] = useState("");
  const currency = "TZS";
  const [initialStock, setInitialStock] = useState("0");
  const [inStock, setInStock] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imagePreview = uploadedPreview;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setUploadedPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) {
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
    let stock = Math.max(0, Math.floor(Number.parseInt(initialStock, 10) || 0));
    if (inStock && stock < 1) stock = 1;
    if (!inStock) stock = Math.min(stock, 0);

    const priceCents = Math.round(major * 100);

    startTransition(async () => {
      const res = await createDashboardProduct({
        name,
        category: category.trim() || null,
        description: description.trim() || null,
        priceCents,
        currency,
        stock,
        published: inStock,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      void selectedFile;
      onClose();
      router.refresh();
    });
  };

  return (
    <PodShellModal
      isOpen={isOpen}
      title="Add New Product"
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
            form="dashboard-product-create-form"
            disabled={pending}
            className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-50"
          >
            {pending ? "Saving…" : "Create Product"}
          </button>
        </>
      }
    >
      <form
        id="dashboard-product-create-form"
        onSubmit={onFormSubmit}
        className="space-y-6"
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
            {imagePreview ? (
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
                <Image
                  src={imagePreview}
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
              onDrop={handleDrop}
              onDragOver={(ev) => ev.preventDefault()}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface/80 transition-colors hover:bg-surface ${
                !imagePreview ? "min-h-[8rem]" : ""
              }`}
            >
              <UploadCloud className="h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="px-4 text-center text-sm text-ink">
                Drag and drop or{" "}
                <span className="font-medium text-brand">browse</span>
              </p>
              <p className="px-4 text-center text-xs text-muted-foreground">
                Preview only here — SKU image on the storefront can be wired when
                media upload is connected.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink">Product name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter product name"
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-ink">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter product description"
            rows={4}
            className="mt-2 w-full resize-y rounded-md border border-border bg-surface p-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-ink">
              Price ({currency})
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                {currency}
              </span>
              <input
                required
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                value={priceMajor}
                onChange={(e) => setPriceMajor(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-surface py-2.5 pl-14 pr-3 text-sm tabular-nums text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-ink">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list={CATEGORY_DATALIST_ID}
              placeholder="Select or type"
              className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <datalist id={CATEGORY_DATALIST_ID}>
              {categorySuggestions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-ink">
            Initial shelf quantity
          </label>
          <input
            type="number"
            min={0}
            step={1}
            value={initialStock}
            onChange={(e) => setInitialStock(e.target.value)}
            className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>

        <p className="rounded-md border border-border bg-surface/80 p-3 text-xs text-muted-foreground">
          Stock movements (receipts, waste, adjustments) are recorded on the{" "}
          <span className="font-medium text-ink">Stock</span> hub — same ledger
          idea as Pod Café, scoped to Rightlamps SKUs.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <label className="inline-flex cursor-pointer items-center gap-3">
            <span className="relative inline-flex h-6 w-11 shrink-0">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="peer sr-only"
              />
              <span className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-brand peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand" />
              <span className="pointer-events-none absolute left-[2px] top-[2px] h-5 w-5 rounded-full border border-border bg-surface-elevated shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:border-white" />
            </span>
            <span className="text-sm font-medium text-ink">In stock</span>
          </label>
        </div>
      </form>
    </PodShellModal>
  );
}
