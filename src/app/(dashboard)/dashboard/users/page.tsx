import { prisma } from "@/lib/db";

export default async function DashboardUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6 p-4 md:p-8">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Staff accounts for this app (NextAuth credentials). Production{" "}
        <a
          href="https://www.rightlamps.com/signin"
          className="font-medium text-accent hover:text-accent-muted"
          target="_blank"
          rel="noreferrer"
        >
          rightlamps.com/signin
        </a>{" "}
        also gates inventory and orders — customer accounts will merge here when APIs
        are shared.
      </p>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
        <div className="border-b border-border px-4 py-3 md:px-6">
          <h2 className="text-sm font-semibold text-ink">Staff users</h2>
          <p className="text-xs text-muted-foreground">{users.length} records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold md:px-6">Email</th>
                <th className="px-4 py-3 font-semibold md:px-6">Name</th>
                <th className="px-4 py-3 font-semibold md:px-6">Role</th>
                <th className="px-4 py-3 font-semibold md:px-6">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No users — run{" "}
                    <code className="rounded bg-surface px-1 font-mono ring-1 ring-border">
                      npm run db:seed
                    </code>
                    .
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="bg-surface-elevated/40">
                    <td className="px-4 py-3 font-mono text-xs md:px-6">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 text-ink md:px-6">
                      {u.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground md:px-6">
                      {u.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
