"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { MapPin, Plus, Search } from "lucide-react";
import type { BranchRow, StaffUserOption } from "@/lib/dashboard/branch-actions";
import { formatStaffRoleLabel } from "@/lib/dashboard/rbac";
import {
  createBranch,
  deleteBranch,
  updateBranch,
} from "@/lib/dashboard/branch-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { DashboardTablePagination } from "@/components/dashboard/ui/dashboard-table-pagination";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";
import { usePaginatedRows } from "@/hooks/use-paginated-rows";

type Props = {
  branches: BranchRow[];
  staffUsers: StaffUserOption[];
};

type BranchFormState = {
  name: string;
  code: string;
  location: string;
  phone: string;
  active: boolean;
  isMain: boolean;
  staffUserIds: string[];
};

const emptyForm: BranchFormState = {
  name: "",
  code: "",
  location: "",
  phone: "",
  active: true,
  isMain: false,
  staffUserIds: [],
};

function staffDisplayName(name: string | null, email: string) {
  return name?.trim() || email;
}

function formatStaffRole(role: StaffUserOption["role"]) {
  return formatStaffRoleLabel(role);
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function BranchesDashboard({ branches, staffUsers }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewBranch, setViewBranch] = useState<BranchRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BranchFormState>(emptyForm);
  const tableAnchorRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return branches.filter((b) => {
      if (statusFilter === "active" && !b.active) return false;
      if (statusFilter === "inactive" && b.active) return false;
      if (!q) return true;
      const hay =
        `${b.name} ${b.code ?? ""} ${b.location ?? ""} ${b.phone ?? ""} ${b.assignedStaff
          .map((s) => `${s.name ?? ""} ${s.email}`)
          .join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [branches, query, statusFilter]);

  const { slice, pages, page, setPage, pageSize } = usePaginatedRows(
    filtered,
    tableAnchorRef,
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  function openEdit(branch: BranchRow) {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      code: branch.code ?? "",
      location: branch.location ?? "",
      phone: branch.phone ?? "",
      active: branch.active,
      isMain: branch.isMain,
      staffUserIds: branch.assignedStaff.map((s) => s.id),
    });
    setError("");
    setFormOpen(true);
  }

  function submitForm() {
    setError("");
    if (!form.name.trim()) {
      setError("Branch name is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: form.name,
        code: form.code || null,
        location: form.location || null,
        phone: form.phone || null,
        active: form.active,
        isMain: form.isMain,
        staffUserIds: form.staffUserIds,
      };
      const res = editingId
        ? await updateBranch(editingId, payload)
        : await createBranch(payload);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setFormOpen(false);
      router.refresh();
    });
  }

  function handleDelete(branch: BranchRow) {
    if (!window.confirm(`Delete branch "${branch.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteBranch(branch.id);
      if (!res.ok) window.alert(res.message);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-ink md:text-xl">
            Branches & locations
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Register each shop or warehouse. When you stock out with reason{" "}
            <strong className="font-semibold text-ink">Stock out</strong>, pick the
            destination branch receiving the items.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-ink"
        >
          <Plus size={16} aria-hidden />
          Add branch
        </button>
      </div>

      <section className="rounded-xl border border-border bg-surface-elevated shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 md:px-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "", label: "All" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Inactive" },
            ].map(({ id, label }) => (
              <button
                key={id || "all"}
                type="button"
                onClick={() => {
                  setStatusFilter(id);
                  setPage(0);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusFilter === id
                    ? "bg-brand text-ink"
                    : "bg-surface text-muted-foreground ring-1 ring-border"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="relative ml-auto min-w-[200px] flex-1 sm:max-w-xs">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search name, code, location…"
              className="w-full rounded-lg border border-border bg-canvas py-2 pl-9 pr-3 text-sm"
            />
          </label>
        </div>

        <div ref={tableAnchorRef} className="h-0 w-full" aria-hidden />

        <table className="dash-data-table dash-data-table--flush w-full min-w-[760px] text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 md:px-6">Branch</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned staff</th>
              <th className="px-4 py-3 md:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((branch) => (
              <tr key={branch.id}>
                <td className="px-4 py-3 md:px-6">
                  <p className="font-medium text-ink">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {branch.code ? branch.code : "—"}
                    {branch.isMain ? (
                      <span className="ml-2 rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand">
                        Main
                      </span>
                    ) : null}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {branch.location ?? "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">{branch.phone ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      branch.active
                        ? "bg-success/12 text-success"
                        : "bg-slate-100 text-muted-foreground"
                    }`}
                  >
                    {branch.active ? "active" : "inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {branch.assignedStaff.length > 0 ? (
                    <ul className="space-y-1">
                      {branch.assignedStaff.map((worker) => (
                        <li key={worker.id} className="text-xs leading-snug">
                          <span className="font-medium text-ink">
                            {staffDisplayName(worker.name, worker.email)}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {formatStaffRole(worker.role)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-muted-foreground">No staff assigned</span>
                  )}
                </td>
                <td className="px-4 py-3 md:px-6">
                  <DashboardTableRowActions
                    disabled={pending}
                    onView={() => setViewBranch(branch)}
                    onEdit={() => openEdit(branch)}
                    onDelete={() => handleDelete(branch)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-muted-foreground"
                >
                  No branches yet.{" "}
                  <button
                    type="button"
                    onClick={openCreate}
                    className="font-semibold text-brand hover:underline"
                  >
                    Add your first location
                  </button>
                  .
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>

        <DashboardTablePagination
          page={page}
          pages={pages}
          total={filtered.length}
          pageSize={pageSize}
          itemLabel="branches"
          onPage={setPage}
        />
      </section>

      <PodShellModal
        isOpen={formOpen}
        title={editingId ? "Edit branch" : "Add branch"}
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submitForm}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
            >
              {pending ? "Saving…" : editingId ? "Save changes" : "Create branch"}
            </button>
          </>
        }
      >
        {error ? (
          <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="space-y-4">
          <label className="block text-sm font-semibold">
            Branch name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Kigali City Center"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Code (optional)
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="e.g. KGL-01"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Location / address
            <input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Street, district, city"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded border-slate-300 text-brand"
            />
            Active branch
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.isMain}
              onChange={(e) => setForm((f) => ({ ...f, isMain: e.target.checked }))}
              className="rounded border-slate-300 text-brand"
            />
            Main warehouse / head office
          </label>
          <div>
            <p className="text-sm font-semibold">Assigned staff</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Workers who manage this shop or branch location.
            </p>
            {staffUsers.length > 0 ? (
              <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-border bg-surface p-3">
                {staffUsers.map((user) => {
                  const checked = form.staffUserIds.includes(user.id);
                  return (
                    <li key={user.id}>
                      <label className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setForm((f) => ({
                              ...f,
                              staffUserIds: e.target.checked
                                ? [...f.staffUserIds, user.id]
                                : f.staffUserIds.filter((id) => id !== user.id),
                            }));
                          }}
                          className="mt-0.5 rounded border-slate-300 text-brand"
                        />
                        <span>
                          <span className="font-medium text-ink">
                            {staffDisplayName(user.name, user.email)}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {user.email} · {formatStaffRole(user.role)}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                No staff accounts yet. Add users under{" "}
                <Link href="/dashboard/users" className="font-semibold text-brand hover:underline">
                  Users
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </PodShellModal>

      <PodShellModal
        isOpen={Boolean(viewBranch)}
        title="Branch details"
        onClose={() => setViewBranch(null)}
        footer={
          <button
            type="button"
            onClick={() => setViewBranch(null)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
          >
            Close
          </button>
        }
      >
        {viewBranch ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Name
              </dt>
              <dd className="mt-1 font-medium text-ink">{viewBranch.name}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Code
                </dt>
                <dd className="mt-1">{viewBranch.code ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1">{viewBranch.phone ?? "—"}</dd>
              </div>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
                <MapPin size={12} aria-hidden />
                Location
              </dt>
              <dd className="mt-1">{viewBranch.location ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Status
              </dt>
              <dd className="mt-1">{viewBranch.active ? "Active" : "Inactive"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Assigned staff
              </dt>
              <dd className="mt-1">
                {viewBranch.assignedStaff.length > 0 ? (
                  <ul className="space-y-1">
                    {viewBranch.assignedStaff.map((worker) => (
                      <li key={worker.id}>
                        <span className="font-medium text-ink">
                          {staffDisplayName(worker.name, worker.email)}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          · {formatStaffRole(worker.role)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">No staff assigned</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1">{formatWhen(viewBranch.createdAt)}</dd>
            </div>
          </dl>
        ) : null}
      </PodShellModal>
    </div>
  );
}
