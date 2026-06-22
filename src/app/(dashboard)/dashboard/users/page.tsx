import { UsersDashboard } from "@/components/dashboard/users-dashboard";
import { listBranches } from "@/lib/dashboard/branch-actions";
import { requireAdminSession } from "@/lib/dashboard/rbac-server";
import { listStaffUsersDetailed } from "@/lib/dashboard/user-queries";

function formatTodayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default async function DashboardUsersPage() {
  await requireAdminSession();  const [users, branches] = await Promise.all([
    listStaffUsersDetailed(),
    listBranches(),
  ]);

  return (
    <UsersDashboard users={users} branches={branches} todayLabel={formatTodayLabel()} />
  );
}
