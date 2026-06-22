import { prisma } from "@/lib/db";
import type { StaffRole } from "@/generated/prisma/client";

export type StaffBranchAssignment = {
  id: string;
  name: string;
  code: string | null;
  active: boolean;
};

export type StaffUserCard = {
  id: string;
  email: string;
  name: string | null;
  role: StaffRole;
  imageUrl: string | null;
  phone: string | null;
  jobTitle: string | null;
  bio: string | null;
  active: boolean;
  createdAt: string;
  assignedBranches: StaffBranchAssignment[];
  orderCount: number;
  stockMovementCount: number;
  expenseCount: number;
};

function countByEmail<T extends { createdByEmail: string | null }>(
  rows: T[],
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    if (!row.createdByEmail) continue;
    map.set(row.createdByEmail, (map.get(row.createdByEmail) ?? 0) + 1);
  }
  return map;
}

export async function listStaffUsersDetailed(): Promise<StaffUserCard[]> {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }, { email: "asc" }],
    include: {
      branchAssignments: {
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
              active: true,
            },
          },
        },
      },
    },
  });

  const emails = users.map((u) => u.email);
  if (emails.length === 0) return [];

  const [orders, movements, expenses] = await Promise.all([
    prisma.order.findMany({
      where: { createdByEmail: { in: emails } },
      select: { createdByEmail: true },
    }),
    prisma.stockMovement.findMany({
      where: { createdByEmail: { in: emails } },
      select: { createdByEmail: true },
    }),
    prisma.expense.findMany({
      where: { createdByEmail: { in: emails } },
      select: { createdByEmail: true },
    }),
  ]);

  const orderCounts = countByEmail(orders);
  const movementCounts = countByEmail(movements);
  const expenseCounts = countByEmail(expenses);

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    imageUrl: user.imageUrl,
    phone: user.phone,
    jobTitle: user.jobTitle,
    bio: user.bio,
    active: user.active,
    createdAt: user.createdAt.toISOString(),
    assignedBranches: user.branchAssignments
      .map(({ branch }) => branch)
      .sort((a, b) => a.name.localeCompare(b.name)),
    orderCount: orderCounts.get(user.email) ?? 0,
    stockMovementCount: movementCounts.get(user.email) ?? 0,
    expenseCount: expenseCounts.get(user.email) ?? 0,
  }));
}
