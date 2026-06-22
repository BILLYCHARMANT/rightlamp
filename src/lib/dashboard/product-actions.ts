"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { normalizeCurrency } from "@/lib/dashboard/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PUBLISHED_CATALOG_CACHE_TAG } from "@/lib/store/published-catalog";

export type ProductActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export type ProductAccessoryInput = {
  name: string;
  imageUrl?: string | null;
  priceCents?: number;
};

function normalizeAccessories(
  accessories: ProductAccessoryInput[] | undefined,
): ProductAccessoryInput[] {
  if (!accessories?.length) return [];
  return accessories
    .map((a) => ({
      name: a.name.trim(),
      imageUrl: a.imageUrl?.trim() || null,
      priceCents: Math.max(0, Math.round(a.priceCents ?? 0)),
    }))
    .filter((a) => a.name.length > 0);
}

async function replaceProductAccessories(
  productId: string,
  accessories: ProductAccessoryInput[],
) {
  await prisma.productAccessory.deleteMany({ where: { productId } });
  if (!accessories.length) return;

  await prisma.productAccessory.createMany({
    data: accessories.map((a, index) => ({
      productId,
      name: a.name,
      imageUrl: a.imageUrl,
      priceCents: a.priceCents ?? 0,
      sortOrder: index,
    })),
  });
}

function slugify(name: string, explicit?: string): string {
  const raw = (explicit ?? name).trim().toLowerCase();
  const s = raw
    .replace(/[`'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return s || "item";
}

async function requireStaffSession(): Promise<ProductActionResult | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }
  return null;
}

function revalidateProductSurfaces() {
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath("/shop");
  revalidateTag(PUBLISHED_CATALOG_CACHE_TAG, "max");
}

async function resolveProductCategory(
  raw: string | null | undefined,
  required = false,
): Promise<
  { ok: true; category: string | null } | { ok: false; message: string }
> {
  const trimmed = raw?.trim() || null;
  if (!trimmed) {
    if (required) {
      return { ok: false, message: "Select a category." };
    }
    return { ok: true, category: null };
  }

  const row = await prisma.productCategory.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { name: true },
  });
  if (!row) {
    return { ok: false, message: "Select a category from your list." };
  }
  return { ok: true, category: row.name };
}

export async function createDashboardProduct(input: {
  name: string;
  slug?: string;
  category?: string | null;
  categoryRequired?: boolean;
  description?: string | null;
  priceCents: number;
  costPriceCents?: number | null;
  currency: string;
  stock: number;
  published: boolean;
  accessories?: ProductAccessoryInput[];
}): Promise<ProductActionResult & { id?: string }> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const name = input.name.trim();
  if (!name) {
    return { ok: false, message: "Name is required." };
  }

  if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
    return { ok: false, message: "Invalid price." };
  }

  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  const currency = normalizeCurrency(input.currency);
  const description = input.description?.trim() || null;
  const costPriceCents =
    input.costPriceCents != null && Number.isFinite(input.costPriceCents)
      ? Math.max(0, Math.round(input.costPriceCents))
      : null;
  const accessories = normalizeAccessories(input.accessories);

  const categoryResult = await resolveProductCategory(
    input.category,
    Boolean(input.categoryRequired),
  );
  if (!categoryResult.ok) return categoryResult;
  const category = categoryResult.category;

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
        costPriceCents,
        currency,
        stock,
        published: input.published,
        accessories: accessories.length
          ? {
              create: accessories.map((a, index) => ({
                name: a.name,
                imageUrl: a.imageUrl,
                priceCents: a.priceCents ?? 0,
                sortOrder: index,
              })),
            }
          : undefined,
      },
    });
    revalidateProductSurfaces();
    return { ok: true, id: p.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create product.";
    return { ok: false, message: msg };
  }
}

export async function updateDashboardProduct(input: {
  id: string;
  name: string;
  slug?: string;
  category?: string | null;
  categoryRequired?: boolean;
  description?: string | null;
  priceCents: number;
  costPriceCents?: number | null;
  currency: string;
  stock: number;
  published: boolean;
  accessories?: ProductAccessoryInput[];
}): Promise<ProductActionResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const name = input.name.trim();
  if (!name) {
    return { ok: false, message: "Name is required." };
  }

  if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
    return { ok: false, message: "Invalid price." };
  }

  const existing = await prisma.product.findUnique({
    where: { id: input.id },
    select: { id: true },
  });
  if (!existing) {
    return { ok: false, message: "Product not found." };
  }

  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  const currency = normalizeCurrency(input.currency);
  const description = input.description?.trim() || null;
  const costPriceCents =
    input.costPriceCents != null && Number.isFinite(input.costPriceCents)
      ? Math.max(0, Math.round(input.costPriceCents))
      : null;
  const accessories = normalizeAccessories(input.accessories);

  const categoryResult = await resolveProductCategory(
    input.category,
    Boolean(input.categoryRequired),
  );
  if (!categoryResult.ok) return categoryResult;
  const category = categoryResult.category;

  const slug = slugify(name, input.slug?.trim());
  const slugClash = await prisma.product.findFirst({
    where: { slug, NOT: { id: input.id } },
    select: { id: true },
  });
  if (slugClash) {
    return { ok: false, message: "Another product already uses this slug." };
  }

  try {
    await prisma.product.update({
      where: { id: input.id },
      data: {
        name,
        slug,
        category,
        description,
        priceCents: Math.round(input.priceCents),
        costPriceCents,
        currency,
        stock,
        published: input.published,
      },
    });
    await replaceProductAccessories(input.id, accessories);
    revalidateProductSurfaces();
    return { ok: true, id: input.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update product.";
    return { ok: false, message: msg };
  }
}

export async function setProductPublished(
  id: string,
  published: boolean,
): Promise<ProductActionResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  try {
    await prisma.product.update({
      where: { id },
      data: { published },
    });
    revalidateProductSurfaces();
    return { ok: true, id };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not update product status.";
    return { ok: false, message: msg };
  }
}

export async function fetchDashboardProductForEdit(id: string): Promise<
  | {
      ok: true;
      product: {
        id: string;
        name: string;
        slug: string;
        category: string | null;
        description: string | null;
        priceCents: number;
        costPriceCents: number | null;
        currency: string;
        stock: number;
        published: boolean;
        createdAt: string;
        updatedAt: string;
        accessories: {
          id: string;
          name: string;
          imageUrl: string | null;
          priceCents: number;
          sortOrder: number;
        }[];
      };
    }
  | { ok: false; message: string }
> {
  const authErr = await requireStaffSession();
  if (authErr?.ok === false) return authErr;

  const { fetchExplorerProductById } = await import(
    "@/lib/dashboard/product-queries"
  );
  const row = await fetchExplorerProductById(id);
  if (!row) {
    return { ok: false, message: "Product not found." };
  }

  return {
    ok: true,
    product: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      description: row.description,
      priceCents: row.priceCents,
      costPriceCents: row.costPriceCents,
      currency: row.currency,
      stock: row.stock,
      published: row.published,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      accessories: row.accessories.map((a) => ({
        id: a.id,
        name: a.name,
        imageUrl: a.imageUrl,
        priceCents: a.priceCents,
        sortOrder: a.sortOrder,
      })),
    },
  };
}

export async function deleteDashboardProduct(
  id: string,
): Promise<ProductActionResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  try {
    await prisma.product.delete({ where: { id } });
    revalidateProductSurfaces();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not delete product.";
    return { ok: false, message: msg };
  }
}
