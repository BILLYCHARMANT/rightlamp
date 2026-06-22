import "server-only";

import { unstable_cache } from "next/cache";
import { normalizeCurrency } from "@/lib/dashboard/constants";
import { prisma } from "@/lib/db";
import type { RightlampsProduct } from "@/lib/rightlamps/types";
import { BRAND_LOGO } from "@/lib/company/brand-assets";

export type PublishedProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  priceCents: number;
  currency: string;
  stock: number;
};

/** Maps dashboard `Product` rows to the storefront card shape (legacy PV-GRID field names). */
export function prismaProductToStorefrontProduct(
  row: PublishedProductRow,
): RightlampsProduct {
  return {
    _id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    category: row.category ?? undefined,
    image: BRAND_LOGO,
    price: row.priceCents / 100,
    currency: normalizeCurrency(row.currency),
    countInStock: row.stock,
  };
}

async function fetchPublishedCatalogUncached(): Promise<RightlampsProduct[]> {
  const rows = await prisma.product.findMany({
    where: { published: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      priceCents: true,
      currency: true,
      stock: true,
    },
  });
  return rows.map(prismaProductToStorefrontProduct);
}

/** Invalidate with `revalidateTag` when dashboard inventory changes. */
export const PUBLISHED_CATALOG_CACHE_TAG = "store-published-catalog-v1";

/** Published products from Prisma — same source as the staff dashboard catalog. */
export const getCachedPublishedCatalog = unstable_cache(
  fetchPublishedCatalogUncached,
  [PUBLISHED_CATALOG_CACHE_TAG],
  { revalidate: 30, tags: [PUBLISHED_CATALOG_CACHE_TAG] },
);

export function categoriesFromPublishedCatalog(
  products: RightlampsProduct[],
  limit: number,
): string[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const c = (p.category ?? "").trim();
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

export async function getPublishedProductBySlug(
  slug: string,
): Promise<RightlampsProduct | null> {
  const row = await prisma.product.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      priceCents: true,
      currency: true,
      stock: true,
    },
  });
  return row ? prismaProductToStorefrontProduct(row) : null;
}
