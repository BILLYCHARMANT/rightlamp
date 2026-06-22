import Link from "next/link";
import {
  getCachedPublishedCatalog,
} from "@/lib/store/published-catalog";
import { homeCopy } from "@/lib/company/site-content";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";
import { ProductCard } from "./ProductCard";

export async function FeaturedProducts() {
  let products;
  try {
    products = await getCachedPublishedCatalog();
  } catch {
    return (
      <SectionBand id="shop" variant="white" className="scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className={`${cardOnBandClass} px-5 py-4 text-center text-sm text-muted-foreground`}>
            Our shop catalog couldn&apos;t load. Please try again shortly.
          </p>
        </div>
      </SectionBand>
    );
  }

  if (products.length === 0) {
    return (
      <SectionBand id="shop" variant="white" className="scroll-mt-24 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent">
            {homeCopy.shopEyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-bold text-ink">Electrical products &amp; lighting</h2>
          <div className="mt-8">
            <Link
              href="/shop"
              className="inline-flex rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover"
            >
              Visit shop
            </Link>
          </div>
        </div>
      </SectionBand>
    );
  }

  const inStock = products.filter((p) => p.countInStock > 0);
  const showcase =
    inStock.length >= 8 ? inStock.slice(0, 12) : products.slice(0, 12);

  return (
    <SectionBand id="shop" variant="white" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-accent">
          {homeCopy.shopEyebrow}
        </p>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Electrical products &amp; lighting
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed text-muted-foreground">
          Order online from our retail catalog — energy-saving lamps, cables,
          panels, and household equipment.
        </p>
        <p className="mt-6 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-hover"
          >
            View all products <span aria-hidden>→</span>
          </Link>
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {showcase.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </SectionBand>
  );
}
