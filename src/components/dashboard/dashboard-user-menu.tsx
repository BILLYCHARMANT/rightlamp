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
        className="h-8 w-28 animate-pulse rounded-sm bg-slate-100"
        aria-hidden
      />
    );
  }

  const email = session?.user?.email;
  const name = session?.user?.name ?? "Administrator";
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
    <div className="relative border-l border-slate-200 pl-4 sm:pl-6" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center text-left transition"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-orange-200 bg-orange-100 text-xs font-bold text-brand">
          {initials}
        </span>
        <span className="hidden min-w-0 flex-col sm:flex">
          <span className="truncate text-xs font-bold leading-tight text-slate-800">
            {name}
          </span>
          {email ? (
            <span className="truncate text-[10px] text-slate-500">{email}</span>
          ) : null}
        </span>
        <ChevronDown
          size={16}
          className={`ml-2 hidden shrink-0 text-slate-400 transition group-hover:text-slate-600 sm:block ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 rounded-sm border border-slate-200 bg-white py-2 shadow-[4px_4px_0_0_rgba(0,0,0,0.05)]"
        >
          <div className="border-b border-slate-100 px-4 pb-3 pt-2 sm:hidden">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {email ? (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
          </div>
          {role ? (
            <div className="px-4 py-2">
              <span className="inline-flex rounded-sm border border-slate-200 bg-slate-50 px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-wider text-slate-600">
                {role}
              </span>
            </div>
          ) : null}
          <Link
            href="/shop"
            role="menuitem"
            className="block px-4 py-2 text-sm text-[var(--dash-teal)] hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            View storefront
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
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
