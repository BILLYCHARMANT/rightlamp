import Image from "next/image";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import type { RightlampsProduct } from "@/lib/rightlamps/types";
import { formatRetailPrice } from "@/lib/rightlamps/format-price";

function stockBadge(product: RightlampsProduct) {
  if (product.countInStock > 0) {
    return {
      label: "IN STOCK",
      className: "bg-[#10B981] text-white",
    };
  }
  return {
    label: "PRE-ORDER",
    className: "bg-[#FAB40D] text-[#271900]",
  };
}

export function StitchProductCard({ product }: { product: RightlampsProduct }) {
  const href = `/shop/${encodeURIComponent(product.slug)}`;
  const badge = stockBadge(product);
  const categoryLabel = (product.category ?? "Electrical").toUpperCase();
  const specLeftLabel = product.brand ? "BRAND" : "CATEGORY";
  const specLeftValue = product.brand ?? product.category ?? "PV-GRID Certified";
  const specRightLabel = product.countInStock > 0 ? "AVAILABILITY" : "STATUS";
  const specRightValue =
    product.countInStock > 0
      ? `${product.countInStock} Units`
      : "On Request";

  return (
    <article className="store-card group flex flex-col overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
      <div className="relative aspect-video overflow-hidden bg-[#ebe7e7]">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#727786]">
            No image
          </div>
        )}
        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wide ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#c55316]">
              {categoryLabel}
            </span>
            <h4 className="mt-1 font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#1c1b1b]">
              {product.name}
            </h4>
          </div>
          <span className="shrink-0 font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#c55316]">
            {formatRetailPrice(product.price, product.currency ?? "RWF")}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 border-y border-[#E2E8F0] py-4">
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wide text-[#727786]">
              {specLeftLabel}
            </span>
            <span className="text-sm font-semibold text-[#1c1b1b]">
              {specLeftValue}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wide text-[#727786]">
              {specRightLabel}
            </span>
            <span className="text-sm font-semibold text-[#1c1b1b]">
              {specRightValue}
            </span>
          </div>
        </div>

        <div className="mt-auto flex gap-3">
          <Link
            href={href}
            className="flex-grow rounded border border-[#c55316] py-3 text-center text-sm font-semibold text-[#c55316] transition hover:bg-[#c55316]/5"
          >
            View Specs
          </Link>
          <Link
            href={`/custom-product?product=${encodeURIComponent(product.slug)}`}
            className="flex flex-grow items-center justify-center gap-2 rounded bg-[#c55316] py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ClipboardList size={18} aria-hidden />
            Add to Quote
          </Link>
        </div>
      </div>
    </article>
  );
}
