import Link from "next/link";
import {
  getCachedPublishedCatalog,
} from "@/lib/store/published-catalog";
import { ProductCard } from "./ProductCard";
import { storeDisplay } from "@/components/store/store-fonts";

export async function FeaturedProducts() {
  let products;
  try {
    products = await getCachedPublishedCatalog();
  } catch {
    return (
      <section className="mt-12 border-t border-border pt-10">
        <div className="text-center">
          <p className="rounded-xl border border-border bg-surface px-5 py-4 text-sm text-muted-foreground">
            Catalog couldn&apos;t load. Check your database connection{" "}
            <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-sm text-ink ring-1 ring-border">
              DATABASE_URL
            </code>{" "}
            and try again.
          </p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mt-12 border-t border-border pt-10">
        <div className="max-w-2xl">
          <h2
            className={`${storeDisplay.className} text-3xl font-semibold tracking-tight text-ink sm:text-4xl`}
          >
            Our catalog
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            No published products yet. Create SKUs in the staff dashboard and mark
            them <span className="font-medium text-ink">Live on storefront</span>{" "}
            to show them here and in the shop.
          </p>
          <Link
            href="/dashboard/products"
            className="mt-6 inline-flex rounded-full border border-brand/40 bg-brand/10 px-6 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/18"
          >
            Open products
          </Link>
        </div>
      </section>
    );
  }

  const inStock = products.filter((p) => p.countInStock > 0);
  const showcase =
    inStock.length >= 8 ? inStock.slice(0, 12) : products.slice(0, 12);

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2
            className={`${storeDisplay.className} text-3xl font-semibold tracking-tight text-ink sm:text-4xl`}
          >
            Our catalog
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Published inventory from your dashboard — lighting and electrical SKUs
            in high-contrast cards with Rightlamps orange and cyan accents.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex rounded-full border border-brand/40 bg-transparent px-6 py-2.5 text-sm font-semibold text-brand/95 transition hover:border-brand/55 hover:bg-brand/12 hover:text-ink"
        >
          View full catalog
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
        {showcase.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
