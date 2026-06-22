import { BranchesDashboard } from "@/components/dashboard/branches-dashboard";
import {
  listBranches,
  listStaffUsersForAssignment,
} from "@/lib/dashboard/branch-actions";

export default async function DashboardBranchesPage() {
  const [branches, staffUsers] = await Promise.all([
    listBranches(),
    listStaffUsersForAssignment(),
  ]);

  return <BranchesDashboard branches={branches} staffUsers={staffUsers} />;
}
