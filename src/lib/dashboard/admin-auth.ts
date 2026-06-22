import "server-only";

/** @deprecated Import from `@/lib/dashboard/rbac-server` instead. */
export {
  getDashboardSession as getAdminSession,
  requireAdminSession,
} from "@/lib/dashboard/rbac-server";

import { getDashboardSession } from "@/lib/dashboard/rbac-server";
import { canManageUsers } from "@/lib/dashboard/rbac";

export async function assertAdmin(): Promise<
  | { ok: true; admin: Awaited<ReturnType<typeof getDashboardSession>> & object }
  | { ok: false; message: string }
> {
  const admin = await getDashboardSession();
  if (!admin || !canManageUsers(admin.role)) {
    return { ok: false, message: "Admin access required." };
  }
  return { ok: true, admin };
}
