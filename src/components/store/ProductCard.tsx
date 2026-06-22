import Image from "next/image";
import Link from "next/link";
import type { RightlampsProduct } from "@/lib/rightlamps/types";
import { formatRetailPrice } from "@/lib/rightlamps/format-price";

export function ProductCard({ product }: { product: RightlampsProduct }) {
  const href = `/shop/${encodeURIComponent(product.slug)}`;
  const stock =
    product.countInStock > 0
      ? `${product.countInStock} in stock`
      : "Out of stock";

  const blurb =
    (product.description ?? "").trim() ||
    (product.category ? `${product.category}` : "Lighting & electrical");

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-card-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-xs font-medium text-muted-foreground">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-bold leading-snug text-ink">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {blurb}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-base font-bold tracking-tight text-brand">
              {formatRetailPrice(
                product.price,
                product.currency ?? "RWF",
              )}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {stock}
            </p>
          </div>
          <span className="shrink-0 rounded-lg bg-accent px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition group-hover:bg-accent-hover">
            View
          </span>
        </div>
      </div>
    </Link>
  );
}
