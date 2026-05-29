"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

export function DashboardUserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (status === "loading") {
    return (
      <div
        className="h-10 w-10 animate-pulse rounded-full bg-surface ring-1 ring-border"
        aria-hidden
      />
    );
  }

  const email = session?.user?.email;
  const name = session?.user?.name;
  const role = session?.user?.role;

  const initials = (() => {
    const raw = (name ?? email ?? "U").trim();
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return raw.slice(0, 2).toUpperCase();
  })();

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border bg-surface-elevated py-1 pl-1 pr-2 text-left transition hover:border-brand/35 hover:bg-surface sm:pr-3"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/12 text-xs font-bold text-brand ring-1 ring-brand/15">
          {initials}
        </span>
        <span className="hidden min-w-0 max-w-[10rem] flex-col text-xs leading-tight sm:flex">
          {name ? (
            <span className="truncate font-semibold text-ink">{name}</span>
          ) : null}
          {email ? (
            <span className="truncate text-muted-foreground">{email}</span>
          ) : null}
        </span>
        <ChevronDown
          size={16}
          className={`hidden shrink-0 text-muted-foreground transition sm:block ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-surface-elevated py-2 shadow-lg shadow-ink/10 ring-1 ring-ink/[0.04]"
        >
          <div className="border-b border-border px-4 pb-3 pt-2 sm:hidden">
            {name ? (
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
            ) : null}
            {email ? (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
          </div>
          {role ? (
            <div className="px-4 py-2">
              <span className="inline-flex rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                {role}
              </span>
            </div>
          ) : null}
          <Link
            href="/shop"
            role="menuitem"
            className="block px-4 py-2 text-sm text-accent hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            View storefront
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger hover:bg-danger/10"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut size={16} aria-hidden />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
