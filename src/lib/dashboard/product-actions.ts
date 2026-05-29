"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PUBLISHED_CATALOG_CACHE_TAG } from "@/lib/store/published-catalog";

export type CreateProductResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

function slugify(name: string, explicit?: string): string {
  const raw = (explicit ?? name).trim().toLowerCase();
  const s = raw
    .replace(/[`'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return s || "item";
}

export async function createDashboardProduct(input: {
  name: string;
  slug?: string;
  category?: string | null;
  description?: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  published: boolean;
}): Promise<CreateProductResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, message: "Name is required." };
  }

  if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
    return { ok: false, message: "Invalid price." };
  }

  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  const currency =
    input.currency.trim().toUpperCase().slice(0, 3) || "TZS";
  const category = input.category?.trim() || null;
  const description = input.description?.trim() || null;

  const base = slugify(name, input.slug?.trim());
  let slug = base;
  for (let n = 0; n < 20; n++) {
    const clash = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash) break;
    slug = `${base}-${n + 2}`;
  }

  try {
    const p = await prisma.product.create({
      data: {
        name,
        slug,
        category,
        description,
        priceCents: Math.round(input.priceCents),
        currency,
        stock,
        published: input.published,
      },
    });
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/stock");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidateTag(PUBLISHED_CATALOG_CACHE_TAG, "max");
    return { ok: true, id: p.id };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not create product.";
    return { ok: false, message: msg };
  }
}
