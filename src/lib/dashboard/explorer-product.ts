import type { ExplorerProduct } from "@/components/dashboard/dashboard-products-explorer";
import type { ExplorerProductRecord } from "@/lib/dashboard/product-queries";

type EditFetchProduct = {
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

export function toExplorerProductFromEdit(
  product: EditFetchProduct,
): ExplorerProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    priceCents: product.priceCents,
    costPriceCents: product.costPriceCents,
    currency: product.currency,
    stock: product.stock,
    published: product.published,
    familyId: product.familyId,
    variantLabel: product.variantLabel,
    familyName: product.familyName,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: product.images,
    accessories: product.accessories,
  };
}

export function toExplorerProduct(record: ExplorerProductRecord): ExplorerProduct {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    category: record.category,
    description: record.description,
    priceCents: record.priceCents,
    costPriceCents: record.costPriceCents,
    currency: record.currency,
    stock: record.stock,
    published: record.published,
    familyId: record.familyId,
    variantLabel: record.variantLabel,
    familyName: record.familyName,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    accessories: record.accessories.map((accessory) => ({
      id: accessory.id,
      name: accessory.name,
      imageUrl: accessory.imageUrl,
      priceCents: accessory.priceCents,
      sortOrder: accessory.sortOrder,
    })),
    images: record.images.map((image) => ({
      id: image.id,
      url: image.url,
      label: image.label,
      sortOrder: image.sortOrder,
    })),
  };
}
