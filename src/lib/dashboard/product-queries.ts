import "server-only";

import { isPrismaConnectionError } from "@/lib/dashboard/prisma-connection";
import { prisma } from "@/lib/db";

const productBaseSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  description: true,
  priceCents: true,
  costPriceCents: true,
  currency: true,
  stock: true,
  published: true,
  familyId: true,
  variantLabel: true,
  createdAt: true,
  updatedAt: true,
  family: {
    select: { id: true, name: true },
  },
} as const;

const productImagesSelect = {
  orderBy: { sortOrder: "asc" as const },
  select: {
    id: true,
    url: true,
    label: true,
    sortOrder: true,
  },
};

const productAccessoriesSelect = {
  orderBy: { sortOrder: "asc" as const },
  select: {
    id: true,
    name: true,
    imageUrl: true,
    priceCents: true,
    sortOrder: true,
  },
};

type RawProductRow = {
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
  familyId: string | null;
  variantLabel: string | null;
  createdAt: Date;
  updatedAt: Date;
  family: { id: string; name: string } | null;
  accessories?: ExplorerProductRecord["accessories"];
  images?: ExplorerProductRecord["images"];
};

function mapExplorerProduct(row: RawProductRow): ExplorerProductRecord {
  return {
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
    familyId: row.familyId,
    variantLabel: row.variantLabel,
    familyName: row.family?.name ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    accessories: row.accessories ?? [],
    images: row.images ?? [],
  };
}

export type ProductVersionRow = {
  id: string;
  name: string;
  slug: string;
  variantLabel: string | null;
  priceCents: number;
  currency: string;
  stock: number;
  published: boolean;
};

export async function fetchProductVersions(
  familyId: string,
): Promise<ProductVersionRow[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { familyId },
      orderBy: [{ priceCents: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        variantLabel: true,
        priceCents: true,
        currency: true,
        stock: true,
        published: true,
      },
    });
    return rows;
  } catch (error) {
    if (isUnknownFamilyFieldError(error)) {
      const row = await prisma.product.findUnique({
        where: { id: familyId },
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          currency: true,
          stock: true,
          published: true,
        },
      });
      return row
        ? [{ ...row, variantLabel: null }]
        : [];
    }
    throw error;
  }
}

export type ExplorerProductRecord = {
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
  familyId: string | null;
  variantLabel: string | null;
  familyName: string | null;
  createdAt: Date;
  updatedAt: Date;
  accessories: {
    id: string;
    name: string;
    imageUrl: string | null;
    priceCents: number;
    sortOrder: number;
  }[];
  images: {
    id: string;
    url: string;
    label: string | null;
    sortOrder: number;
  }[];
};

const legacyProductBaseSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  description: true,
  priceCents: true,
  costPriceCents: true,
  currency: true,
  stock: true,
  published: true,
  createdAt: true,
  updatedAt: true,
} as const;

function isUnknownFamilyFieldError(error: unknown): boolean {
  if (!(error instanceof Error) || error.name !== "PrismaClientValidationError") {
    return false;
  }
  const msg = error.message;
  return (
    msg.includes("Unknown field `familyId`") ||
    msg.includes("Unknown field `variantLabel`") ||
    msg.includes("Unknown field `family`")
  );
}

function isUnknownAccessoriesFieldError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === "PrismaClientValidationError" &&
    error.message.includes("Unknown field `accessories`")
  );
}

function isUnknownImagesFieldError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === "PrismaClientValidationError" &&
    error.message.includes("Unknown field `images`")
  );
}

/** Dashboard product list — includes related accessories when schema/client supports them. */
export async function fetchExplorerProducts(limit = 120): Promise<{
  products: ExplorerProductRecord[];
  connectionError: boolean;
}> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      take: limit,
      select: {
        ...productBaseSelect,
        accessories: productAccessoriesSelect,
        images: productImagesSelect,
      },
    });
    return { products: products.map(mapExplorerProduct), connectionError: false };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return { products: [], connectionError: true };
    }

    if (isUnknownImagesFieldError(error)) {
      const products = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          ...productBaseSelect,
          accessories: productAccessoriesSelect,
        },
      });
      return {
        products: products.map((product) =>
          mapExplorerProduct({ ...product, images: [] }),
        ),
        connectionError: false,
      };
    }

    if (isUnknownFamilyFieldError(error)) {
      const products = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: legacyProductBaseSelect,
      });
      return {
        products: products.map((product) =>
          mapExplorerProduct({
            ...product,
            familyId: null,
            variantLabel: null,
            family: null,
            accessories: [],
            images: [],
          }),
        ),
        connectionError: false,
      };
    }

    if (isUnknownAccessoriesFieldError(error)) {
      const products = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
          ...productBaseSelect,
          images: productImagesSelect,
        },
      });
      return {
        products: products.map((product) =>
          mapExplorerProduct({ ...product, accessories: [] }),
        ),
        connectionError: false,
      };
    }

    throw error;
  }
}

/** Single product for edit modals — same shape as list rows. */
export async function fetchExplorerProductById(
  id: string,
): Promise<ExplorerProductRecord | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        ...productBaseSelect,
        accessories: productAccessoriesSelect,
        images: productImagesSelect,
      },
    });
    return product ? mapExplorerProduct(product) : null;
  } catch (error) {
    if (isUnknownImagesFieldError(error)) {
      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          ...productBaseSelect,
          accessories: productAccessoriesSelect,
        },
      });
      return product
        ? mapExplorerProduct({ ...product, images: [] })
        : null;
    }

    if (isUnknownFamilyFieldError(error)) {
      const product = await prisma.product.findUnique({
        where: { id },
        select: legacyProductBaseSelect,
      });
      return product
        ? mapExplorerProduct({
            ...product,
            familyId: null,
            variantLabel: null,
            family: null,
            accessories: [],
            images: [],
          })
        : null;
    }

    if (isUnknownAccessoriesFieldError(error)) {
      const product = await prisma.product.findUnique({
        where: { id },
        select: {
          ...productBaseSelect,
          images: productImagesSelect,
        },
      });
      return product ? mapExplorerProduct({ ...product, accessories: [] }) : null;
    }

    throw error;
  }
}
