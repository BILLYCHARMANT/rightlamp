"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type SupplierActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session.user.email;
}

export async function createSupplier(input: {
  name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  active: boolean;
}): Promise<SupplierActionResult> {
  if (!(await requireStaff())) {
    return { ok: false, message: "You must be signed in." };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, message: "Supplier name is required." };

  try {
    const row = await prisma.supplier.create({
      data: {
        name,
        contact: input.contact?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        active: input.active,
      },
    });
    revalidatePath("/dashboard/stock");
    return { ok: true, id: row.id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not create supplier.",
    };
  }
}

export async function toggleSupplierActive(
  id: string,
  active: boolean,
): Promise<SupplierActionResult> {
  if (!(await requireStaff())) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    await prisma.supplier.update({ where: { id }, data: { active } });
    revalidatePath("/dashboard/stock");
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not update supplier." };
  }
}

export async function updateSupplier(
  id: string,
  input: {
    name: string;
    contact?: string | null;
    email?: string | null;
    phone?: string | null;
    active: boolean;
  },
): Promise<SupplierActionResult> {
  if (!(await requireStaff())) {
    return { ok: false, message: "You must be signed in." };
  }

  const name = input.name.trim();
  if (!name) return { ok: false, message: "Supplier name is required." };

  try {
    await prisma.supplier.update({
      where: { id },
      data: {
        name,
        contact: input.contact?.trim() || null,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        active: input.active,
      },
    });
    revalidatePath("/dashboard/stock");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update supplier.",
    };
  }
}

export type SupplierImportRow = {
  name: string;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  active?: boolean;
};

export async function importSuppliers(
  rows: SupplierImportRow[],
): Promise<
  | { ok: true; created: number; skipped: number }
  | { ok: false; message: string }
> {
  if (!(await requireStaff())) {
    return { ok: false, message: "You must be signed in." };
  }

  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.name.trim();
    if (!name) {
      skipped += 1;
      continue;
    }

    const existing = await prisma.supplier.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) {
      skipped += 1;
      continue;
    }

    await prisma.supplier.create({
      data: {
        name,
        contact: row.contact?.trim() || null,
        email: row.email?.trim() || null,
        phone: row.phone?.trim() || null,
        active: row.active ?? true,
      },
    });
    created += 1;
  }

  revalidatePath("/dashboard/stock");
  return { ok: true, created, skipped };
}

export async function deleteSupplier(id: string): Promise<SupplierActionResult> {
  if (!(await requireStaff())) {
    return { ok: false, message: "You must be signed in." };
  }

  try {
    await prisma.supplier.delete({ where: { id } });
    revalidatePath("/dashboard/stock");
    return { ok: true };
  } catch {
    return {
      ok: false,
      message: "Supplier has linked receipts — deactivate instead.",
    };
  }
}
