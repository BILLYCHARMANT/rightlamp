export type ProductImageInput = {
  url: string;
  label?: string | null;
};

/** Base64 file picks from the dashboard — keep under server action body limit. */
export const MAX_PRODUCT_IMAGE_LENGTH = 6_000_000;

/** @deprecated Use MAX_PRODUCT_IMAGE_LENGTH */
export const MAX_PRODUCT_IMAGE_URL = MAX_PRODUCT_IMAGE_LENGTH;

/** Base64 file picks from the dashboard — keep under server action body limit. */
export const MAX_ACCESSORY_IMAGE_LENGTH = 6_000_000;

export function normalizeProductImageUrl(
  imageUrl: string | null | undefined,
): string | null {
  const trimmed = imageUrl?.trim() || null;
  if (!trimmed) return null;
  if (trimmed.length > MAX_PRODUCT_IMAGE_LENGTH) return null;
  return trimmed;
}

export function normalizeAccessoryImageUrl(
  imageUrl: string | null | undefined,
): string | null {
  const trimmed = imageUrl?.trim() || null;
  if (!trimmed) return null;
  if (trimmed.length > MAX_ACCESSORY_IMAGE_LENGTH) return null;
  return trimmed;
}

export function normalizeProductImages(
  images: ProductImageInput[] | undefined,
): ProductImageInput[] {
  if (!images?.length) return [];
  const normalized: ProductImageInput[] = [];
  const seen = new Set<string>();

  for (const image of images) {
    const url = normalizeProductImageUrl(image.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    normalized.push({
      url,
      label: image.label?.trim() || null,
    });
  }

  return normalized;
}
