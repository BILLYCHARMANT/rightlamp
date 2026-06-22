"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import type {
  StockMovementRow,
  SupplierRow,
} from "@/lib/dashboard/stock-shared-types";
import {
  createSupplier,
  deleteSupplier,
  importSuppliers,
  updateSupplier,
} from "@/lib/dashboard/supplier-actions";
import { PodShellModal } from "@/components/dashboard/pod-shell-modal";
import { DashboardTablePagination } from "@/components/dashboard/ui/dashboard-table-pagination";
import { DashboardTableRowActions } from "@/components/dashboard/ui/dashboard-table-row-actions";
import { usePaginatedRows } from "@/hooks/use-paginated-rows";
import {
  downloadCsv,
  downloadExcel,
  parseSuppliersCsv,
  suppliersToCsv,
} from "@/components/dashboard/stock/stock-utils";

type Props = {
  suppliers: SupplierRow[];
  movements: StockMovementRow[];
};

type SupplierFormState = {
  name: string;
  contact: string;
  email: string;
  phone: string;
  active: boolean;
};

const emptyForm: SupplierFormState = {
  name: "",
  contact: "",
  email: "",
  phone: "",
  active: true,
};

function supplierItems(
  supplierId: string,
  movements: StockMovementRow[],
): { productId: string; productName: string; totalIn: number; receipts: number }[] {
  const map = new Map<
    string,
    { productName: string; totalIn: number; receipts: number }
  >();
  for (const m of movements) {
    if (m.supplierId !== supplierId || m.delta <= 0) continue;
    const row = map.get(m.productId) ?? {
      productName: m.productName,
      totalIn: 0,
      receipts: 0,
    };
    row.totalIn += m.delta;
    row.receipts += 1;
    map.set(m.productId, row);
  }
  return [...map.entries()]
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => a.productName.localeCompare(b.productName));
}

export function StockSuppliersPanel({ suppliers, movements }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<SupplierRow | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierFormState>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tableAnchorRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return suppliers.filter((s) => {
      if (statusFilter === "active" && !s.active) return false;
      if (statusFilter === "inactive" && s.active) return false;
      if (!q) return true;
      const hay =
        `${s.name} ${s.contact ?? ""} ${s.email ?? ""} ${s.phone ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [suppliers, searchQuery, statusFilter]);

  const { slice, pages, page, setPage, pageSize } = usePaginatedRows(
    filtered,
    tableAnchorRef,
  );

  const stamp = new Date().toISOString().slice(0, 10);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  }

  function openEdit(s: SupplierRow) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      contact: s.contact ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      active: s.active,
    });
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (pending) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function submitForm() {
    setError("");
    startTransition(async () => {
      const payload = {
        name: form.name,
        contact: form.contact || null,
        email: form.email || null,
        phone: form.phone || null,
        active: form.active,
      };
      const res = editingId
        ? await updateSupplier(editingId, payload)
        : await createSupplier(payload);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      closeForm();
      router.refresh();
    });
  }

  function confirmDelete(s: SupplierRow) {
    const ok = window.confirm(
      `Delete supplier "${s.name}"? This cannot be undone.`,
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteSupplier(s.id);
      if (!res.ok) {
        window.alert(res.message);
        return;
      }
      if (viewSupplier?.id === s.id) setViewSupplier(null);
      router.refresh();
    });
  }

  function onImportFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const rows = parseSuppliersCsv(text).filter((r) => r.name.trim());
      if (rows.length === 0) {
        window.alert(
          "No valid rows found. Use a CSV with a header row: name, contact, phone, email, status.",
        );
        return;
      }
      startTransition(async () => {
        const res = await importSuppliers(rows);
        if (!res.ok) {
          window.alert(res.message);
          return;
        }
        window.alert(
          `Import complete: ${res.created} created, ${res.skipped} skipped.`,
        );
        router.refresh();
      });
    };
    reader.readAsText(file);
  }

  const viewItems = viewSupplier
    ? supplierItems(viewSupplier.id, movements)
    : [];

  return (
    <div ref={tableAnchorRef} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              downloadCsv(`suppliers-${stamp}.csv`, suppliersToCsv(filtered))
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-brand/30"
          >
            <FileText size={14} className="text-muted-foreground" aria-hidden />
            CSV
          </button>
          <button
            type="button"
            onClick={() =>
              downloadExcel(
                `suppliers-${stamp}.xls`,
                suppliersToCsv(filtered),
              )
            }
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-brand/30"
          >
            <FileSpreadsheet
              size={14}
              className="text-muted-foreground"
              aria-hidden
            />
            Excel
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm transition hover:border-brand/30 disabled:opacity-50"
          >
            <Upload size={14} className="text-muted-foreground" aria-hidden />
            Upload file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onImportFile(file);
            }}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-[12rem] flex-1 sm:max-w-[14rem]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search suppliers…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-ink shadow-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              aria-label="Filter by status"
              className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-ink shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15 sm:w-36"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[var(--dash-accent-yellow)] px-4 text-sm font-semibold text-[#2c3e50] shadow-sm transition hover:brightness-95"
          >
            <Plus size={16} aria-hidden />
            Add Supplier
          </button>
        </div>
      </div>

      <div>
        <p className="border-b border-[var(--dash-table-border)] bg-[var(--dash-table-header-bg)] py-3 text-center text-xs font-bold uppercase tracking-widest text-ink">
          List of all suppliers
        </p>
        <div className="overflow-x-auto">
          <table className="dash-data-table dash-data-table--flush w-full min-w-[760px] text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 md:px-6">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right md:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-muted-foreground"
                  >
                    No suppliers match your search — add vendors you receive stock
                    from.
                  </td>
                </tr>
              ) : (
                slice.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3 font-semibold md:px-6">
                      <span
                        className={
                          s.active ? "text-brand" : "text-muted-foreground"
                        }
                      >
                        {s.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">
                      {s.contact?.trim() ? s.contact : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink">
                      {s.phone?.trim() ? s.phone : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          s.active
                            ? "bg-success/12 text-success"
                            : "bg-slate-100 text-muted-foreground"
                        }`}
                      >
                        {s.active ? "active" : "inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums font-medium">
                      {s.itemCount}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <DashboardTableRowActions
                        disabled={pending}
                        onView={() => setViewSupplier(s)}
                        onEdit={() => openEdit(s)}
                        onDelete={() => confirmDelete(s)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DashboardTablePagination
          page={page}
          pages={pages}
          total={filtered.length}
          pageSize={pageSize}
          itemLabel="suppliers"
          onPage={setPage}
        />
      </div>

      <PodShellModal
        isOpen={formOpen}
        title={editingId ? "Edit supplier" : "Add supplier"}
        onClose={closeForm}
        footer={
          <>
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submitForm}
              className="flex-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Saving…" : editingId ? "Save changes" : "Save supplier"}
            </button>
          </>
        }
      >
        {error ? (
          <p className="mb-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <div className="space-y-4">
          <label className="block text-sm font-semibold">
            Company name
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold">
            Contact person
            <input
              value={form.contact}
              onChange={(e) =>
                setForm((f) => ({ ...f, contact: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block text-sm font-semibold">
              Phone
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="rounded border-slate-300 text-brand"
            />
            Active supplier
          </label>
        </div>
      </PodShellModal>

      <PodShellModal
        isOpen={viewSupplier !== null}
        title={viewSupplier ? viewSupplier.name : "Supplier"}
        onClose={() => setViewSupplier(null)}
        footer={
          <button
            type="button"
            onClick={() => setViewSupplier(null)}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium"
          >
            Close
          </button>
        }
      >
        {viewSupplier ? (
          <div className="space-y-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Contact
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {viewSupplier.contact?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {viewSupplier.phone?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1 font-medium text-ink">
                  {viewSupplier.email?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1 font-medium capitalize text-ink">
                  {viewSupplier.active ? "active" : "inactive"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Stock receipts
                </dt>
                <dd className="mt-1 font-medium tabular-nums text-ink">
                  {viewSupplier.receiptCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Distinct items
                </dt>
                <dd className="mt-1 font-medium tabular-nums text-ink">
                  {viewSupplier.itemCount}
                </dd>
              </div>
            </dl>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Items supplied
              </h3>
              {viewItems.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                  No stock-in movements linked to this supplier yet.
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="dash-data-table dash-data-table--flush w-full text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2 text-right">Qty received</th>
                        <th className="px-3 py-2 text-right">Receipts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewItems.map((item) => (
                        <tr key={item.productId}>
                          <td className="px-3 py-2 font-medium">{item.productName}</td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {item.totalIn}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">
                            {item.receipts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </PodShellModal>
    </div>
  );
}
