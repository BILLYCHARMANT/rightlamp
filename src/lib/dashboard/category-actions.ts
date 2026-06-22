"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type CategoryActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export type ProductCategoryRow = {
  id: string;
  name: string;
  itemCount: number;
  createdAt: string;
};

async function requireStaffSession(): Promise<CategoryActionResult | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { ok: false, message: "You must be signed in." };
  }
  return null;
}

function revalidateCategorySurfaces() {
  revalidatePath("/dashboard/stock");
  revalidatePath("/dashboard/products");
  revalidatePath("/shop");
}

export async function listProductCategories(): Promise<ProductCategoryRow[]> {
  const categories = await prisma.productCategory.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) return [];

  const counts = await prisma.product.groupBy({
    by: ["category"],
    where: { category: { not: null } },
    _count: { _all: true },
  });

  const countByName = new Map(
    counts.map((row) => [row.category as string, row._count._all]),
  );

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    itemCount: countByName.get(category.name) ?? 0,
    createdAt: category.createdAt.toISOString(),
  }));
}

export async function createProductCategory(
  name: string,
): Promise<CategoryActionResult & { id?: string }> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "Category name is required." };
  }

  const existing = await prisma.productCategory.findFirst({
    where: { name: { equals: trimmed, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) {
    return { ok: false, message: "A category with this name already exists." };
  }

  try {
    const category = await prisma.productCategory.create({
      data: { name: trimmed },
    });
    revalidateCategorySurfaces();
    return { ok: true, id: category.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create category.";
    return { ok: false, message };
  }
}

export async function updateProductCategory(
  id: string,
  name: string,
): Promise<CategoryActionResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const trimmed = name.trim();
  if (!trimmed) {
    return { ok: false, message: "Category name is required." };
  }

  const category = await prisma.productCategory.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!category) {
    return { ok: false, message: "Category not found." };
  }

  const clash = await prisma.productCategory.findFirst({
    where: {
      name: { equals: trimmed, mode: "insensitive" },
      NOT: { id },
    },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, message: "A category with this name already exists." };
  }

  try {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: { category: category.name },
        data: { category: trimmed },
      }),
      prisma.productCategory.update({
        where: { id },
        data: { name: trimmed },
      }),
    ]);
    revalidateCategorySurfaces();
    return { ok: true, id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not update category.";
    return { ok: false, message };
  }
}

export async function deleteProductCategory(
  id: string,
): Promise<CategoryActionResult> {
  const authErr = await requireStaffSession();
  if (authErr) return authErr;

  const category = await prisma.productCategory.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!category) {
    return { ok: false, message: "Category not found." };
  }

  try {
    await prisma.$transaction([
      prisma.product.updateMany({
        where: { category: category.name },
        data: { category: null },
      }),
      prisma.productCategory.delete({ where: { id } }),
    ]);
    revalidateCategorySurfaces();
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete category.";
    return { ok: false, message };
  }
}
