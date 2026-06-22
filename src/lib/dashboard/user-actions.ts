"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  canManageUsers,
  normalizeStaffRole,
  roleRequiresBranchAssignment,
} from "@/lib/dashboard/rbac";
import { getDashboardSession } from "@/lib/dashboard/rbac-server";
import { prisma } from "@/lib/db";
import type { StaffRole } from "@/generated/prisma/client";

export type UserActionResult =
  | { ok: true; id?: string }
  | { ok: false; message: string };

export type StaffUserInput = {
  email: string;
  name: string;
  password?: string;
  role: StaffRole;
  phone?: string | null;
  jobTitle?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  active: boolean;
  branchIds?: string[];
};

async function requireUserAdmin(): Promise<UserActionResult | null> {
  const session = await getDashboardSession();
  if (!session) {
    return { ok: false, message: "You must be signed in." };
  }
  if (!canManageUsers(session.role)) {
    return { ok: false, message: "Only administrators can manage users." };
  }
  return null;
}

function validateRoleBranches(role: StaffRole, branchIds: string[] | undefined): string | null {
  const normalized = normalizeStaffRole(role);
  if (roleRequiresBranchAssignment(normalized) && !(branchIds?.length ?? 0)) {
    return "Assign at least one branch for this role.";
  }
  return null;
}

function revalidateUserSurfaces() {
  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/branches");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function trimOrNull(value: string | null | undefined, maxLen?: number) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  return maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

async function syncUserBranches(userId: string, branchIds: string[]) {
  const uniqueIds = [...new Set(branchIds.filter(Boolean))];
  await prisma.branchStaffAssignment.deleteMany({ where: { userId } });

  if (uniqueIds.length === 0) return;

  const branches = await prisma.branch.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });

  if (branches.length === 0) return;

  await prisma.branchStaffAssignment.createMany({
    data: branches.map((branch) => ({ userId, branchId: branch.id })),
    skipDuplicates: true,
  });
}

export async function createStaffUser(input: StaffUserInput): Promise<UserActionResult> {
  const authErr = await requireUserAdmin();
  if (authErr) return authErr;

  const branchErr = validateRoleBranches(input.role, input.branchIds);
  if (branchErr) return { ok: false, message: branchErr };

  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password?.trim() ?? "";

  if (!email) return { ok: false, message: "Email is required." };
  if (!name) return { ok: false, message: "Full name is required." };
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) return { ok: false, message: "That email is already registered." };

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: input.role,
        phone: trimOrNull(input.phone, 64),
        jobTitle: trimOrNull(input.jobTitle, 120),
        bio: trimOrNull(input.bio),
        imageUrl: trimOrNull(input.imageUrl, 2000),
        active: input.active,
      },
    });

    await syncUserBranches(user.id, input.branchIds ?? []);

    revalidateUserSurfaces();
    return { ok: true, id: user.id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not create user.",
    };
  }
}

export async function updateStaffUser(
  id: string,
  input: StaffUserInput,
): Promise<UserActionResult> {
  const authErr = await requireUserAdmin();
  if (authErr) return authErr;

  const branchErr = validateRoleBranches(input.role, input.branchIds);
  if (branchErr) return { ok: false, message: branchErr };

  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password?.trim() ?? "";

  if (!email) return { ok: false, message: "Email is required." };
  if (!name) return { ok: false, message: "Full name is required." };
  if (password && password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true },
  });
  if (!existing) return { ok: false, message: "User not found." };

  const clash = await prisma.user.findFirst({
    where: { email, NOT: { id } },
    select: { id: true },
  });
  if (clash) return { ok: false, message: "That email is already registered." };

  try {
    const data: {
      email: string;
      name: string;
      role: StaffRole;
      phone: string | null;
      jobTitle: string | null;
      bio: string | null;
      imageUrl: string | null;
      active: boolean;
      passwordHash?: string;
    } = {
      email,
      name,
      role: input.role,
      phone: trimOrNull(input.phone, 64),
      jobTitle: trimOrNull(input.jobTitle, 120),
      bio: trimOrNull(input.bio),
      imageUrl: trimOrNull(input.imageUrl, 2000),
      active: input.active,
    };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    await prisma.user.update({ where: { id }, data });
    await syncUserBranches(id, input.branchIds ?? []);

    revalidateUserSurfaces();
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update user.",
    };
  }
}

export async function setStaffUserActive(
  id: string,
  active: boolean,
): Promise<UserActionResult> {
  const authErr = await requireUserAdmin();
  if (authErr) return authErr;

  const session = await getServerSession(authOptions);
  const current = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!current) return { ok: false, message: "User not found." };

  if (
    !active &&
    session?.user?.email &&
    current.email.toLowerCase() === session.user.email.toLowerCase()
  ) {
    return { ok: false, message: "You cannot deactivate your own account." };
  }

  try {
    await prisma.user.update({ where: { id }, data: { active } });
    revalidateUserSurfaces();
    return { ok: true, id };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not update account status.",
    };
  }
}

export async function deleteStaffUser(id: string): Promise<UserActionResult> {
  const authErr = await requireUserAdmin();
  if (authErr) return authErr;

  const session = await getServerSession(authOptions);
  const current = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!current) return { ok: false, message: "User not found." };
  if (
    session?.user?.email &&
    current.email.toLowerCase() === session.user.email.toLowerCase()
  ) {
    return { ok: false, message: "You cannot delete your own account." };
  }

  try {
    await prisma.user.delete({ where: { id } });
    revalidateUserSurfaces();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Could not delete user.",
    };
  }
}
