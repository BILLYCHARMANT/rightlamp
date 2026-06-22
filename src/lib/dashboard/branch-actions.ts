"use server";



import { revalidatePath } from "next/cache";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

import { prisma } from "@/lib/db";

import type { StaffRole } from "@/generated/prisma/client";



export type BranchActionResult =

  | { ok: true; id?: string }

  | { ok: false; message: string };



export type BranchStaffRow = {

  id: string;

  name: string | null;

  email: string;

  role: StaffRole;

};



export type BranchRow = {

  id: string;

  name: string;

  code: string | null;

  location: string | null;

  phone: string | null;

  active: boolean;

  isMain: boolean;

  assignedStaff: BranchStaffRow[];

  createdAt: string;

};



export type StaffUserOption = {

  id: string;

  name: string | null;

  email: string;

  role: StaffRole;

};



async function requireStaff(): Promise<
  | { ok: true; email: string; name: string }
  | { ok: false; message: string }
> {

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {

    return { ok: false, message: "You must be signed in." };

  }

  return {
    ok: true,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  };

}



function revalidateBranchSurfaces() {

  revalidatePath("/dashboard/branches");

  revalidatePath("/dashboard/stock");

  revalidatePath("/dashboard/my-shops");

}



function mapAssignedStaff(

  assignments: {

    user: {

      id: string;

      name: string | null;

      email: string;

      role: StaffRole;

    };

  }[],

): BranchStaffRow[] {

  return assignments

    .map(({ user }) => user)

    .sort((a, b) => {

      const aLabel = (a.name ?? a.email).toLowerCase();

      const bLabel = (b.name ?? b.email).toLowerCase();

      return aLabel.localeCompare(bLabel);

    });

}



async function syncBranchStaff(
  branchId: string,
  staffUserIds: string[],
  actor?: { email: string; name: string },
) {

  const existing = await prisma.branchStaffAssignment.findMany({

    where: { branchId },

    select: { userId: true },

  });

  const previousIds = new Set(existing.map((row) => row.userId));

  const uniqueIds = [...new Set(staffUserIds.filter(Boolean))];

  await prisma.branchStaffAssignment.deleteMany({ where: { branchId } });

  if (uniqueIds.length === 0) {

    const removed = [...previousIds];

    if (removed.length > 0 && actor) {

      const { logBranchActivity } = await import("@/lib/dashboard/shop-activity");

      await logBranchActivity({

        branchId,

        action: "STAFF_REMOVED",

        description: `Removed ${removed.length} staff assignment(s).`,

        userEmail: actor.email,

        userName: actor.name,

      });

    }

    return;

  }



  const users = await prisma.user.findMany({

    where: { id: { in: uniqueIds } },

    select: { id: true, name: true, email: true },

  });

  if (users.length === 0) return;



  await prisma.branchStaffAssignment.createMany({

    data: users.map((user) => ({ branchId, userId: user.id })),

    skipDuplicates: true,

  });



  if (actor) {

    const { logBranchActivity } = await import("@/lib/dashboard/shop-activity");

    const added = users.filter((user) => !previousIds.has(user.id));

    const removedCount = [...previousIds].filter((id) => !uniqueIds.includes(id)).length;

    for (const user of added) {

      await logBranchActivity({

        branchId,

        action: "STAFF_ASSIGNED",

        description: `Assigned ${user.name ?? user.email} to this shop.`,

        userEmail: actor.email,

        userName: actor.name,

      });

    }

    if (removedCount > 0) {

      await logBranchActivity({

        branchId,

        action: "STAFF_REMOVED",

        description: `Removed ${removedCount} staff assignment(s).`,

        userEmail: actor.email,

        userName: actor.name,

      });

    }

  }

}



export async function listStaffUsersForAssignment(): Promise<StaffUserOption[]> {

  return prisma.user.findMany({

    orderBy: [{ name: "asc" }, { email: "asc" }],

    select: {

      id: true,

      name: true,

      email: true,

      role: true,

    },

  });

}



export async function listBranches(): Promise<BranchRow[]> {

  const rows = await prisma.branch.findMany({

    orderBy: [{ isMain: "desc" }, { name: "asc" }],

    include: {

      staffAssignments: {

        include: {

          user: {

            select: {

              id: true,

              name: true,

              email: true,

              role: true,

            },

          },

        },

      },

    },

  });



  return rows.map((row) => ({

    id: row.id,

    name: row.name,

    code: row.code,

    location: row.location,

    phone: row.phone,

    active: row.active,

    isMain: row.isMain,

    assignedStaff: mapAssignedStaff(row.staffAssignments),

    createdAt: row.createdAt.toISOString(),

  }));

}



export async function createBranch(input: {

  name: string;

  code?: string | null;

  location?: string | null;

  phone?: string | null;

  active: boolean;

  isMain: boolean;

  staffUserIds?: string[];

}): Promise<BranchActionResult> {

  const auth = await requireStaff();

  if (!auth.ok) return auth;



  const name = input.name.trim();

  if (!name) return { ok: false, message: "Branch name is required." };



  const code = input.code?.trim() || null;

  if (code) {

    const clash = await prisma.branch.findUnique({

      where: { code },

      select: { id: true },

    });

    if (clash) return { ok: false, message: "That branch code is already in use." };

  }



  try {

    const row = await prisma.$transaction(async (tx) => {

      if (input.isMain) {

        await tx.branch.updateMany({ data: { isMain: false }, where: { isMain: true } });

      }

      return tx.branch.create({

        data: {

          name,

          code,

          location: input.location?.trim() || null,

          phone: input.phone?.trim() || null,

          active: input.active,

          isMain: input.isMain,

        },

      });

    });



    await syncBranchStaff(row.id, input.staffUserIds ?? [], auth);



    revalidateBranchSurfaces();

    return { ok: true, id: row.id };

  } catch (e) {

    return {

      ok: false,

      message: e instanceof Error ? e.message : "Could not create branch.",

    };

  }

}



export async function updateBranch(

  id: string,

  input: {

    name: string;

    code?: string | null;

    location?: string | null;

    phone?: string | null;

    active: boolean;

    isMain: boolean;

    staffUserIds?: string[];

  },

): Promise<BranchActionResult> {

  const auth = await requireStaff();

  if (!auth.ok) return auth;



  const name = input.name.trim();

  if (!name) return { ok: false, message: "Branch name is required." };



  const existing = await prisma.branch.findUnique({

    where: { id },

    select: { id: true },

  });

  if (!existing) return { ok: false, message: "Branch not found." };



  const code = input.code?.trim() || null;

  if (code) {

    const clash = await prisma.branch.findFirst({

      where: { code, NOT: { id } },

      select: { id: true },

    });

    if (clash) return { ok: false, message: "That branch code is already in use." };

  }



  try {

    await prisma.$transaction(async (tx) => {

      if (input.isMain) {

        await tx.branch.updateMany({

          data: { isMain: false },

          where: { isMain: true, NOT: { id } },

        });

      }

      await tx.branch.update({

        where: { id },

        data: {

          name,

          code,

          location: input.location?.trim() || null,

          phone: input.phone?.trim() || null,

          active: input.active,

          isMain: input.isMain,

        },

      });

    });



    if (input.staffUserIds) {

      await syncBranchStaff(id, input.staffUserIds, auth);

    }



    revalidateBranchSurfaces();

    return { ok: true, id };

  } catch (e) {

    return {

      ok: false,

      message: e instanceof Error ? e.message : "Could not update branch.",

    };

  }

}



export async function deleteBranch(id: string): Promise<BranchActionResult> {

  const auth = await requireStaff();

  if (!auth.ok) return auth;



  try {

    await prisma.branch.delete({ where: { id } });

    revalidateBranchSurfaces();

    return { ok: true };

  } catch (e) {

    return {

      ok: false,

      message: e instanceof Error ? e.message : "Could not delete branch.",

    };

  }

}

