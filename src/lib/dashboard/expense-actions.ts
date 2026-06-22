"use server";

import { revalidatePath } from "next/cache";
import { normalizeCurrency } from "@/lib/dashboard/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return session.user.email;
}

export async function createExpense(input: {
  title: string;
  vendor?: string | null;
  amountCents: number;
  currency: string;
  category?: string | null;
  paidAt: string;
  note?: string | null;
}): Promise<ActionResult> {
  const email = await requireStaff();
  if (!email) return { ok: false, message: "You must be signed in." };

  const title = input.title.trim();
  if (!title) return { ok: false, message: "Title is required." };
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return { ok: false, message: "Amount must be greater than zero." };
  }

  const paidAt = new Date(input.paidAt);
  if (Number.isNaN(paidAt.getTime())) {
    return { ok: false, message: "Invalid date." };
  }

  try {
    const row = await prisma.expense.create({
      data: {
        title,
        vendor: input.vendor?.trim() || null,
        amountCents: Math.round(input.amountCents),
        currency: normalizeCurrency(input.currency),
        category: input.category?.trim() || null,
        paidAt,
        note: input.note?.trim() || null,
        createdByEmail: email,
      },
    });
    revalidatePath("/dashboard/reports/expenses");
    revalidatePath("/dashboard/reports/monthly");
    revalidatePath("/dashboard/reports/summary");
    return { ok: true, id: row.id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save expense.",
    };
  }
}

export async function updateExpense(
  id: string,
  input: {
    title: string;
    vendor?: string | null;
    amountCents: number;
    currency: string;
    category?: string | null;
    paidAt: string;
    note?: string | null;
  },
): Promise<ActionResult> {
  const email = await requireStaff();
  if (!email) return { ok: false, message: "You must be signed in." };

  const title = input.title.trim();
  if (!title) return { ok: false, message: "Title is required." };
  if (!Number.isFinite(input.amountCents) || input.amountCents <= 0) {
    return { ok: false, message: "Amount must be greater than zero." };
  }

  const paidAt = new Date(input.paidAt);
  if (Number.isNaN(paidAt.getTime())) {
    return { ok: false, message: "Invalid date." };
  }

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        title,
        vendor: input.vendor?.trim() || null,
        amountCents: Math.round(input.amountCents),
        currency: normalizeCurrency(input.currency),
        category: input.category?.trim() || null,
        paidAt,
        note: input.note?.trim() || null,
      },
    });
    revalidatePath("/dashboard/reports/expenses");
    revalidatePath("/dashboard/reports/monthly");
    revalidatePath("/dashboard/reports/summary");
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update expense.",
    };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const email = await requireStaff();
  if (!email) return { ok: false, message: "You must be signed in." };

  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/dashboard/reports/expenses");
    revalidatePath("/dashboard/reports/monthly");
    revalidatePath("/dashboard/reports/summary");
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not delete expense." };
  }
}
