"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import {
  DASHBOARD_NAV_ITEMS,
  DASHBOARD_NAV_SECTIONS,
  DASHBOARD_SECTION_ORDER,
  dashboardJumpMatches,
  type DashboardNavItem,
  type DashboardNavSectionId,
} from "@/lib/dashboard/nav-config";
import { useSession } from "next-auth/react";

function sectionSort(a: DashboardNavItem, b: DashboardNavItem): number {
  const ia = DASHBOARD_NAV_ITEMS.indexOf(a);
  const ib = DASHBOARD_NAV_ITEMS.indexOf(b);
  return ia - ib;
}

function DashboardJumpMenuDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const filtered = useMemo(
    () => dashboardJumpMatches(query, session?.user?.role),
    [query, session?.user?.role],
  );

  const grouped = useMemo(() => {
    const map = new Map<DashboardNavSectionId, DashboardNavItem[]>();
    for (const item of filtered) {
      const list = map.get(item.section) ?? [];
      list.push(item);
      map.set(item.section, list);
    }
    for (const [, list] of map) list.sort(sectionSort);
    return map;
  }, [filtered]);

  const close = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-ink/40 px-4 pt-[min(12vh,6rem)] backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label="Jump to anywhere"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="flex max-h-[min(70vh,540px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl shadow-ink/15 ring-1 ring-ink/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <label className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="shrink-0 text-muted-foreground" size={18} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            autoComplete="off"
            placeholder="Jump to…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-canvas px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            esc
          </kbd>
        </label>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No matches — try another word.
            </p>
          ) : (
            DASHBOARD_SECTION_ORDER.map((sectionId) => {
              const items = grouped.get(sectionId);
              if (!items?.length) return null;
              const meta = DASHBOARD_NAV_SECTIONS[sectionId];
              return (
                <div key={sectionId} className="mb-3 last:mb-0">
                  <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {meta.label}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={close}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-brand/12 hover:text-ink"
                          >
                            <Icon
                              size={18}
                              className="shrink-0 text-muted-foreground"
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 font-medium text-ink">
                              {item.label}
                            </span>
                            <ArrowRight
                              size={14}
                              className="shrink-0 text-muted-foreground opacity-60"
                              aria-hidden
                            />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          )}
        </div>

        <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          Same areas as the sidebar — grouped by how crews usually work the shift.
        </p>
      </div>
    </div>
  );
}

export function DashboardJumpShell() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-sm bg-slate-100 px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:bg-slate-200/80 hover:text-ink lg:flex lg:w-72"
        aria-label="Open jump menu"
      >
        <Search size={14} aria-hidden className="shrink-0 opacity-70" />
        <span className="flex-1 truncate">Jump anywhere… (⌘K)</span>
      </button>

      <DashboardJumpMenuDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
