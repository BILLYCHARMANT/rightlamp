"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { normalizeCurrency } from "@/lib/dashboard/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PUBLISHED_CATALOG_CACHE_TAG } from "@/lib/store/published-catalog";
import {
  normalizeProductImages,
  normalizeAccessoryImageUrl,
  type ProductImageInput,
} from "@/lib/dashboard/product-media";
import {
  extractCapacityLabel,
  variantFamilyTitle,
} from "@/lib/store/product-variants";

export type ProductActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export type { ProductImageInput } from "@/lib/dashboard/product-media";

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
      imageUrl: normalizeAccessoryImageUrl(a.imageUrl),
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

async function replaceProductImages(
  productId: string,
  images: ProductImageInput[],
) {
  await prisma.productImage.deleteMany({ where: { productId } });
  if (!images.length) return;

  await prisma.productImage.createMany({
    data: images.map((image, index) => ({
      productId,
      url: image.url,
      label: image.label ?? null,
      sortOrder: index,
    })),
  });
}

function productImagesCreateInput(images: ProductImageInput[]) {
  if (!images.length) return undefined;
  return {
    create: images.map((image, index) => ({
      url: image.url,
      label: image.label ?? null,
      sortOrder: index,
    })),
  };
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
  images?: ProductImageInput[];
  familyName?: string | null;
  variantLabel?: string | null;
  familyId?: string | null;
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
  const images = normalizeProductImages(input.images);

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
    const variantLabel =
      input.variantLabel?.trim() || extractCapacityLabel(name);
    let familyId = input.familyId?.trim() || null;

    if (!familyId) {
      const family = await prisma.productFamily.create({
        data: {
          name: input.familyName?.trim() || variantFamilyTitle(name),
          category,
        },
      });
      familyId = family.id;
    }

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
        familyId,
        variantLabel,
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
        images: productImagesCreateInput(images),
      },
    });
    revalidateProductSurfaces();
    return { ok: true, id: p.id };
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Could not create product.";
    if (msg.includes("character varying") || msg.includes("too long")) {
      return {
        ok: false,
        message:
          "One of the images is too large. Use a smaller file or paste a shorter HTTPS URL.",
      };
    }
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
  images?: ProductImageInput[];
  variantLabel?: string | null;
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
  const images = normalizeProductImages(input.images);

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
    const variantLabel =
      input.variantLabel?.trim() || extractCapacityLabel(name);

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
        variantLabel,
      },
    });
    await replaceProductAccessories(input.id, accessories);
    await replaceProductImages(input.id, images);
    revalidateProductSurfaces();
    return { ok: true, id: input.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not update product.";
    return { ok: false, message: msg };
  }
}

/** Add a new capacity/size version to an existing product family. */
export async function createDashboardProductVersion(input: {
  familyId: string;
  variantLabel: string;
  priceCents: number;
  costPriceCents?: number | null;
  currency?: string;
  stock: number;
  published?: boolean;
  description?: string | null;
  accessories?: ProductAccessoryInput[];
  images?: ProductImageInput[];
}): Promise<ProductActionResult & { id?: string }> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const variantLabel = input.variantLabel.trim();
  if (!variantLabel) {
    return { ok: false, message: "Version label is required (e.g. 50W, 120cm)." };
  }

  if (!Number.isFinite(input.priceCents) || input.priceCents < 0) {
    return { ok: false, message: "Invalid price." };
  }

  const family = await prisma.productFamily.findUnique({
    where: { id: input.familyId },
    select: { id: true, name: true, category: true },
  });
  if (!family) {
    return { ok: false, message: "Product family not found." };
  }

  const sibling = await prisma.product.findFirst({
    where: { familyId: family.id },
    orderBy: { createdAt: "asc" },
    select: { description: true, currency: true },
  });

  const name = `${family.name} ${variantLabel}`.trim();
  const stock = Math.max(0, Math.floor(Number(input.stock) || 0));
  const currency = normalizeCurrency(input.currency ?? sibling?.currency ?? "RWF");
  const description =
    input.description?.trim() || sibling?.description?.trim() || null;
  const costPriceCents =
    input.costPriceCents != null && Number.isFinite(input.costPriceCents)
      ? Math.max(0, Math.round(input.costPriceCents))
      : null;
  const accessories = normalizeAccessories(input.accessories);
  const images = normalizeProductImages(input.images);

  const labelClash = await prisma.product.findFirst({
    where: { familyId: family.id, variantLabel },
    select: { id: true },
  });
  if (labelClash) {
    return {
      ok: false,
      message: `A version labeled "${variantLabel}" already exists for this product.`,
    };
  }

  const base = slugify(name);
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
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        category: family.category,
        description,
        priceCents: Math.round(input.priceCents),
        costPriceCents,
        currency,
        stock,
        published: input.published ?? false,
        familyId: family.id,
        variantLabel,
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
        images: productImagesCreateInput(images),
      },
    });
    revalidateProductSurfaces();
    revalidatePath(`/dashboard/products/${product.id}`);
    return { ok: true, id: product.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create version.";
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
        familyName: string | null;
        variantLabel: string | null;
        familyId: string | null;
        images: {
          id: string;
          url: string;
          label: string | null;
          sortOrder: number;
        }[];
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
      familyName: row.familyName,
      variantLabel: row.variantLabel,
      familyId: row.familyId,
      images: row.images.map((image) => ({
        id: image.id,
        url: image.url,
        label: image.label,
        sortOrder: image.sortOrder,
      })),
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
