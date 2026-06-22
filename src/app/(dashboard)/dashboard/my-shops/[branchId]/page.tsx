import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { MyShopDetailDashboard } from "@/components/dashboard/my-shops/my-shop-detail-dashboard";
import {
  canAccessOrderBranch,
  getOrderViewerScope,
  getStaffBranchIds,
  requireDashboardPath,
} from "@/lib/dashboard/rbac-server";
import { hasGlobalShopAccess } from "@/lib/dashboard/rbac";
import { getShopActivityLog, getShopDetail } from "@/lib/dashboard/shop-queries";

import type { PageParams, PageSearchParams } from "@/types/next-page";

type SearchParams = PageSearchParams<{ from?: string; to?: string; activityPage?: string }>;

function DetailFallback() {
  return <div className="p-8 text-sm text-muted-foreground">Loading shop…</div>;
}

export default async function MyShopDetailPage({
  params,
  searchParams,
}: {
  params: PageParams<{ branchId: string }>;
  searchParams: SearchParams;
}) {
  const session = await requireDashboardPath("/dashboard/my-shops");
  const { branchId } = await params;
  const sp = await searchParams;

  if (!hasGlobalShopAccess(session.role)) {
    const scope = await getOrderViewerScope();
    if (scope && !canAccessOrderBranch(branchId, scope)) {
      const assigned = await getStaffBranchIds(session.id);
      if (assigned[0]) redirect(`/dashboard/my-shops/${assigned[0]}`);
      redirect("/dashboard");
    }
  }

  const [shop, activity] = await Promise.all([
    getShopDetail(branchId, { dateFrom: sp.from, dateTo: sp.to }),
    getShopActivityLog({
      branchId,
      page: sp.activityPage ? Number(sp.activityPage) : 1,
      pageSize: 20,
    }),
  ]);

  if (!shop) notFound();

  return (
    <Suspense fallback={<DetailFallback />}>
      <MyShopDetailDashboard shop={shop} activity={activity} />
    </Suspense>
  );
}
