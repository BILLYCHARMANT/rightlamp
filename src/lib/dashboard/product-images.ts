/** Curated thumbnails for seeded / catalog slugs (lighting product photography). */
import { BRAND_LOGO } from "@/lib/company/brand-assets";

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  "river-20w-led-panel":
    "https://images.unsplash.com/photo-1524484485831-a97fb0a4b104?w=240&h=240&fit=crop",
  "gu10-warm-white-6":
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=240&h=240&fit=crop",
  "outdoor-flood-50w":
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=240&h=240&fit=crop",
  "t8-led-tube-120":
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=240&h=240&fit=crop",
  "smart-bulb-starter":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&h=240&fit=crop",
  "ceiling-panel-600":
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=240&h=240&fit=crop",
};

const CATEGORY_FALLBACK: Record<string, string> = {
  Indoor:
    "https://images.unsplash.com/photo-1524484485831-a97fb0a4b104?w=240&h=240&fit=crop",
  Bulbs:
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=240&h=240&fit=crop",
  Outdoor:
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=240&h=240&fit=crop",
  Tubes:
    "https://images.unsplash.com/photo-1565008576549-57569a49371d?w=240&h=240&fit=crop",
  Smart:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=240&h=240&fit=crop",
};

export function getProductImageUrl(
  slug: string,
  category?: string | null,
): string {
  const bySlug = PRODUCT_IMAGE_BY_SLUG[slug];
  if (bySlug) return bySlug;

  const cat = (category ?? "").trim();
  if (cat && CATEGORY_FALLBACK[cat]) return CATEGORY_FALLBACK[cat]!;

  return BRAND_LOGO;
}

export function resolveProductImageUrl(
  images: { url: string }[] | undefined,
  slug: string,
  category?: string | null,
): string {
  const stored = images?.find((image) => image.url.trim())?.url.trim();
  if (stored) return stored;
  return getProductImageUrl(slug, category);
}
