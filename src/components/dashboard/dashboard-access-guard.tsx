"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessDashboardPath } from "@/lib/dashboard/rbac";

/** Redirects when the signed-in role cannot access the current dashboard route. */
export function DashboardAccessGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname() ?? "";
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    const role = session?.user?.role;
    if (!canAccessDashboardPath(role, pathname)) {
      router.replace("/dashboard");
    }
  }, [status, session?.user?.role, pathname, router]);

  return <>{children}</>;
}
