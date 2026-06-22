"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PortfolioFilterTabs } from "@/components/store/portfolio/PortfolioFilterTabs";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";
import { homeCopy, portfolioCategories, portfolioItems, type PortfolioCategory, type PortfolioItem } from "@/lib/company/site-content";

function MarqueeCard({ item, duplicate = false }: { item: PortfolioItem; duplicate?: boolean }) {
  return (
    <Link
      href="/portfolio"
      className="portfolio-slide group store-card block overflow-hidden rounded-[var(--radius)] border border-border bg-white"
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={duplicate ? "" : item.title}
          fill
          sizes="304px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-muted">
            {item.category}
          </p>
          <h3 className="mt-1 text-base font-bold text-white">{item.title}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-white/70">
            Rwanda
          </p>
        </div>
      </div>
    </Link>
  );
}

function MarqueeSet({
  items,
  duplicate = false,
}: {
  items: PortfolioItem[];
  duplicate?: boolean;
}) {
  return (
    <div className="portfolio-marquee-set" aria-hidden={duplicate || undefined}>
      {items.map((item) => (
        <MarqueeCard key={`${item.id}${duplicate ? "-dup" : ""}`} item={item} duplicate={duplicate} />
      ))}
    </div>
  );
}

export function PortfolioGallery() {
  const [active, setActive] = useState<PortfolioCategory>("All");
  const [isPaused, setIsPaused] = useState(false);

  const filtered = useMemo(() => {
    if (active === "All") return portfolioItems;
    return portfolioItems.filter((item) => item.category === active);
  }, [active]);

  const featured = useMemo(
    () => portfolioItems.filter((item) => item.featured).slice(0, 3),
    [],
  );

  const marqueeDuration = Math.max(filtered.length * 5, 30);

  return (
    <SectionBand
      id="portfolio"
      variant="fade-white-to-muted"
      className="scroll-mt-24 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-accent">
          {homeCopy.projectsEyebrow}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {featured.map((item) => (
            <Link
              key={item.id}
              href="/portfolio"
              className={`${cardOnBandClass} group overflow-hidden transition hover:-translate-y-1 hover:shadow-card-lg`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 bg-white p-5 shadow-card">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">
                    {item.category}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Kigali &amp; across Rwanda
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <PortfolioFilterTabs
          categories={portfolioCategories}
          active={active}
          onChange={setActive}
        />

        <div
          className="portfolio-marquee relative mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            key={active}
            className={`portfolio-marquee-track ${isPaused ? "is-paused" : ""}`}
            style={{ animationDuration: `${marqueeDuration}s` }}
            aria-live="polite"
          >
            <MarqueeSet items={filtered} />
            <MarqueeSet items={filtered} duplicate />
          </div>
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-full border border-navy bg-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary"
          >
            All projects
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </SectionBand>
  );
}
