import "server-only";
import { unstable_cache } from "next/cache";
import type { RightlampsProduct } from "./types";

function apiOrigin() {
  return (
    process.env.RIGHTLAMPS_API_ORIGIN?.replace(/\/$/, "") ??
    "https://www.rightlamps.com"
  );
}

async function fetchProductsUncached(): Promise<RightlampsProduct[]> {
  const origin = apiOrigin();
  const res = await fetch(`${origin}/api/products`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Rightlamps products API failed: ${res.status}`);
  }
  const text = await res.text();
  const clean = text.replace(/^\uFEFF/, "").trim();
  const data = JSON.parse(clean) as unknown;
  if (!Array.isArray(data)) {
    throw new Error("Rightlamps products API returned non-array JSON");
  }
  return data as RightlampsProduct[];
}

/** Cached catalog (~5 min). Safe for server components & metadata. */
export const getCachedRightlampsProducts = unstable_cache(
  fetchProductsUncached,
  ["rightlamps-products-catalog"],
  { revalidate: 300 },
);

export function topCategoriesByVolume(
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
