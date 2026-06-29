import "server-only";

import { normalizeCurrency } from "@/lib/dashboard/constants";
import { getProductImageUrl } from "@/lib/dashboard/product-images";
import { prisma } from "@/lib/db";
import type { PublishedProductRow } from "@/lib/store/published-catalog";
import { buildProductGallery, type ProductGalleryImage } from "@/lib/store/product-gallery";
import {
  buildVariantOptions,
  buildVariantOptionsFromFamily,
  extractCapacityLabel,
  type ProductVariantOption,
  variantFamilyTitle,
} from "@/lib/store/product-variants";
import { company } from "@/lib/company/site-content";

export type ProductAccessoryView = {
  id: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
};

export type ProductSpecRow = {
  label: string;
  value: string;
};

export type StoreProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  image: string;
  familyTitle: string;
  capacityLabel: string;
  brand: string;
  gallery: ProductGalleryImage[];
  variants: ProductVariantOption[];
  accessories: ProductAccessoryView[];
  specs: ProductSpecRow[];
};

function toRow(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  priceCents: number;
  currency: string;
  stock: number;
}): PublishedProductRow {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    currency: product.currency,
    stock: product.stock,
  };
}

function buildSpecs(
  product: PublishedProductRow,
  accessories: ProductAccessoryView[],
): ProductSpecRow[] {
  const rows: ProductSpecRow[] = [
    { label: "Brand", value: company.shortName },
    { label: "Model", value: product.slug },
    { label: "Category", value: product.category?.trim() || "General" },
    { label: "Capacity / size", value: extractCapacityLabel(product.name) },
    {
      label: "Availability",
      value: product.stock > 0 ? `${product.stock} in stock` : "On request",
    },
    {
      label: "Currency",
      value: normalizeCurrency(product.currency),
    },
  ];

  if (accessories.length) {
    rows.push({
      label: "Compatible add-ons",
      value: accessories.map((a) => a.name).join(", "),
    });
  }

  return rows;
}

export async function getStoreProductDetail(
  slug: string,
): Promise<StoreProductDetail | null> {
  const product = await prisma.product.findFirst({
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
      familyId: true,
      variantLabel: true,
      family: { select: { name: true } },
      accessories: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          priceCents: true,
        },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          url: true,
          label: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!product) return null;

  const familyVariants = product.familyId
    ? await prisma.product.findMany({
        where: { familyId: product.familyId, published: true },
        orderBy: { priceCents: "asc" },
        select: {
          slug: true,
          name: true,
          variantLabel: true,
          priceCents: true,
          currency: true,
          stock: true,
        },
      })
    : [];

  const catalogRows =
    familyVariants.length > 0
      ? []
      : await prisma.product.findMany({
          where: { published: true },
          orderBy: { name: "asc" },
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

  const row = toRow(product);
  const catalog = catalogRows.map(toRow);
  const accessories = product.accessories;

  const gallery = buildProductGallery(
    product.slug,
    product.category,
    accessories
      .filter((a) => a.imageUrl)
      .map((a) => ({ url: a.imageUrl!, name: a.name })),
    product.images.map((image) => ({
      url: image.url,
      label: image.label,
    })),
  );

  const variants =
    familyVariants.length > 0
      ? buildVariantOptionsFromFamily(product.slug, familyVariants)
      : buildVariantOptions(row, catalog);

  const capacityLabel =
    product.variantLabel?.trim() || extractCapacityLabel(product.name);
  const familyTitle =
    product.family?.name?.trim() || variantFamilyTitle(product.name);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    currency: normalizeCurrency(product.currency),
    stock: product.stock,
    image:
      product.images[0]?.url ??
      getProductImageUrl(product.slug, product.category),
    familyTitle,
    capacityLabel,
    brand: company.shortName,
    gallery,
    variants,
    accessories,
    specs: buildSpecs(
      { ...row, name: product.name },
      accessories,
    ),
  };
}
