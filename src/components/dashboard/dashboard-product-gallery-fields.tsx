"use client";

import { Plus, Trash2, UploadCloud } from "lucide-react";
import { DashboardMediaImage } from "@/components/dashboard/dashboard-media-image";
import { normalizeProductImageUrl } from "@/lib/dashboard/product-media";

export type GalleryViewDraft = {
  key: string;
  label: string;
  imageUrl: string;
};

export function emptyGalleryView(): GalleryViewDraft {
  return {
    key: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    imageUrl: "",
  };
}

function imagePreviewSrc(url: string): string | null {
  const trimmed = url.trim();
  return trimmed || null;
}

type Props = {
  primaryImageUrl: string;
  onPrimaryImageUrlChange: (value: string) => void;
  primaryPreviewUrl?: string | null;
  onPrimaryPreviewChange?: (preview: string | null) => void;
  views: GalleryViewDraft[];
  onViewsChange: (views: GalleryViewDraft[]) => void;
  loading?: boolean;
};

export function DashboardProductGalleryFields({
  primaryImageUrl,
  onPrimaryImageUrlChange,
  primaryPreviewUrl,
  onPrimaryPreviewChange,
  views,
  onViewsChange,
  loading = false,
}: Props) {
  const primaryDisplay =
    imagePreviewSrc(primaryPreviewUrl ?? "") ||
    imagePreviewSrc(primaryImageUrl) ||
    null;
  const hasSavedViews = views.some((view) => imagePreviewSrc(view.imageUrl));

  return (
    <div className="space-y-5">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading saved images…</p>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">
          Main product image
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          Upload a file or paste an HTTPS URL. Saved images show in the preview
          when you edit.
        </p>
        <div className="flex items-stretch gap-4">
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-border bg-surface">
            {primaryDisplay ? (
              <DashboardMediaImage src={primaryDisplay} alt="" fill />
            ) : (
              <span className="flex h-full w-full items-center justify-center px-2 text-center text-[10px] text-muted-foreground">
                No image yet
              </span>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface/80 px-4 py-4 transition-colors hover:bg-surface">
              <UploadCloud className="h-5 w-5 text-muted-foreground" aria-hidden />
              <span className="text-xs text-muted-foreground">Upload image</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    onPrimaryPreviewChange?.(result);
                    onPrimaryImageUrlChange(result);
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <input
              value={primaryImageUrl.startsWith("data:") ? "" : primaryImageUrl}
              onChange={(e) => {
                onPrimaryImageUrlChange(e.target.value);
                onPrimaryPreviewChange?.(null);
              }}
              placeholder="https://your-cdn.com/product-front.jpg"
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            {primaryImageUrl.startsWith("data:") ? (
              <p className="text-xs text-emerald-700">Uploaded image ready to save.</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Additional views</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Side angles, packaging, installation, or detail shots for the shop
              gallery.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onViewsChange([...views, emptyGalleryView()])}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-muted/40"
          >
            <Plus size={14} aria-hidden />
            Add view
          </button>
        </div>

        {hasSavedViews ? (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {views.map((view, index) => {
              const src = imagePreviewSrc(view.imageUrl);
              if (!src) return null;
              return (
                <div
                  key={`thumb-${view.key}`}
                  className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50"
                  title={view.label || `View ${index + 1}`}
                >
                  <DashboardMediaImage src={src} alt={view.label} fill />
                </div>
              );
            })}
          </div>
        ) : null}

        {views.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No extra views yet. Add alternate angles shoppers can browse on the
            product page.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {views.map((view, index) => {
              const preview = imagePreviewSrc(view.imageUrl);
              return (
                <li
                  key={view.key}
                  className="rounded-lg border border-border bg-surface p-3"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      View {index + 1}
                      {view.label.trim() ? ` · ${view.label.trim()}` : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onViewsChange(views.filter((item) => item.key !== view.key))
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-red-50 hover:text-red-500"
                      aria-label={`Remove view ${index + 1}`}
                    >
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr]">
                    <div className="relative h-[4.5rem] w-[4.5rem] overflow-hidden rounded-md border border-dashed border-border bg-muted/20">
                      {preview ? (
                        <DashboardMediaImage src={preview} alt="" fill />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                          Preview
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        value={view.label}
                        onChange={(e) =>
                          onViewsChange(
                            views.map((item) =>
                              item.key === view.key
                                ? { ...item, label: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Label — e.g. Side view, In box"
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                      <input
                        value={
                          view.imageUrl.startsWith("data:") ? "" : view.imageUrl
                        }
                        onChange={(e) =>
                          onViewsChange(
                            views.map((item) =>
                              item.key === view.key
                                ? { ...item, imageUrl: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="Image URL or use upload below"
                        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                      />
                      <label className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-ink">
                        <UploadCloud size={13} aria-hidden />
                        Upload image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onloadend = () =>
                              onViewsChange(
                                views.map((item) =>
                                  item.key === view.key
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
                      {view.imageUrl.startsWith("data:") ? (
                        <p className="text-xs text-emerald-700">
                          Uploaded image ready to save.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function buildProductImagePayload(
  primaryImageUrl: string,
  views: GalleryViewDraft[],
  primaryPreviewUrl?: string | null,
): { url: string; label?: string | null }[] {
  const images: { url: string; label?: string | null }[] = [];
  const primaryCandidate =
    primaryImageUrl.trim() || primaryPreviewUrl?.trim() || "";
  const primary = normalizeProductImageUrl(primaryCandidate);
  if (primary) {
    images.push({ url: primary, label: "Product view" });
  }
  for (const view of views) {
    const url = normalizeProductImageUrl(view.imageUrl);
    if (!url) continue;
    images.push({ url, label: view.label.trim() || null });
  }
  return images;
}

export function galleryStateFromProductImages(
  images: { id?: string; url: string; label: string | null; sortOrder: number }[],
): { primaryImageUrl: string; views: GalleryViewDraft[] } {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primary = sorted[0];
  return {
    primaryImageUrl: primary?.url ?? "",
    views: sorted.slice(1).map((image, index) => ({
      key: `view-${image.id ?? index}-${image.sortOrder}`,
      label: image.label ?? "",
      imageUrl: image.url,
    })),
  };
}

export function applyGalleryState(
  images: { url: string; label: string | null; sortOrder: number; id?: string }[],
): {
  primaryImageUrl: string;
  primaryPreviewUrl: string | null;
  views: GalleryViewDraft[];
} {
  const gallery = galleryStateFromProductImages(images);
  return {
    primaryImageUrl: gallery.primaryImageUrl,
    primaryPreviewUrl: null,
    views: gallery.views,
  };
}
