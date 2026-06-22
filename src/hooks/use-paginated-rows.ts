"use client";

import {
  useCallback,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { useViewportTablePageSize } from "@/hooks/use-viewport-table-page-size";

export function usePaginatedRows<T>(
  rows: T[],
  tableAnchorRef: RefObject<HTMLDivElement | null>,
) {
  const pageSize = useViewportTablePageSize(tableAnchorRef);
  const [page, setPageState] = useState(0);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, Math.max(0, pages - 1));

  const slice = useMemo(() => {
    const start = safePage * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, safePage, pageSize]);

  const setPage = useCallback((next: number | ((current: number) => number)) => {
    setPageState((current) => {
      const value = typeof next === "function" ? next(current) : next;
      return Math.max(0, value);
    });
  }, []);

  return {
    slice,
    pages,
    page: safePage,
    setPage,
    pageSize,
  };
}
