import { stitchImages } from "@/lib/company/site-content";
import { getProductImageUrl } from "@/lib/dashboard/product-images";

export type ProductGalleryImage = {
  id: string;
  url: string;
  label: string;
};

function hiRes(url: string): string {
  if (url.startsWith("/")) return url;
  if (url.includes("unsplash.com") && !url.includes("w=")) {
    return `${url}${url.includes("?") ? "&" : "?"}w=900&h=900&fit=crop`;
  }
  if (url.includes("w=240")) {
    return url.replace("w=240&h=240", "w=900&h=900");
  }
  return url;
}

const SLUG_GALLERY_EXTRAS: Record<string, ProductGalleryImage[]> = {
  "river-20w-led-panel": [
    { id: "install", url: stitchImages.installation, label: "Installation" },
    { id: "indoor", url: stitchImages.portfolioResidential, label: "Indoor use" },
  ],
  "outdoor-flood-50w": [
    { id: "field", url: stitchImages.portfolioFieldwork, label: "Outdoor field" },
    { id: "install", url: stitchImages.installation, label: "Installation" },
  ],
  "smart-bulb-starter": [
    { id: "smart", url: stitchImages.portfolioSmartGrid, label: "Smart control" },
    { id: "retail", url: stitchImages.retail, label: "Retail display" },
  ],
  "t8-led-tube-120": [
    { id: "mfg", url: stitchImages.manufacture, label: "Manufacturing" },
    { id: "maint", url: stitchImages.maintenance, label: "Maintenance" },
  ],
  "gu10-warm-white-6": [
    { id: "retail", url: stitchImages.retail, label: "Packaging" },
    { id: "corp", url: stitchImages.portfolioCorporate, label: "Commercial fit-out" },
  ],
};

const CATEGORY_GALLERY_EXTRAS: Record<string, ProductGalleryImage[]> = {
  Indoor: [
    { id: "res", url: stitchImages.portfolioResidential, label: "Residential" },
    { id: "install", url: stitchImages.installation, label: "Installation" },
  ],
  Outdoor: [
    { id: "field", url: stitchImages.portfolioFieldwork, label: "Field deployment" },
    { id: "install", url: stitchImages.installation, label: "Installation" },
  ],
  Smart: [
    { id: "grid", url: stitchImages.portfolioSmartGrid, label: "Smart grid" },
    { id: "lab", url: stitchImages.portfolioRenewableLab, label: "Lab tested" },
  ],
  Solar: [
    { id: "featured", url: stitchImages.portfolioFeatured, label: "Solar array" },
    { id: "trust", url: stitchImages.portfolioTrust, label: "Engineer verified" },
  ],
};

export function buildProductGallery(
  slug: string,
  category: string | null | undefined,
  accessoryImages: { url: string; name: string }[],
  storedImages: { url: string; label: string | null }[] = [],
): ProductGalleryImage[] {
  if (storedImages.length > 0) {
    return storedImages.map((image, index) => ({
      id: `stored-${index}`,
      url: hiRes(image.url),
      label: image.label?.trim() || `View ${index + 1}`,
    }));
  }

  const primary = getProductImageUrl(slug, category);
  const images: ProductGalleryImage[] = [
    {
      id: "primary",
      url: hiRes(primary),
      label: "Product view",
    },
  ];

  const seen = new Set(images.map((img) => img.url));

  for (const extra of SLUG_GALLERY_EXTRAS[slug] ?? []) {
    if (seen.has(extra.url)) continue;
    seen.add(extra.url);
    images.push(extra);
  }

  const cat = (category ?? "").trim();
  for (const extra of CATEGORY_GALLERY_EXTRAS[cat] ?? []) {
    if (seen.has(extra.url)) continue;
    seen.add(extra.url);
    images.push(extra);
  }

  for (const [index, accessory] of accessoryImages.entries()) {
    if (!accessory.url || seen.has(accessory.url)) continue;
    seen.add(accessory.url);
    images.push({
      id: `accessory-${index}`,
      url: hiRes(accessory.url),
      label: accessory.name,
    });
  }

  return images.slice(0, 8);
}
