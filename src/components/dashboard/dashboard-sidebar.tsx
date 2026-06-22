"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { getVisibleNavItems } from "@/lib/dashboard/nav-config";
import { stitchImages } from "@/lib/company/site-content";
import { useDashboardNav } from "@/components/dashboard/dashboard-nav-context";
import { useSession } from "next-auth/react";

export function DashboardSidebar() {
  const pathname = usePathname() ?? "";
  const { mobileNavOpen, setMobileNavOpen } = useDashboardNav();
  const { data: session } = useSession();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname, setMobileNavOpen]);

  const navItems = getVisibleNavItems(session?.user?.role);

  const asideInner = (
    <>
      <div className="border-b border-slate-700 p-6">
        <Link href="/dashboard" className="mx-auto block w-fit">
          <Image
            src={stitchImages.brandLogo}
            alt="PV-GRID Logo"
            width={200}
            height={64}
            className="h-16 w-auto object-contain brightness-110"
            priority
          />
        </Link>
      </div>

      <nav
        className="dash-sidebar-scroll flex flex-1 flex-col overflow-y-auto py-4"
        aria-label="Dashboard"
      >
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center rounded-sm px-4 py-3 text-sm uppercase tracking-wider transition-colors ${
                    active
                      ? "dash-nav-active"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    aria-hidden
                    className={`mr-3 shrink-0 ${
                      active ? "text-[#1a202c]" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="space-y-2 border-t border-slate-700 p-4">
        <Link
          href="/shop"
          className="flex items-center px-4 py-2 text-sm text-slate-300 transition-colors hover:text-[var(--dash-teal)]"
        >
          <ExternalLink size={14} className="mr-3 shrink-0" aria-hidden />
          Live storefront
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center px-4 py-2 text-sm text-red-400 transition-colors hover:text-red-300"
        >
          <LogOut size={16} className="mr-3 shrink-0" aria-hidden />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity md:hidden ${
          mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileNavOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-64 flex-col bg-[var(--dash-sidebar)] text-slate-300 shadow-xl transition-transform duration-200 md:translate-x-0 ${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {asideInner}
      </aside>
    </>
  );
}
