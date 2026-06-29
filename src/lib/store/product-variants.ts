import type { PublishedProductRow } from "@/lib/store/published-catalog";

export type ProductVariantOption = {
  slug: string;
  name: string;
  label: string;
  priceCents: number;
  currency: string;
  stock: number;
  isCurrent: boolean;
};

const CAPACITY_PATTERN =
  /(\d+(?:\.\d+)?\s*(?:kW|KW|W|w|V|Ah|L|litres?|quarts?|cm|mm|m|%))/i;

/** Pull a human-readable capacity / size label from the product name. */
export function extractCapacityLabel(name: string): string {
  const match = name.match(CAPACITY_PATTERN);
  if (match) return match[1].replace(/\s+/g, " ").trim();

  const pack = name.match(/\((\d+)\)/);
  if (pack) return `${pack[1]} pack`;

  const cm = name.match(/(\d+)\s*cm/i);
  if (cm) return `${cm[1]} cm`;

  return "Standard";
}

/** Normalized family key — products sharing a key are shown as size/capacity variants. */
export function productFamilyKey(name: string): string {
  return name
    .replace(/\([^)]*\)/g, "")
    .replace(
      /\d+(?:\.\d+)?\s*(?:kW|KW|W|w|V|Ah|L|litres?|quarts?|cm|mm|m|%)/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function buildVariantOptionsFromFamily(
  currentSlug: string,
  rows: {
    slug: string;
    name: string;
    variantLabel: string | null;
    priceCents: number;
    currency: string;
    stock: number;
  }[],
): ProductVariantOption[] {
  return rows
    .sort((a, b) => a.priceCents - b.priceCents)
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      label: row.variantLabel?.trim() || extractCapacityLabel(row.name),
      priceCents: row.priceCents,
      currency: row.currency,
      stock: row.stock,
      isCurrent: row.slug === currentSlug,
    }));
}

export function buildVariantOptions(
  current: PublishedProductRow,
  catalog: PublishedProductRow[],
): ProductVariantOption[] {
  const family = productFamilyKey(current.name);
  const category = (current.category ?? "").trim();

  const siblings = catalog.filter((row) => {
    if (row.id === current.id) return true;
    if (category && (row.category ?? "").trim() !== category) return false;
    return productFamilyKey(row.name) === family;
  });

  const pool =
    siblings.length > 1
      ? siblings
      : catalog.filter(
          (row) =>
            category &&
            (row.category ?? "").trim() === category &&
            row.id !== current.id,
        ).length > 0
        ? [current, ...catalog.filter(
            (row) =>
              (row.category ?? "").trim() === category && row.id !== current.id,
          )].slice(0, 6)
        : [current];

  const unique = new Map<string, PublishedProductRow>();
  for (const row of pool) {
    unique.set(row.slug, row);
  }

  return [...unique.values()]
    .sort((a, b) => a.priceCents - b.priceCents)
    .map((row) => ({
      slug: row.slug,
      name: row.name,
      label: extractCapacityLabel(row.name),
      priceCents: row.priceCents,
      currency: row.currency,
      stock: row.stock,
      isCurrent: row.slug === current.slug,
    }));
}

export function variantFamilyTitle(name: string): string {
  const cleaned = name
    .replace(CAPACITY_PATTERN, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || name;
}
