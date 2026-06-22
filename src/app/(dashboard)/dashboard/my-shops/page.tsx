import { redirect } from "next/navigation";
import { Suspense } from "react";
import { MyShopsDashboard } from "@/components/dashboard/my-shops/my-shops-dashboard";
import { getStaffBranchIds, requireDashboardPath } from "@/lib/dashboard/rbac-server";
import { getShopsOverview } from "@/lib/dashboard/shop-queries";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function MyShopsPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requireDashboardPath("/dashboard/my-shops");

  if (session.role === "BRANCH_MANAGER") {
    const branchIds = await getStaffBranchIds(session.id);
    if (branchIds[0]) {
      redirect(`/dashboard/my-shops/${branchIds[0]}`);
    }
  }

  const params = await searchParams;

  const data = await getShopsOverview({
    query: params.q,
    status:
      params.status === "active" || params.status === "inactive" ? params.status : "all",
    dateFrom: params.from,
    dateTo: params.to,
    page: params.page ? Number(params.page) : 1,
    pageSize: 12,
  });

  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading shops…</div>}>
      <MyShopsDashboard data={data} />
    </Suspense>
  );
}
