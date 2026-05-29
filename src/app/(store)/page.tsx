import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { FeaturedProducts } from "@/components/store/FeaturedProducts";
import { ProductGridSkeleton } from "@/components/store/ProductGridSkeleton";
import { storeDisplay } from "@/components/store/store-fonts";

export default function StoreHomePage() {
  return (
    <>
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
            Welcome
          </p>
          <h1
            className={`${storeDisplay.className} mt-3 text-4xl font-semibold leading-[1.08] text-ink sm:text-5xl`}
          >
            Explore our collections
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Premium lighting solutions for every environment — trade and retail
            across Rwanda.
          </p>
          <p className="mt-2 text-sm font-medium text-accent">
            Contact us for showroom hours & appointments
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/custom-product"
              className="inline-flex items-center justify-center rounded-full bg-brand/94 px-8 py-3.5 text-sm font-semibold text-ink shadow-md shadow-brand/10 ring-1 ring-brand/15 transition hover:bg-brand-hover"
            >
              Request custom product
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              Browse catalog
            </Link>
          </div>
        </div>

        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand/8 via-surface-elevated to-muted ring-1 ring-brand/9">
          <Image
            src="/brand/logo.png"
            alt=""
            fill
            className="object-contain p-12 opacity-95"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,191,255,0.12),transparent_55%)]" />
        </div>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="mb-8 h-10 w-56 animate-pulse rounded-xl bg-surface-elevated" />
      <ProductGridSkeleton count={8} />
    </section>
  );
}
