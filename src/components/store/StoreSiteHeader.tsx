"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function StoreSiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const navIdle =
    "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-elevated hover:text-ink";
  const navActive = "bg-surface-elevated text-brand/95";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-canvas/92 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/85">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-surface-elevated hover:text-ink sm:hidden"
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

          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/brand/logo.png"
              alt="Rightlamps"
              width={38}
              height={38}
              className="rounded-md object-contain ring-1 ring-brand/18"
              priority
            />
            <span className="hidden text-sm font-bold uppercase tracking-wide text-ink sm:inline">
              Rightlamps
            </span>
          </Link>

          <form
            action="/shop"
            method="GET"
            className="mx-auto hidden min-w-0 max-w-md flex-1 md:block lg:max-w-lg"
          >
            <label htmlFor="store-header-search" className="sr-only">
              Search products
            </label>
            <input
              id="store-header-search"
              name="q"
              type="search"
              placeholder="Search products…"
              className="h-10 w-full rounded-xl border border-border bg-surface-elevated px-4 text-sm text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
            />
          </form>

          <nav
            className="mx-auto hidden items-center gap-1 sm:flex lg:mx-0 lg:shrink-0"
            aria-label="Primary"
          >
            <Link
              href="/"
              className={`${navIdle} ${pathname === "/" ? navActive : ""}`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`${navIdle} ${pathname.startsWith("/shop") ? navActive : ""}`}
            >
              Shop
            </Link>
            <Link
              href="/custom-product"
              className={`${navIdle} ${pathname === "/custom-product" ? navActive : ""}`}
            >
              Custom
            </Link>
            <Link
              href="/sign-in"
              className={`${navIdle} ${pathname === "/sign-in" ? navActive : ""}`}
            >
              Sign in
            </Link>
            <Link
              href="/login?callbackUrl=/dashboard"
              className={`${navIdle} ${pathname === "/login" ? navActive : ""}`}
            >
              Staff
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:ml-auto sm:gap-3">
            <a
              href="tel:+250788000000"
              className="hidden items-center gap-2 lg:flex"
            >
              <span className="text-xs font-semibold text-accent">
                (+250) 788 000 000
              </span>
            </a>
            <a
              href="tel:+250788000000"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/94 text-ink shadow-md shadow-brand/10 ring-1 ring-brand/18 transition hover:bg-brand-hover"
              aria-label="Call us"
            >
              <PhoneIcon className="h-4 w-4" />
            </a>
            <Link
              href="/cart"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-accent transition hover:border-accent hover:bg-surface-elevated"
              aria-label="Shopping cart"
            >
              <CartIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-[60] sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            id="store-drawer-nav"
            className="absolute inset-y-0 left-0 flex w-[min(22rem,88vw)] flex-col gap-1 border-r border-border bg-surface p-5 shadow-2xl"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Menu
            </p>
            <form action="/shop" method="GET" className="mb-4">
              <label htmlFor="drawer-search" className="sr-only">
                Search products
              </label>
              <input
                id="drawer-search"
                name="q"
                type="search"
                placeholder="Search products…"
                className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14"
              />
            </form>
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-elevated"
              href="/"
            >
              Home
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-elevated"
              href="/shop"
            >
              Shop catalog
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-elevated"
              href="/cart"
            >
              Cart
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-elevated"
              href="/custom-product"
            >
              Request custom product
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-elevated"
              href="/sign-in"
            >
              Sign in
            </Link>
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-ink hover:bg-surface-elevated"
              href="/#footer-contact"
            >
              Contact
            </Link>
            <hr className="my-3 border-border" />
            <Link
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-accent hover:bg-surface-elevated"
              href="/login?callbackUrl=/dashboard"
            >
              Staff sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 9z"
      />
      <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
