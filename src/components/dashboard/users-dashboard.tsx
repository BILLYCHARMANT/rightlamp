"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  Building2,
  CalendarDays,
  ClipboardList,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  Receipt,
  Search,
  Shield,
  UploadCloud,
  User,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import type { BranchRow } from "@/lib/dashboard/branch-actions";
import type { StaffUserCard } from "@/lib/dashboard/user-queries";
import {
  ASSIGNABLE_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  formatStaffRoleLabel,
  normalizeStaffRole,
  roleRequiresBranchAssignment,
} from "@/lib/dashboard/rbac";
import {
  createStaffUser,
  deleteStaffUser,
  setStaffUserActive,
  updateStaffUser,
} from "@/lib/dashboard/user-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";
import { dashboardEcomStatCardClass } from "@/components/dashboard/ui/dashboard-ecom";

type Props = {
  users: StaffUserCard[];
  branches: BranchRow[];
  todayLabel: string;
};

type RoleFilter = "all" | StaffUserCard["role"] | "unassigned" | "inactive";

type DetailTab = "about" | "branches" | "activity";

type UserFormState = {
  name: string;
  email: string;
  password: string;
  role: StaffUserCard["role"];
  phone: string;
  jobTitle: string;
  bio: string;
  imageUrl: string;
  active: boolean;
  branchIds: string[];
};

const emptyForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  role: "BRANCH_SELLER",
  phone: "",
  jobTitle: "",
  bio: "",
  imageUrl: "",
  active: true,
  branchIds: [],
};

const ROLE_FILTERS: {
  id: RoleFilter;
  label: string;
  icon: typeof Users;
}[] = [
  { id: "all", label: "All", icon: Users },
  ...ASSIGNABLE_ROLES.map((role) => ({
    id: role as RoleFilter,
    label: ROLE_LABELS[role],
    icon: role === "ADMIN" ? Shield : User,
  })),
  { id: "unassigned", label: "Unassigned", icon: MapPin },
  { id: "inactive", label: "Inactive", icon: User },
];

function staffDisplayName(name: string | null, email: string) {
  return name?.trim() || email.split("@")[0] || email;
}

function staffInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function formatRole(role: StaffUserCard["role"]) {
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

function tenureMonths(iso: string) {
  const joined = new Date(iso);
  const now = new Date();
  return Math.max(
    0,
    (now.getFullYear() - joined.getFullYear()) * 12 +
      (now.getMonth() - joined.getMonth()),
  );
}

function tenureLabel(iso: string) {
  const months = tenureMonths(iso);
  if (months < 1) return "Joined this month";
  if (months < 12) return `${months} mo on team`;
  const years = Math.floor(months / 12);
  return `${years} yr${years === 1 ? "" : "s"} on team`;
}

function manageStatusLabel(user: StaffUserCard) {
  if (user.role === "ADMIN") return "Global access";
  if (user.role === "MAIN_STORE_MANAGER") return "Central warehouse & all branches";
  if (user.role === "PARTNER_INVESTOR") return "Read-only analytics";
  if (user.assignedBranches.length === 0) return "Unassigned";
  if (user.assignedBranches.length === 1) return user.assignedBranches[0].name;
  return `${user.assignedBranches.length} branches`;
}

function avatarTone(seed: string) {
  const tones = [
    "bg-brand/15 text-brand",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-800",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return tones[Math.abs(hash) % tones.length];
}

const AVATAR_SIZES = {
  sm: "h-10 w-10 text-xs",
  md: "h-20 w-20 text-lg",
  lg: "h-28 w-28 text-3xl",
} as const;

function StaffAvatar({
  user,
  size = "md",
}: {
  user: Pick<StaffUserCard, "name" | "email" | "imageUrl">;
  size?: keyof typeof AVATAR_SIZES;
}) {
  const sizeClass = AVATAR_SIZES[size];

  if (user.imageUrl) {
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm ${sizeClass}`}
      >
        <Image
          src={user.imageUrl}
          alt={staffDisplayName(user.name, user.email)}
          fill
          className="object-cover"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white shadow-sm ${sizeClass} ${avatarTone(user.email)}`}
    >
      {staffInitials(user.name, user.email)}
    </span>
  );
}

function ActiveToggleButton({
  user,
  className = "",
  pending,
  onToggle,
}: {
  user: StaffUserCard;
  className?: string;
  pending: boolean;
  onToggle: (user: StaffUserCard) => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => onToggle(user)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-50 ${className} ${
        user.active
          ? "border border-amber-200 bg-amber-50 text-amber-800 hover:border-amber-300"
          : "border border-success/25 bg-success/10 text-success hover:border-success/40"
      }`}
    >
      {user.active ? (
        <>
          <UserX size={14} aria-hidden />
          Deactivate
        </>
      ) : (
        <>
          <UserCheck size={14} aria-hidden />
          Activate
        </>
      )}
    </button>
  );
}

export function UsersDashboard({ users, branches, todayLabel }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(users[0]?.id ?? null);
  const [detailTab, setDetailTab] = useState<DetailTab>("about");
  const [formOpen, setFormOpen] = useState(false);
  const [viewUser, setViewUser] = useState<StaffUserCard | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter === "inactive" && user.active) return false;
      if (roleFilter !== "all" && roleFilter !== "unassigned" && roleFilter !== "inactive") {
        if (normalizeStaffRole(user.role) !== roleFilter) return false;
      }
      if (roleFilter === "unassigned" && user.assignedBranches.length > 0) {
        return false;
      }
      if (!q) return true;
      const hay = [
        user.name,
        user.email,
        user.phone,
        user.jobTitle,
        user.bio,
        formatRole(user.role),
        ...user.assignedBranches.map((b) => `${b.name} ${b.code ?? ""}`),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [users, query, roleFilter]);

  const selected =
    filtered.find((user) => user.id === selectedId) ??
    users.find((user) => user.id === selectedId) ??
    filtered[0] ??
    null;

  const filterLabel =
    ROLE_FILTERS.find((item) => item.id === roleFilter)?.label ?? "All";

  function selectUser(user: StaffUserCard) {
    setSelectedId(user.id);
    setDetailTab("about");
  }

  function openView(user: StaffUserCard) {
    selectUser(user);
    setViewUser(user);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  function openEdit(user: StaffUserCard) {
    setEditingId(user.id);
    setForm({
      name: user.name ?? "",
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone ?? "",
      jobTitle: user.jobTitle ?? "",
      bio: user.bio ?? "",
      imageUrl: user.imageUrl ?? "",
      active: user.active,
      branchIds: user.assignedBranches.map((b) => b.id),
    });
    setError("");
    setFormOpen(true);
  }

  function submitForm() {
    setError("");
    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!editingId && form.password.trim().length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password.trim() || undefined,
        role: form.role,
        phone: form.phone || null,
        jobTitle: form.jobTitle || null,
        bio: form.bio || null,
        imageUrl: form.imageUrl || null,
        active: form.active,
        branchIds: form.branchIds,
      };

      const res = editingId
        ? await updateStaffUser(editingId, payload)
        : await createStaffUser(payload);

      if (!res.ok) {
        setError(res.message);
        return;
      }

      setFormOpen(false);
      if (res.id) setSelectedId(res.id);
      router.refresh();
    });
  }

  function handleDelete(user: StaffUserCard) {
    if (!window.confirm(`Delete staff account for "${staffDisplayName(user.name, user.email)}"?`)) {
      return;
    }
    startTransition(async () => {
      const res = await deleteStaffUser(user.id);
      if (!res.ok) {
        window.alert(res.message);
        return;
      }
      if (selectedId === user.id) setSelectedId(null);
      if (viewUser?.id === user.id) setViewUser(null);
      router.refresh();
    });
  }

  function handleToggleActive(user: StaffUserCard) {
    const nextActive = !user.active;
    if (
      !window.confirm(
        `${nextActive ? "Activate" : "Deactivate"} "${staffDisplayName(user.name, user.email)}"?`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await setStaffUserActive(user.id, nextActive);
      if (!res.ok) window.alert(res.message);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
      <div className="min-w-0 flex-1 space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Team directory
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink md:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add staff profiles with photos, roles, and branch assignments.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <Plus size={16} aria-hidden />
              Add user
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm shadow-sm">
              <CalendarDays size={16} className="text-brand" aria-hidden />
              <span className="font-medium text-ink">{todayLabel}</span>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-semibold text-ink">Filter by role</p>
            <label className="relative min-w-[220px] flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, branch…"
                className="w-full rounded-xl border border-border bg-canvas py-2 pl-9 pr-3 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {ROLE_FILTERS.map(({ id, label, icon: Icon }) => {
              const active = roleFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRoleFilter(id)}
                  className={`flex min-w-[5.5rem] flex-col items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold transition ${
                    active
                      ? "bg-brand text-white shadow-sm"
                      : "bg-surface text-muted-foreground ring-1 ring-border hover:bg-canvas"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      active ? "bg-white/15" : "bg-surface-elevated ring-1 ring-border"
                    }`}
                  >
                    <Icon size={20} aria-hidden />
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-ink">
              {filterLabel} staff ({filtered.length})
            </h2>
            <Link
              href="/dashboard/branches"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Manage branches
            </Link>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((user) => {
                const activeCard = selected?.id === user.id;
                return (
                  <article
                    key={user.id}
                    className={`${dashboardEcomStatCardClass} flex flex-col px-4 pb-4 pt-6 transition hover:brightness-[0.99] ${
                      activeCard ? "ring-2 ring-brand ring-offset-2 ring-offset-canvas" : ""
                    } ${!user.active ? "opacity-70" : ""}`}
                  >
                    <button
                      type="button"
                      onClick={() => selectUser(user)}
                      className="flex w-full flex-col items-center text-left"
                    >
                      <StaffAvatar user={user} size="md" />
                      <p className="mt-4 text-center text-sm font-bold text-ink">
                        {staffDisplayName(user.name, user.email)}
                      </p>
                      <p className="mt-1 text-center text-xs text-muted-foreground">
                        {user.jobTitle?.trim() || formatRole(user.role)}
                      </p>
                      <p className="mt-2 text-center text-sm font-semibold text-brand">
                        {manageStatusLabel(user)}
                      </p>
                      {!user.active ? (
                        <span className="mt-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                          Inactive
                        </span>
                      ) : null}
                    </button>
                    <div className="mt-4 space-y-2 border-t border-border pt-3">
                      <div className="flex justify-center">
                        <DashboardTableRowActions
                          disabled={pending}
                          onView={() => openView(user)}
                          onEdit={() => openEdit(user)}
                          onDelete={() => handleDelete(user)}
                        />
                      </div>
                      <div className="flex justify-center">
                        <ActiveToggleButton
                          user={user}
                          className="w-full max-w-[11rem]"
                          pending={pending}
                          onToggle={handleToggleActive}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-14 text-center">
              <p className="text-sm text-muted-foreground">
                {users.length === 0 ? (
                  <>
                    No staff accounts yet.{" "}
                    <button
                      type="button"
                      onClick={openCreate}
                      className="font-semibold text-brand hover:underline"
                    >
                      Add your first user
                    </button>
                    .
                  </>
                ) : (
                  "No staff match this filter."
                )}
              </p>
            </div>
          )}
        </section>
      </div>

      <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-24 xl:w-[22rem]">
        {selected ? (
          <>
            <article className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Branch assignment
              </p>
              {selected.assignedBranches.length > 0 ? (
                <div className="mt-3 flex items-start gap-3">
                  <StaffAvatar user={selected} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {staffDisplayName(selected.name, selected.email)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {selected.assignedBranches.map((b) => b.name).join(", ")}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {selected.role === "ADMIN"
                    ? "Admin accounts have access across all branches."
                    : "No branch assigned yet."}
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <StaffAvatar user={selected} size="lg" />
                <h3 className="mt-4 text-lg font-bold text-ink">
                  {staffDisplayName(selected.name, selected.email)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.jobTitle?.trim() || formatRole(selected.role)} ·{" "}
                  {manageStatusLabel(selected)}
                </p>
                {!selected.active ? (
                  <span className="mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                    Inactive account
                  </span>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-canvas px-2 py-3 text-center">
                  <Building2 size={16} className="mx-auto text-brand" aria-hidden />
                  <p className="mt-2 text-base font-bold tabular-nums text-ink">
                    {selected.assignedBranches.length}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">Branches</p>
                </div>
                <div className="rounded-xl bg-canvas px-2 py-3 text-center">
                  <CalendarDays size={16} className="mx-auto text-brand" aria-hidden />
                  <p className="mt-2 text-base font-bold tabular-nums text-ink">
                    {tenureMonths(selected.createdAt)}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">Months</p>
                </div>
                <div className="rounded-xl bg-canvas px-2 py-3 text-center">
                  <ClipboardList size={16} className="mx-auto text-brand" aria-hidden />
                  <p className="mt-2 text-base font-bold tabular-nums text-ink">
                    {selected.orderCount +
                      selected.stockMovementCount +
                      selected.expenseCount}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground">Actions</p>
                </div>
              </div>

              <div className="mt-5 flex gap-4 border-b border-border text-sm">
                {(
                  [
                    ["about", "About"],
                    ["branches", "Branches"],
                    ["activity", "Activity"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDetailTab(id)}
                    className={`border-b-2 pb-2 font-semibold transition ${
                      detailTab === id
                        ? "border-brand text-brand"
                        : "border-transparent text-muted-foreground hover:text-ink"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mt-4 min-h-[8rem] text-sm leading-relaxed text-muted-foreground">
                {detailTab === "about" ? (
                  <dl className="space-y-3">
                    {selected.bio ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">
                          Profile
                        </dt>
                        <dd className="mt-1 text-ink">{selected.bio}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">
                        Email
                      </dt>
                      <dd className="mt-1 flex items-center gap-2 font-medium text-ink">
                        <Mail size={14} aria-hidden />
                        {selected.email}
                      </dd>
                    </div>
                    {selected.phone ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">
                          Phone
                        </dt>
                        <dd className="mt-1 flex items-center gap-2 text-ink">
                          <Phone size={14} aria-hidden />
                          {selected.phone}
                        </dd>
                      </div>
                    ) : null}
                    {selected.jobTitle ? (
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">
                          Job title
                        </dt>
                        <dd className="mt-1 text-ink">{selected.jobTitle}</dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">
                        Member since
                      </dt>
                      <dd className="mt-1 text-ink">
                        {formatWhen(selected.createdAt)} · {tenureLabel(selected.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase text-muted-foreground">
                        Manage status
                      </dt>
                      <dd className="mt-1 text-ink">{manageStatusLabel(selected)}</dd>
                    </div>
                  </dl>
                ) : null}

                {detailTab === "branches" ? (
                  selected.assignedBranches.length > 0 ? (
                    <ul className="space-y-2">
                      {selected.assignedBranches.map((branch) => (
                        <li
                          key={branch.id}
                          className="rounded-xl border border-border bg-canvas px-3 py-2.5"
                        >
                          <p className="font-semibold text-ink">{branch.name}</p>
                          <p className="mt-0.5 text-xs">
                            {branch.code ?? "No code"} ·{" "}
                            {branch.active ? "Active" : "Inactive"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {selected.role === "ADMIN"
                        ? "Admins are not tied to a single branch."
                        : "Assign branches when editing this profile."}
                    </p>
                  )
                ) : null}

                {detailTab === "activity" ? (
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between rounded-xl border border-border bg-canvas px-3 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <ClipboardList size={14} aria-hidden />
                        Orders logged
                      </span>
                      <span className="font-bold tabular-nums text-ink">
                        {selected.orderCount}
                      </span>
                    </li>
                    <li className="flex items-center justify-between rounded-xl border border-border bg-canvas px-3 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <Package size={14} aria-hidden />
                        Stock movements
                      </span>
                      <span className="font-bold tabular-nums text-ink">
                        {selected.stockMovementCount}
                      </span>
                    </li>
                    <li className="flex items-center justify-between rounded-xl border border-border bg-canvas px-3 py-2.5">
                      <span className="inline-flex items-center gap-2">
                        <Receipt size={14} aria-hidden />
                        Expenses recorded
                      </span>
                      <span className="font-bold tabular-nums text-ink">
                        {selected.expenseCount}
                      </span>
                    </li>
                  </ul>
                ) : null}
              </div>

              <div className="mt-5 space-y-2">
                <ActiveToggleButton
                  user={selected}
                  className="w-full"
                  pending={pending}
                  onToggle={handleToggleActive}
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => openEdit(selected)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Edit profile
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => handleDelete(selected)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-danger/30 px-4 py-2.5 text-sm font-semibold text-danger disabled:opacity-50"
                >
                  Delete user
                </button>
              </div>
            </article>
          </>
        ) : (
          <article className="rounded-2xl border border-dashed border-border bg-surface-elevated px-6 py-16 text-center">
            <Users size={28} className="mx-auto text-muted-foreground" aria-hidden />
            <p className="mt-3 text-sm text-muted-foreground">
              Select a staff member to view details.
            </p>
          </article>
        )}
      </aside>

      <PodShellModal
        isOpen={Boolean(viewUser)}
        title="Staff profile"
        onClose={() => setViewUser(null)}
        footer={
          viewUser ? (
            <>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
              >
                Close
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (viewUser) handleToggleActive(viewUser);
                }}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-50 ${
                  viewUser.active
                    ? "border border-amber-200 bg-amber-50 text-amber-800"
                    : "bg-success text-white"
                }`}
              >
                {viewUser.active ? "Deactivate" : "Activate"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  openEdit(viewUser);
                  setViewUser(null);
                }}
                className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Edit
              </button>
            </>
          ) : null
        }
      >
        {viewUser ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center">
              <StaffAvatar user={viewUser} size="lg" />
              <h3 className="mt-4 text-lg font-bold text-ink">
                {staffDisplayName(viewUser.name, viewUser.email)}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {viewUser.jobTitle?.trim() || formatRole(viewUser.role)} ·{" "}
                {manageStatusLabel(viewUser)}
              </p>
              {!viewUser.active ? (
                <span className="mt-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                  Inactive account
                </span>
              ) : null}
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium text-ink">{viewUser.email}</dd>
              </div>
              {viewUser.phone ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">Phone</dt>
                  <dd className="mt-1 text-ink">{viewUser.phone}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Role</dt>
                <dd className="mt-1 text-ink">{formatRole(viewUser.role)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Member since
                </dt>
                <dd className="mt-1 text-ink">{formatWhen(viewUser.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Manage status
                </dt>
                <dd className="mt-1 text-ink">{manageStatusLabel(viewUser)}</dd>
              </div>
              {viewUser.bio ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">Bio</dt>
                  <dd className="mt-1 text-ink">{viewUser.bio}</dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Assigned branches
                </dt>
                <dd className="mt-1 text-ink">
                  {viewUser.assignedBranches.length > 0
                    ? viewUser.assignedBranches.map((b) => b.name).join(", ")
                    : viewUser.role === "ADMIN"
                      ? "All branches (admin)"
                      : "None"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Orders</dt>
                <dd className="mt-1 tabular-nums text-ink">{viewUser.orderCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Stock moves
                </dt>
                <dd className="mt-1 tabular-nums text-ink">{viewUser.stockMovementCount}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">Expenses</dt>
                <dd className="mt-1 tabular-nums text-ink">{viewUser.expenseCount}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </PodShellModal>

      <PodShellModal
        isOpen={formOpen}
        title={editingId ? "Edit staff profile" : "Add staff user"}
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
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : editingId ? "Save changes" : "Create user"}
            </button>
          </>
        }
      >
        {error ? (
          <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <label className="relative block h-28 w-28 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border bg-muted/20">
              {form.imageUrl ? (
                <Image
                  src={form.imageUrl}
                  alt="Profile preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground">
                  <UploadCloud size={22} aria-hidden />
                  Photo
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () =>
                    setForm((f) => ({ ...f, imageUrl: reader.result as string }));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
            <div className="min-w-0 flex-1 space-y-3">
              <label className="block text-sm font-semibold">
                Photo URL (optional)
                <input
                  value={form.imageUrl.startsWith("data:") ? "" : form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://… or upload from the left"
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Upload a portrait photo or paste an image link. This appears on staff cards
                and the profile panel.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold sm:col-span-2">
              Full name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Jean Paul Mukamana"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+250 788 000 000"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Job title
              <input
                value={form.jobTitle}
                onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))}
                placeholder="e.g. Store manager"
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Role
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as StaffUserCard["role"],
                  }))
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              >
                {ASSIGNABLE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {ROLE_DESCRIPTIONS[normalizeStaffRole(form.role)]}
              </p>
            </label>
            <label className="block text-sm font-semibold sm:col-span-2">
              {editingId ? "New password (leave blank to keep)" : "Password"}
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete={editingId ? "new-password" : "new-password"}
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
          </div>

          <label className="block text-sm font-semibold">
            Bio / profile notes
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Short background, responsibilities, or shift notes…"
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            />
          </label>

          <div>
            <p className="text-sm font-semibold">Assigned branches</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {roleRequiresBranchAssignment(normalizeStaffRole(form.role))
                ? "Required for branch managers and sellers — pick their shop location."
                : "Optional — link this user to shops they oversee."}
            </p>
            {branches.length > 0 ? (
              <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto rounded-xl border border-border bg-surface p-3">
                {branches.map((branch) => {
                  const checked = form.branchIds.includes(branch.id);
                  return (
                    <li key={branch.id}>
                      <label className="flex cursor-pointer items-start gap-3 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setForm((f) => ({
                              ...f,
                              branchIds: e.target.checked
                                ? [...f.branchIds, branch.id]
                                : f.branchIds.filter((id) => id !== branch.id),
                            }));
                          }}
                          className="mt-0.5 rounded border-slate-300 text-brand"
                        />
                        <span>
                          <span className="font-medium text-ink">{branch.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {branch.code ?? "No code"} ·{" "}
                            {branch.active ? "Active" : "Inactive"}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                No branches yet.{" "}
                <Link href="/dashboard/branches" className="font-semibold text-brand hover:underline">
                  Add a branch
                </Link>{" "}
                first.
              </p>
            )}
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="rounded border-slate-300 text-brand"
            />
            Active account (can sign in)
          </label>
        </div>
      </PodShellModal>
    </div>
  );
}
