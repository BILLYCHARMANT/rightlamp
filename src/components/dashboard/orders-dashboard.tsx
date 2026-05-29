"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Plus,
  Search,
  ShoppingBag,
  XCircle,
} from "lucide-react";
import {
  DEMO_ORDERS,
  type DemoOrder,
  type DemoOrderStatus,
} from "@/lib/dashboard/demo-data";
import { OrderStatusBadge } from "@/components/dashboard/order-status-badge";
import { DashboardCompactMetrics } from "@/components/dashboard/dashboard-compact-metrics";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

const PAGE_SIZE = 7;

const FILTERS: { key: DemoOrderStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "PROCESSING", label: "Processing" },
  { key: "FULFILLED", label: "Fulfilled" },
  { key: "CANCELLED", label: "Cancelled" },
];

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function ordersToCsv(rows: DemoOrder[]) {
  const header = [
    "id",
    "customer",
    "channel",
    "lines",
    "total_cents",
    "currency",
    "status",
    "placed_at",
  ];
  const lines = rows.map((o) =>
    [
      o.id,
      `"${o.customer.replace(/"/g, '""')}"`,
      `"${o.channel.replace(/"/g, '""')}"`,
      `"${o.lineSummary.replace(/"/g, '""')}"`,
      o.totalCents,
      o.currency,
      o.status,
      o.placedAt,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function OrdersDashboard() {
  const [status, setStatus] = useState<DemoOrderStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<DemoOrder | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_ORDERS.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      const hay = `${o.id} ${o.customer} ${o.channel} ${o.lineSummary}`.toLowerCase();
      return hay.includes(q);
    }).sort(
      (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime(),
    );
  }, [status, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const counts = useMemo(() => {
    const base = {
      PENDING: 0,
      PROCESSING: 0,
      FULFILLED: 0,
      CANCELLED: 0,
    };
    for (const o of DEMO_ORDERS) {
      base[o.status] += 1;
    }
    return base;
  }, []);

  const exportCsv = () => {
    const blob = new Blob([ordersToCsv(filtered)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rightlamps-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Filters, KPI strip, and dense table — staff-terminal workflow. Demo data
            only until orders persist in your stack.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground"
            title="Create walk-in order when POS module ships"
          >
            <Plus size={18} aria-hidden />
            New order
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-brand/35"
          >
            <Download size={18} aria-hidden />
            Export
          </button>
        </div>
      </div>

      <DashboardCompactMetrics
        items={[
          { icon: ShoppingBag, label: "Pending", value: counts.PENDING },
          { icon: Clock, label: "Processing", value: counts.PROCESSING },
          { icon: CheckCircle2, label: "Fulfilled", value: counts.FULFILLED },
          { icon: XCircle, label: "Cancelled", value: counts.CANCELLED },
        ]}
      />

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface-elevated p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setStatus(f.key);
                setPage(0);
              }}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                status === f.key
                  ? "bg-brand/94 text-ink ring-1 ring-brand/15"
                  : "bg-surface text-muted-foreground ring-1 ring-border hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[220px] flex-1 md:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search customer, reference, channel…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold md:px-6">Reference</th>
                <th className="px-4 py-3 font-semibold md:px-6">Customer</th>
                <th className="px-4 py-3 font-semibold md:px-6">Lines</th>
                <th className="px-4 py-3 font-semibold md:px-6">Total</th>
                <th className="px-4 py-3 font-semibold md:px-6">Status</th>
                <th className="px-4 py-3 font-semibold md:px-6">When</th>
                <th className="px-4 py-3 font-semibold md:px-6"> </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {slice.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center text-muted-foreground"
                  >
                    No orders match these filters.
                  </td>
                </tr>
              ) : (
                slice.map((o) => (
                  <tr
                    key={o.id}
                    className="cursor-pointer bg-surface-elevated/50 hover:bg-surface-elevated"
                    onClick={() => setDetail(o)}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-accent md:px-6">
                      {o.id}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <div className="font-medium text-ink">{o.customer}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.channel}
                      </div>
                    </td>
                    <td className="max-w-[240px] px-4 py-3 text-muted-foreground md:px-6">
                      <span className="line-clamp-2">{o.lineSummary}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums md:px-6">
                      {formatMoneyFromCents(o.totalCents, o.currency)}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground md:px-6">
                      {formatWhen(o.placedAt)}
                    </td>
                    <td className="px-4 py-3 md:px-6">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-ink hover:border-accent hover:text-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetail(o);
                        }}
                      >
                        <Eye size={14} aria-hidden />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 md:px-6">
          <p className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-ink">
              {filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1}
              –
              {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
            </span>{" "}
            of <span className="font-semibold text-ink">{filtered.length}</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={safePage <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={safePage >= pages - 1}
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {detail ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-[2px] sm:items-center"
          role="dialog"
          aria-modal
          aria-labelledby="order-detail-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close"
            onClick={() => setDetail(null)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-surface-elevated p-6 shadow-xl">
            <h3 id="order-detail-title" className="font-mono text-lg font-bold text-accent">
              {detail.id}
            </h3>
            <p className="mt-1 text-sm font-semibold text-ink">{detail.customer}</p>
            <p className="text-xs text-muted-foreground">{detail.channel}</p>
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Lines
                </p>
                <p className="mt-1 text-sm text-ink">{detail.lineSummary}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold tabular-nums text-ink">
                  {formatMoneyFromCents(detail.totalCents, detail.currency)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <OrderStatusBadge status={detail.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                Placed {formatWhen(detail.placedAt)}
              </p>
            </div>
            <button
              type="button"
              className="mt-6 w-full rounded-full bg-brand/94 py-2.5 text-sm font-semibold text-ink ring-1 ring-brand/15"
              onClick={() => setDetail(null)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
