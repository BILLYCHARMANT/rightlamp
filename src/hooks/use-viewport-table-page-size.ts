"use client";

import {
  useEffect,
  useState,
  type RefObject,
} from "react";
import {
  computePageSizeFromLayout,
  DEFAULT_PAGE_SIZE,
} from "@/lib/dashboard/responsive-page-size";

/**
 * Rows per page from how much viewport remains below `anchorRef` (table top),
 * capped by screen width breakpoints.
 */
export function useViewportTablePageSize(
  anchorRef: RefObject<HTMLElement | null>,
) {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const update = () => {
      const top = anchor.getBoundingClientRect().top;
      setPageSize(
        computePageSizeFromLayout(
          top,
          window.innerHeight,
          window.innerWidth,
        ),
      );
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(anchor);
    if (anchor.parentElement) {
      ro.observe(anchor.parentElement);
    }

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [anchorRef]);

  return pageSize;
}
