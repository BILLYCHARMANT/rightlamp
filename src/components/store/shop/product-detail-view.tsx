"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import type { StoreProductDetail } from "@/lib/store/product-detail-data";
import { formatRetailPrice } from "@/lib/rightlamps/format-price";
import { BRAND_LOGO } from "@/lib/company/brand-assets";

type Props = {
  product: StoreProductDetail;
};

export function ProductDetailView({ product }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = product.gallery;
  const current = gallery[activeImage] ?? gallery[0];

  const stockLabel =
    product.stock > 0
      ? `In stock (${product.stock} available)`
      : "Available on request";

  const showVariantGrid = product.variants.length > 1;
  const variantLabel = showVariantGrid ? "Capacity / size" : "Configuration";

  return (
    <div className="mt-3">
      <nav
        className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="hover:text-[#c55316]">
          Home
        </Link>
        <ChevronRight size={12} aria-hidden />
        <Link href="/shop" className="hover:text-[#c55316]">
          Shop
        </Link>
        {product.category ? (
          <>
            <ChevronRight size={12} aria-hidden />
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[#c55316]"
            >
              {product.category}
            </Link>
          </>
        ) : null}
        <ChevronRight size={12} aria-hidden />
        <span className="line-clamp-1 font-medium text-ink">{product.familyTitle}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <div
            className="relative mx-auto flex aspect-square w-full max-w-lg items-center justify-center overflow-hidden rounded-lg border border-[#E2E8F0] bg-white lg:mx-0"
            role="img"
            aria-label={`${current?.label ?? "Product"} — ${product.name}`}
          >
            <Image
              src={current?.url ?? product.image ?? BRAND_LOGO}
              alt={current?.label ?? product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6"
              priority
            />
          </div>

          <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {gallery.map((image, index) => {
              const active = index === activeImage;
              return (
                <li key={image.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`relative h-16 w-16 overflow-hidden rounded-md border-2 bg-white transition ${
                      active
                        ? "border-[#c55316] ring-2 ring-[#c55316]/20"
                        : "border-[#E2E8F0] hover:border-slate-300"
                    }`}
                    title={image.label}
                    aria-label={image.label}
                    aria-pressed={active}
                  >
                    <Image
                      src={image.url}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={image.url.startsWith("http")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {current ? (
            <p className="mt-3 text-center text-sm font-medium text-ink lg:text-left">
              {current.label}
            </p>
          ) : null}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-snug text-[#1c1b1b] sm:text-3xl">
            {product.name}
          </h1>

          <p className="mt-2">
            <Link
              href="/about"
              className="text-sm text-[#007185] hover:text-[#c55316] hover:underline"
            >
              Visit the {product.brand} Store
            </Link>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-0.5 text-[#c55316]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < 4 ? "fill-[#c55316]" : "fill-[#c55316]/30"}
                  aria-hidden
                />
              ))}
            </span>
            <span className="text-[#007185] hover:underline">
              4.0 rating
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-[#007185] hover:underline">PV-GRID catalog</span>
          </div>

          <div className="my-5 border-y border-[#E2E8F0] py-4">
            <p className="text-3xl font-normal text-[#B12704]">
              {formatRetailPrice(product.priceCents / 100, product.currency)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{stockLabel}</p>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-bold text-ink">
              {variantLabel}:{" "}
              <span className="font-semibold">{product.capacityLabel}</span>
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {product.variants.map((variant) => {
                const selected = variant.isCurrent;
                const href = `/shop/${encodeURIComponent(variant.slug)}`;
                const price = formatRetailPrice(
                  variant.priceCents / 100,
                  variant.currency,
                );

                return (
                  <Link
                    key={variant.slug}
                    href={href}
                    className={`rounded-lg border-2 px-3 py-3 text-left transition ${
                      selected
                        ? "border-[#c55316] bg-[#c55316]/5 shadow-sm"
                        : "border-[#D5D9D9] bg-white hover:border-[#c55316]/50"
                    }`}
                    aria-current={selected ? "page" : undefined}
                  >
                    <span className="block text-sm font-semibold text-ink">
                      {variant.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {variant.stock > 0 ? "In stock" : "On request"}
                    </span>
                    <span className="mt-1 block text-sm font-bold text-[#B12704]">
                      {price}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {product.accessories.length > 0 ? (
            <section className="mt-8">
              <h2 className="text-sm font-bold text-ink">Add-on accessories</h2>
              <ul className="mt-3 divide-y divide-[#E2E8F0] rounded-lg border border-[#E2E8F0]">
                {product.accessories.map((accessory) => (
                  <li
                    key={accessory.id}
                    className="flex items-center gap-3 px-3 py-3"
                  >
                    {accessory.imageUrl ? (
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded border border-[#E2E8F0] bg-white">
                        <Image
                          src={accessory.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      </span>
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-[#E2E8F0] bg-slate-50 text-[10px] text-muted-foreground">
                        Add-on
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {accessory.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {accessory.priceCents > 0
                          ? formatRetailPrice(
                              accessory.priceCents / 100,
                              product.currency,
                            )
                          : "Included"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="text-sm font-bold text-ink">Product details</h2>
            <dl className="mt-3 overflow-hidden rounded-lg border border-[#E2E8F0]">
              {product.specs.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`grid grid-cols-[minmax(0,38%)_1fr] gap-3 px-4 py-2.5 text-sm ${
                    index % 2 === 0 ? "bg-[#F7F8F8]" : "bg-white"
                  }`}
                >
                  <dt className="font-semibold text-ink">{spec.label}</dt>
                  <dd className="text-muted-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {product.description ? (
            <section className="mt-8">
              <h2 className="text-sm font-bold text-ink">About this item</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </section>
          ) : null}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/request-order?product=${encodeURIComponent(product.slug)}`}
              className="inline-flex items-center justify-center rounded-full bg-[#c55316] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a84310]"
            >
              Request this product
            </Link>
            <Link
              href={`/custom-product?product=${encodeURIComponent(product.slug)}`}
              className="inline-flex items-center justify-center rounded-full border border-[#c55316] px-8 py-3 text-sm font-semibold text-[#c55316] transition hover:bg-[#c55316]/5"
            >
              Get custom quote
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-[#D5D9D9] px-8 py-3 text-sm font-semibold text-ink transition hover:bg-slate-50"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
