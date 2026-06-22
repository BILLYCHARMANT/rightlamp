import "server-only";
import type { RightlampsProduct } from "./types";

function apiOrigin() {
  return (
    process.env.RIGHTLAMPS_API_ORIGIN?.replace(/\/$/, "") ??
    "https://www.rightlamps.com"
  );
}

function apiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const cookie = process.env.RIGHTLAMPS_API_COOKIE?.trim();
  if (cookie) {
    headers.Cookie = cookie;
  }
  const bearer = process.env.RIGHTLAMPS_API_TOKEN?.trim();
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }
  return headers;
}

async function fetchJson<T>(path: string): Promise<T> {
  const origin = apiOrigin();
  const res = await fetch(`${origin}${path}`, {
    headers: apiHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new Error(`PV-GRID API ${path} failed: ${res.status}`);
  }
  const text = await res.text();
  const clean = text.replace(/^\uFEFF/, "").trim();
  return JSON.parse(clean) as T;
}

export async function fetchProductionExpenses(): Promise<unknown[] | null> {
  try {
    const data = await fetchJson<unknown>("/api/expense");
    return Array.isArray(data) ? data : [];
  } catch {
    return null;
  }
}

export async function fetchReportSummary(): Promise<Record<string, unknown> | null> {
  try {
    return await fetchJson<Record<string, unknown>>("/api/report/summary");
  } catch {
    return null;
  }
}

export type ShopInventoryRow = RightlampsProduct & {
  stockValue: number;
};

export function toShopInventoryRows(
  products: RightlampsProduct[],
): ShopInventoryRow[] {
  return products
    .map((p) => ({
      ...p,
      stockValue: (p.costPrice ?? p.price * 0.65) * p.countInStock,
    }))
    .sort((a, b) => b.stockValue - a.stockValue);
}
