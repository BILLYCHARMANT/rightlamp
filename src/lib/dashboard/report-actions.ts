"use server";

import { revalidatePath } from "next/cache";
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

export async function createOperationalReport(input: {
  title: string;
  periodStart: string;
  periodEnd: string;
  summary?: string | null;
  body?: string | null;
  publish: boolean;
}): Promise<ActionResult> {
  const email = await requireStaff();
  if (!email) return { ok: false, message: "You must be signed in." };

  const title = input.title.trim();
  if (!title) return { ok: false, message: "Title is required." };

  const periodStart = new Date(input.periodStart);
  const periodEnd = new Date(input.periodEnd);
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) {
    return { ok: false, message: "Invalid period dates." };
  }
  if (periodEnd < periodStart) {
    return { ok: false, message: "End date must be after start date." };
  }

  try {
    const row = await prisma.operationalReport.create({
      data: {
        title,
        periodStart,
        periodEnd,
        summary: input.summary?.trim() || null,
        body: input.body?.trim() || null,
        status: input.publish ? "PUBLISHED" : "DRAFT",
        createdByEmail: email,
      },
    });
    revalidatePath("/dashboard/reports/new");
    revalidatePath("/dashboard/reports/summary");
    revalidatePath("/dashboard/reports");
    return { ok: true, id: row.id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not save report.",
    };
  }
}

export async function publishReport(id: string): Promise<ActionResult> {
  const email = await requireStaff();
  if (!email) return { ok: false, message: "You must be signed in." };

  try {
    await prisma.operationalReport.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    revalidatePath("/dashboard/reports/summary");
    return { ok: true };
  } catch {
    return { ok: false, message: "Could not publish report." };
  }
}
