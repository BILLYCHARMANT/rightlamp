"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { DashboardJumpShell } from "@/components/dashboard/dashboard-jump-menu";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { useDashboardNav } from "@/components/dashboard/dashboard-nav-context";
import { getDashboardTitle } from "@/lib/dashboard/nav-config";

export function DashboardShellHeader() {
  const pathname = usePathname() ?? "";
  const { toggleMobileNav } = useDashboardNav();
  const title = getDashboardTitle(pathname);
  const atHome = pathname === "/dashboard" || pathname === "/dashboard/";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/88 backdrop-blur-lg supports-[backdrop-filter]:bg-canvas/78">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:gap-4 md:px-8 md:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface-elevated hover:text-ink md:hidden"
            aria-label="Open navigation"
            onClick={toggleMobileNav}
          >
            <Menu size={20} aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            {!atHome ? (
              <nav aria-label="Breadcrumb" className="hidden md:block">
                <ol className="mb-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
                  <li>
                    <Link
                      href="/dashboard"
                      className="transition hover:text-ink hover:underline"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li aria-hidden className="text-muted-foreground/70">
                    /
                  </li>
                  <li className="truncate font-medium text-ink" aria-current="page">
                    {title}
                  </li>
                </ol>
              </nav>
            ) : (
              <p className="mb-1 hidden text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground md:block">
                Overview
              </p>
            )}
            <h1 className="truncate text-xl font-bold tracking-tight text-ink md:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-end gap-2 sm:w-auto sm:justify-start">
          <DashboardJumpShell />
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-surface-elevated hover:text-ink"
            aria-label="Alerts (coming soon)"
          >
            <Bell size={18} aria-hidden />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand ring-2 ring-canvas" />
          </button>
          <DashboardUserMenu />
        </div>
      </div>
    </header>
  );
}
