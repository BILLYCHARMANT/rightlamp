"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleUser, Search, ShoppingCart } from "lucide-react";
import { StoreBrandLogo } from "@/components/store/StoreBrandLogo";
import { StoreUtilityBar } from "@/components/store/StoreUtilityBar";

/** Stitch about-us---official-branding-update.html nav + shop page extras */
const defaultNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about#committee", label: "Team" },
  { href: "/shop", label: "Shop" },
  { href: "/contact", label: "Contact" },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/about#committee") return pathname === "/about";
  if (href.startsWith("/shop")) return pathname.startsWith("/shop");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StoreSiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onShop = pathname.startsWith("/shop");

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#E2E8F0] bg-[#fcf9f8]/95 shadow-sm backdrop-blur-md">
        {onShop ? <StoreUtilityBar /> : null}
        <div className="mx-auto flex h-20 max-w-[1280px] items-center gap-4 px-4 sm:px-6 lg:px-12">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2E8F0] text-[#424754] hover:text-[#c55316] lg:hidden"
            aria-expanded={open}
            aria-controls="store-drawer-nav"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
              <span className="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>

          <StoreBrandLogo showWordmark={true} shopVariant={onShop} />

          <nav
            className="mx-auto hidden items-center gap-6 lg:flex"
            aria-label="Primary"
          >
            {defaultNavLinks.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition ${
                    active
                      ? "border-b-2 border-[#c55316] pb-1 font-bold text-[#c55316]"
                      : "text-[#424754] hover:text-[#c55316]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            {onShop ? (
              <form
                action="/shop"
                method="GET"
                className="relative hidden md:block"
              >
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#727786]"
                  aria-hidden
                />
                <input
                  name="q"
                  placeholder="Search components..."
                  className="w-52 rounded-lg border border-[#E2E8F0] bg-[#f6f3f2] py-2 pl-10 pr-3 text-sm text-[#1c1b1b] focus:border-[#c55316] focus:outline-none focus:ring-2 focus:ring-[#c55316]/20 lg:w-64"
                />
              </form>
            ) : null}

            <Link
              href="/cart"
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#424754] transition hover:bg-[#e5e2e1] hover:text-[#c55316]"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={20} />
            </Link>
            {onShop ? (
              <Link
                href="/login?callbackUrl=/dashboard"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-[#424754] transition hover:bg-[#e5e2e1] hover:text-[#c55316] sm:flex"
                aria-label="Account"
              >
                <CircleUser size={20} />
              </Link>
            ) : null}
            <Link
              href="/custom-product"
              className="hidden rounded bg-[#c55316] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#a84310] sm:inline-flex"
            >
              Get Quote
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[#1c1b1b]/40 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            id="store-drawer-nav"
            className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col gap-1 bg-[#fcf9f8] p-5 shadow-xl"
          >
            <p className="mb-2 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#424754]">
              Menu
            </p>
            {defaultNavLinks.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[#c55316]/10 text-[#c55316]"
                      : "text-[#1c1b1b] hover:bg-[#f6f3f2]"
                  }`}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-3 border-[#E2E8F0]" />
            <Link
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#c55316] hover:bg-[#f6f3f2]"
              href="/custom-product"
            >
              Get Quote
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
