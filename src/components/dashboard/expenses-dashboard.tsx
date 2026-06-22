"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus, Receipt, Search } from "lucide-react";
import type { ExpenseRow } from "@/lib/dashboard/operations-queries";
import { DashboardCompactMetrics } from "@/components/dashboard/dashboard-compact-metrics";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { DashboardTablePagination } from "@/components/dashboard/ui/dashboard-table-pagination";
import { createExpense, deleteExpense, updateExpense } from "@/lib/dashboard/expense-actions";
import { DEFAULT_CURRENCY } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { usePaginatedRows } from "@/hooks/use-paginated-rows";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";

type Props = {
  expenses: ExpenseRow[];
};

const CATEGORIES = [
  "Rent",
  "Utilities",
  "Inventory",
  "Transport",
  "Marketing",
  "Payroll",
  "Other",
];

function formatWhen(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function toCsv(rows: ExpenseRow[]) {
  const header = ["title", "vendor", "category", "amount_cents", "currency", "paid_at"];
  const lines = rows.map((r) =>
    [
      `"${r.title.replace(/"/g, '""')}"`,
      `"${(r.vendor ?? "").replace(/"/g, '""')}"`,
      `"${(r.category ?? "").replace(/"/g, '""')}"`,
      r.amountCents,
      r.currency,
      r.paidAt.toISOString(),
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function ExpensesDashboard({ expenses }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [viewExpense, setViewExpense] = useState<ExpenseRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const tableAnchorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Other");
  const [paidAt, setPaidAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter((e) => {
      if (category !== "ALL" && (e.category ?? "Other") !== category) return false;
      if (!q) return true;
      const hay = `${e.title} ${e.vendor ?? ""} ${e.category ?? ""} ${e.note ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [expenses, query, category]);

  const { slice: pagedExpenses, pages, page: safePage, setPage, pageSize } =
    usePaginatedRows(filtered, tableAnchorRef);

  const totalCents = filtered.reduce((s, e) => s + e.amountCents, 0);
  const currency = filtered[0]?.currency ?? expenses[0]?.currency ?? DEFAULT_CURRENCY;

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pv-grid-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setTitle("");
    setVendor("");
    setAmount("");
    setExpenseCategory("Other");
    setPaidAt(new Date().toISOString().slice(0, 10));
    setNote("");
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (row: ExpenseRow) => {
    setEditingId(row.id);
    setTitle(row.title);
    setVendor(row.vendor ?? "");
    setAmount(String(row.amountCents / 100));
    setExpenseCategory(row.category ?? "Other");
    setPaidAt(row.paidAt.toISOString().slice(0, 10));
    setNote(row.note ?? "");
    setError("");
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleDelete = (row: ExpenseRow) => {
    if (!window.confirm(`Delete expense "${row.title}"?`)) return;
    startTransition(async () => {
      const res = await deleteExpense(row.id);
      if (!res.ok) window.alert(res.message);
      else router.refresh();
    });
  };

  const submit = () => {
    setError("");
    const major = Number(amount);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!Number.isFinite(major) || major <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    startTransition(async () => {
      const payload = {
        title,
        vendor: vendor || null,
        amountCents: Math.round(major * 100),
        currency: DEFAULT_CURRENCY,
        category: expenseCategory,
        paidAt: new Date(paidAt).toISOString(),
        note: note || null,
      };
      const res =
        modalMode === "edit" && editingId
          ? await updateExpense(editingId, payload)
          : await createExpense(payload);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setModalOpen(false);
      resetForm();
      router.refresh();
    });
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Track vendor spend and operational bills — same workflow as production{" "}
          <code className="rounded bg-surface px-1 py-0.5 text-xs">/api/expense</code>.
          Filter, export, and log new entries from here.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink"
          >
            <Download size={16} aria-hidden />
            Export CSV
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-ink"
          >
            <Plus size={16} aria-hidden />
            Log expense
          </button>
        </div>
      </div>

      <DashboardCompactMetrics
        items={[
          {
            icon: Receipt,
            label: "Filtered total",
            value: formatMoneyFromCents(totalCents, currency),
          },
          { icon: Receipt, label: "Entries", value: filtered.length },
          { icon: Receipt, label: "All time", value: expenses.length },
          {
            icon: Receipt,
            label: "Categories",
            value: new Set(expenses.map((e) => e.category ?? "Other")).size,
          },
        ]}
      />

      <section className="rounded-xl border border-border bg-surface-elevated shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-4 md:px-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCategory("ALL");
                setPage(0);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                category === "ALL"
                  ? "bg-brand text-ink"
                  : "bg-surface text-muted-foreground ring-1 ring-border"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCategory(c);
                  setPage(0);
                }}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  category === c
                    ? "bg-brand text-ink"
                    : "bg-surface text-muted-foreground ring-1 ring-border"
                }`}
              >
                {c}
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
              placeholder="Search title, vendor…"
              className="w-full rounded-lg border border-border bg-canvas py-2 pl-9 pr-3 text-sm"
            />
          </label>
        </div>

        <div ref={tableAnchorRef} className="h-0 w-full" aria-hidden />

        <table className="dash-data-table dash-data-table--flush w-full table-fixed text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 font-semibold md:px-6">Date</th>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold text-right">Amount</th>
                <th className="px-4 py-3 font-semibold text-right md:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedExpenses.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-muted-foreground md:px-6">
                    {formatWhen(row.paidAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{row.title}</p>
                    {row.note ? (
                      <p className="text-xs text-muted-foreground">{row.note}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.vendor ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium ring-1 ring-border">
                      {row.category ?? "Other"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums text-ink">
                    {formatMoneyFromCents(row.amountCents, row.currency)}
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <DashboardTableRowActions
                      disabled={pending}
                      onView={() => setViewExpense(row)}
                      onEdit={() => openEdit(row)}
                      onDelete={() => handleDelete(row)}
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
                    No expenses logged yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

        <DashboardTablePagination
          page={safePage}
          pages={pages}
          total={filtered.length}
          pageSize={pageSize}
          itemLabel="expenses"
          onPage={setPage}
        />
      </section>

      <PodShellModal
        isOpen={modalOpen}
        title={modalMode === "edit" ? "Edit expense" : "Log expense"}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-60"
            >
              {pending
                ? "Saving…"
                : modalMode === "edit"
                  ? "Save changes"
                  : "Save expense"}
            </button>
          </>
        }
      >
        {error ? (
          <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Vendor
            <input
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Amount (RWF)
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium">
            Category
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Paid on
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-medium sm:col-span-2">
            Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm"
            />
          </label>
        </div>
      </PodShellModal>

      <PodShellModal
        isOpen={Boolean(viewExpense)}
        title="Expense details"
        onClose={() => setViewExpense(null)}
        footer={
          <button
            type="button"
            onClick={() => setViewExpense(null)}
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
          >
            Close
          </button>
        }
      >
        {viewExpense ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                Title
              </dt>
              <dd className="mt-1 font-medium text-ink">{viewExpense.title}</dd>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Vendor
                </dt>
                <dd className="mt-1">{viewExpense.vendor ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Category
                </dt>
                <dd className="mt-1">{viewExpense.category ?? "Other"}</dd>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Amount
                </dt>
                <dd className="mt-1 font-semibold tabular-nums">
                  {formatMoneyFromCents(
                    viewExpense.amountCents,
                    viewExpense.currency,
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Paid on
                </dt>
                <dd className="mt-1">{formatWhen(viewExpense.paidAt)}</dd>
              </div>
            </div>
            {viewExpense.note ? (
              <div>
                <dt className="text-xs font-semibold uppercase text-muted-foreground">
                  Note
                </dt>
                <dd className="mt-1 text-muted-foreground">{viewExpense.note}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </PodShellModal>
    </div>
  );
}
