"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import {
  DASHBOARD_NAV_ITEMS,
  DASHBOARD_NAV_SECTIONS,
  DASHBOARD_SECTION_ORDER,
} from "@/lib/dashboard/nav-config";
import { useDashboardNav } from "@/components/dashboard/dashboard-nav-context";

export function DashboardSidebar() {
  const pathname = usePathname() ?? "";
  const { mobileNavOpen, setMobileNavOpen } = useDashboardNav();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  const asideInner = (
    <>
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt=""
            width={40}
            height={40}
            className="rounded-lg object-contain ring-1 ring-brand/20 shadow-sm shadow-brand/10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-ink">
              Rightlamps
            </p>
            <p className="text-[11px] text-muted-foreground">Staff terminal</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-0" aria-label="Dashboard sections">
        {DASHBOARD_SECTION_ORDER.map((sectionId) => {
          const items = DASHBOARD_NAV_ITEMS.filter(
            (i) => i.section === sectionId && i.showInNav !== false,
          );
          if (items.length === 0) return null;
          const { label: sectionLabel } = DASHBOARD_NAV_SECTIONS[sectionId];
          return (
            <div key={sectionId} className="mb-5 last:mb-0">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {sectionLabel}
              </p>
              <ul className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const active = item.match(pathname);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? "bg-brand/94 text-ink shadow-md shadow-brand/12 ring-1 ring-brand/18"
                            : "text-muted-foreground hover:bg-surface hover:text-ink"
                        }`}
                      >
                        <Icon
                          size={19}
                          className={
                            active ? "text-ink" : "text-muted-foreground opacity-90"
                          }
                          aria-hidden
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-5">
        <Link
          href="/shop"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-accent transition hover:bg-surface hover:text-accent-muted"
        >
          <ArrowLeft size={16} aria-hidden className="opacity-80" />
          Live storefront
        </Link>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] transition-opacity md:hidden ${
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-56 flex-col overflow-y-auto border-r border-border bg-surface/95 p-5 shadow-xl shadow-ink/[0.07] backdrop-blur-lg transition-transform duration-200 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {asideInner}
      </aside>
    </>
  );
}
