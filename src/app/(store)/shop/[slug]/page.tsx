import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/company/brand-assets";
import { formatRetailPrice } from "@/lib/rightlamps/format-price";
import { getPublishedProductBySlug } from "@/lib/store/published-catalog";

import type { PageParams } from "@/types/next-page";

type Params = PageParams<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const product = await getPublishedProductBySlug(decoded);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} · PV-GRID`,
    description: product.description ?? product.name,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const product = await getPublishedProductBySlug(decoded);
  if (!product) notFound();

  const stockLabel =
    product.countInStock > 0
      ? `${product.countInStock} available`
      : "Currently out of stock";

  const priceCurrency = product.currency ?? "RWF";

  return (
    <main className="mx-auto flex-1 max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/shop"
        className="inline-flex text-sm font-semibold text-accent hover:text-accent-muted"
      >
        ← Back to shop
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-border bg-surface-muted shadow-card">
          {product.image && product.image !== BRAND_LOGO ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8"
              priority
            />
          ) : (
            <Image
              src={BRAND_LOGO}
              alt={BRAND_LOGO_ALT}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-10"
              priority
            />
          )}
        </div>

        <div className="flex flex-col">
          {product.category ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
              {product.category}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          {product.brand ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Brand{" "}
              <span className="font-semibold text-ink">{product.brand}</span>
            </p>
          ) : null}

          <p className="mt-6 text-3xl font-bold tracking-tight text-brand/92">
            {formatRetailPrice(product.price, priceCurrency)}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">{stockLabel}</p>

          {product.description ? (
            <p className="mt-8 whitespace-pre-wrap border-l-4 border-accent pl-5 text-base leading-relaxed text-muted-foreground">
              {product.description}
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/custom-product"
              className="inline-flex rounded-full bg-brand/94 px-8 py-3 text-sm font-semibold text-ink shadow-md shadow-brand/10 ring-1 ring-brand/15 transition hover:bg-brand-hover"
            >
              Request custom quote
            </Link>
            <Link
              href="/shop"
              className="inline-flex rounded-full border border-border px-8 py-3 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
