"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { OrderRow } from "@/lib/dashboard/order-types";
import type { StaffOrderFormContext } from "@/lib/dashboard/order-branches";
import type { OrderableProduct } from "@/lib/dashboard/order-types";
import type { OrdersOverviewPayload } from "@/lib/dashboard/orders-overview";
import type { OrderPeriodFilter } from "@/lib/dashboard/orders-period";
import { formatCalendarDateLabel } from "@/lib/dashboard/orders-period";
import {
  updateOrderProgress,
  cancelOrder,
  type OrderProgressField,
} from "@/lib/dashboard/order-actions";
import { OrderDetailModal } from "@/components/dashboard/orders/order-detail-modal";
import { OrdersManagementBar } from "@/components/dashboard/orders/orders-management-bar";
import { OrdersPeriodFilters } from "@/components/dashboard/orders/orders-period-filters";
import { OrdersSummaryStrip } from "@/components/dashboard/orders/orders-summary-strip";
import { OrdersTable } from "@/components/dashboard/orders/orders-table";
import { OrdersTabs } from "@/components/dashboard/orders/orders-tabs";
import { StaffOrderFormModal } from "@/components/dashboard/orders/staff-order-form-modal";
import {
  computeOrdersPeriodSummary,
  downloadOrdersCsv,
  filterOrders,
  ordersToCsv,
  type OrderTabFilter,
} from "@/components/dashboard/orders/orders-utils";
import { filterOrdersByPeriod, ORDER_PERIOD_OPTIONS } from "@/lib/dashboard/orders-period";
import { DashboardEcomCard } from "@/components/dashboard/ui/dashboard-ecom";
import { DashboardTablePagination } from "@/components/dashboard/ui/dashboard-table-pagination";
import { usePaginatedRows } from "@/hooks/use-paginated-rows";

type Props = {
  data: OrdersOverviewPayload;
  orderableProducts: OrderableProduct[];
  orderFormContext: StaffOrderFormContext;
};

export function OrdersDashboard({ data, orderableProducts, orderFormContext }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>(data.orders);
  const [tab, setTab] = useState<OrderTabFilter>("active");
  const [period, setPeriod] = useState<OrderPeriodFilter>("all");
  const [customDate, setCustomDate] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<OrderRow | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingProgress, setPendingProgress] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<string | null>(null);
  const [, startProgress] = useTransition();
  const tableAnchorRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => filterOrders(orders, tab, query, period, customDate),
    [orders, tab, query, period, customDate],
  );

  const { slice, pages, page: safePage, setPage, pageSize } =
    usePaginatedRows(filtered, tableAnchorRef);

  const periodSummary = useMemo(() => {
    const periodOrders = filterOrdersByPeriod(orders, period, customDate);
    return computeOrdersPeriodSummary(periodOrders);
  }, [orders, period, customDate]);

  const periodLabel = useMemo(() => {
    if (customDate) return formatCalendarDateLabel(customDate);
    return (
      ORDER_PERIOD_OPTIONS.find((o) => o.id === period)?.label ?? "All time"
    );
  }, [period, customDate]);

  function patchOrder(updated: OrderRow) {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o)),
    );
    setDetail((prev) => (prev?.id === updated.id ? updated : prev));
  }

  function handleProgressChange(
    orderId: string,
    field: OrderProgressField,
    value: boolean,
  ) {
    setPendingProgress(orderId);
    startProgress(async () => {
      const result = await updateOrderProgress(orderId, field, value);
      setPendingProgress(null);
      if (!result.ok) {
        window.alert(result.message);
        return;
      }
      patchOrder(result.order);
      router.refresh();
    });
  }

  function handleCancel(order: OrderRow) {
    if (
      !window.confirm(
        `Cancel order ${order.id}? This marks the order as cancelled.`,
      )
    ) {
      return;
    }
    setPendingCancel(order.id);
    startProgress(async () => {
      const result = await cancelOrder(order.id);
      setPendingCancel(null);
      if (!result.ok) {
        window.alert(result.message);
        return;
      }
      patchOrder(result.order);
      router.refresh();
    });
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelected((prev) => {
      const allOnPage = ids.every((id) => prev.has(id));
      const next = new Set(prev);
      if (allOnPage) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const resetPage = () => setPage(0);

  const onExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadOrdersCsv(`pv-grid-orders-${stamp}.csv`, ordersToCsv(filtered));
  };

  return (
    <div className="space-y-5">
      <OrdersManagementBar
        onExport={onExport}
        onCreate={() => setCreateOpen(true)}
      />

      <DashboardEcomCard className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
            <OrdersTabs
              tab={tab}
              onChange={(next) => {
                setTab(next);
                resetPage();
              }}
            />
            <OrdersPeriodFilters
              period={period}
              customDate={customDate}
              onPeriodChange={(next) => {
                setPeriod(next);
                resetPage();
              }}
              onCustomDateChange={(date) => {
                setCustomDate(date);
                resetPage();
              }}
            />
          </div>

          <label className="relative w-full shrink-0 lg:w-64">
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
                resetPage();
              }}
              placeholder="Search orders..."
              className="w-full rounded-sm border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-ink placeholder:text-muted-foreground focus:border-[var(--dash-teal)] focus:outline-none focus:ring-1 focus:ring-[var(--dash-teal)] sm:text-sm"
            />
          </label>
        </div>

        <OrdersSummaryStrip
          summary={periodSummary}
          periodLabel={periodLabel}
        />

        <div ref={tableAnchorRef} className="overflow-x-auto">
          <OrdersTable
            rows={slice}
            selected={selected}
            pendingProgress={pendingProgress}
            pendingCancel={pendingCancel}
            onToggle={toggleSelect}
            onToggleAll={toggleSelectAll}
            onView={setDetail}
            onEdit={setDetail}
            onCancel={handleCancel}
            onProgressChange={handleProgressChange}
          />
        </div>

        <DashboardTablePagination
          page={safePage}
          pages={pages}
          total={filtered.length}
          pageSize={pageSize}
          itemLabel="orders"
          extra={selected.size > 0 ? ` · ${selected.size} selected` : undefined}
          onPage={setPage}
        />
      </DashboardEcomCard>

      <OrderDetailModal
        order={detail}
        onClose={() => setDetail(null)}
        onProgressChange={handleProgressChange}
        progressDisabled={detail ? pendingProgress === detail.id : false}
      />

      <StaffOrderFormModal
        isOpen={createOpen}
        products={orderableProducts}
        orderFormContext={orderFormContext}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
