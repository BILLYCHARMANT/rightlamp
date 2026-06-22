"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronRight, Menu } from "lucide-react";
import { DashboardJumpShell } from "@/components/dashboard/dashboard-jump-menu";
import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";
import { useDashboardNav } from "@/components/dashboard/dashboard-nav-context";
import { getDashboardTitle } from "@/lib/dashboard/nav-config";

export function DashboardShellHeader() {
  const pathname = usePathname() ?? "";
  const { toggleMobileNav } = useDashboardNav();
  const title = getDashboardTitle(pathname);
  const atHome = pathname === "/dashboard" || pathname === "/dashboard/";

  if (atHome) {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-slate-200 text-muted-foreground transition hover:bg-slate-50 hover:text-ink md:hidden"
          aria-label="Open navigation"
          onClick={toggleMobileNav}
        >
          <Menu size={18} aria-hidden />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center text-xs text-slate-500">
            <li>
              {atHome ? (
                <span className="font-medium text-slate-800" aria-current="page">
                  Dashboard
                </span>
              ) : (
                <Link href="/dashboard" className="transition hover:text-slate-800">
                  Dashboard
                </Link>
              )}
            </li>
            {!atHome ? (
              <>
                <li aria-hidden className="mx-2">
                  <ChevronRight size={12} className="text-slate-400" />
                </li>
                <li className="truncate font-medium text-slate-800" aria-current="page">
                  {title}
                </li>
              </>
            ) : null}
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-4 sm:gap-6">
        <DashboardJumpShell />
        <button
          type="button"
          className="relative hidden text-slate-500 transition hover:text-slate-800 sm:inline-flex"
          aria-label="Notifications"
        >
          <Bell size={20} aria-hidden />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-brand" />
        </button>
        <DashboardUserMenu />
      </div>
    </header>
  );
}
