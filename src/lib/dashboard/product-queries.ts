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
  createdAt: true,
  updatedAt: true,
} as const;

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
  createdAt: Date;
  updatedAt: Date;
  accessories: {
    id: string;
    name: string;
    imageUrl: string | null;
    priceCents: number;
    sortOrder: number;
  }[];
};

function isUnknownAccessoriesFieldError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === "PrismaClientValidationError" &&
    error.message.includes("Unknown field `accessories`")
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
        accessories: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            priceCents: true,
            sortOrder: true,
          },
        },
      },
    });
    return { products, connectionError: false };
  } catch (error) {
    if (isPrismaConnectionError(error)) {
      return { products: [], connectionError: true };
    }

    if (isUnknownAccessoriesFieldError(error)) {
      const products = await prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: productBaseSelect,
      });
      return {
        products: products.map((product) => ({ ...product, accessories: [] })),
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
        accessories: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            priceCents: true,
            sortOrder: true,
          },
        },
      },
    });
    return product;
  } catch (error) {
    if (isUnknownAccessoriesFieldError(error)) {
      const product = await prisma.product.findUnique({
        where: { id },
        select: productBaseSelect,
      });
      return product ? { ...product, accessories: [] } : null;
    }
    throw error;
  }
}
