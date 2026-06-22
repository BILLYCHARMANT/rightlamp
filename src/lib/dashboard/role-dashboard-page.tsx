import "server-only";

import { redirect } from "next/navigation";
import { DashboardAnalyticsHome } from "@/components/dashboard/analytics/dashboard-analytics-home";
import {
  BranchManagerHome,
  BranchSellerHome,
  MainStoreManagerHome,
  PartnerInvestorHome,
  roleLabelFromSession,
} from "@/components/dashboard/role-homes/role-dashboard-homes";
import { getDashboardAnalyticsPayload } from "@/lib/dashboard/dashboard-analytics-data";
import { getDashboardHomePayload } from "@/lib/dashboard/dashboard-home";
import { getDashboardHomeVariant } from "@/lib/dashboard/rbac";
import {
  getDashboardSession,
  getStaffBranchIds,
} from "@/lib/dashboard/rbac-server";
import { getShopDetail, getShopsOverview } from "@/lib/dashboard/shop-queries";
import { prisma } from "@/lib/db";

export async function RoleDashboardHome() {
  const session = await getDashboardSession();
  if (!session) redirect("/login");

  const variant = getDashboardHomeVariant(session.role);
  const roleLabel = roleLabelFromSession(session.role);

  if (variant === "admin") {
    const data = await getDashboardAnalyticsPayload();
    return <DashboardAnalyticsHome data={data} />;
  }

  if (variant === "partner") {
    const shops = await getShopsOverview({ pageSize: 50 });
    return <PartnerInvestorHome roleLabel={roleLabel} shops={shops} />;
  }

  const [home, branchIds] = await Promise.all([
    getDashboardHomePayload(),
    getStaffBranchIds(session.id),
  ]);
  const primaryBranchId = branchIds[0] ?? null;
  const primaryBranch = primaryBranchId
    ? await prisma.branch.findUnique({
        where: { id: primaryBranchId },
        select: { id: true, name: true },
      })
    : null;

  if (variant === "main_store") {
    return <MainStoreManagerHome roleLabel={roleLabel} home={home} />;
  }

  if (variant === "branch_manager") {
    const shop = primaryBranchId ? await getShopDetail(primaryBranchId) : null;
    const shopStats = shop
      ? {
          shops: [
            {
              id: shop.id,
              name: shop.name,
              code: shop.code,
              location: shop.location,
              phone: shop.phone,
              active: shop.active,
              isMain: shop.isMain,
              createdAt: shop.createdAt,
              assignedInventoryCostCents: shop.assignedInventoryCostCents,
              totalSalesCents: shop.totalSalesCents,
              totalProfitCents: shop.totalProfitCents,
              productsAssigned: shop.productsAssigned,
              productsSold: shop.productsSold,
              remainingStock: shop.remainingStock,
              managers: shop.managers,
              currency: shop.currency,
            },
          ],
          total: 1,
          page: 1,
          pageSize: 1,
          totals: {
            assignedInventoryCostCents: shop.assignedInventoryCostCents,
            totalSalesCents: shop.totalSalesCents,
            totalProfitCents: shop.totalProfitCents,
            productsAssigned: shop.productsAssigned,
            productsSold: shop.productsSold,
            remainingStock: shop.remainingStock,
          },
        }
      : null;
    return (
      <BranchManagerHome
        roleLabel={roleLabel}
        home={home}
        branchName={primaryBranch?.name ?? null}
        branchId={primaryBranchId}
        shopStats={shopStats}
      />
    );
  }

  return (
    <BranchSellerHome
      roleLabel={roleLabel}
      home={home}
      branchName={primaryBranch?.name ?? null}
    />
  );
}
