"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Clock,
  Eye,
  Leaf,
} from "lucide-react";
import {
  portfolioFilterCategories,
  portfolioItemDescription,
  portfolioItems,
  portfolioPageCopy,
  type PortfolioCategory,
  type PortfolioItem,
} from "@/lib/company/site-content";

function sortForDisplay(items: PortfolioItem[]) {
  return [...items].sort((a, b) => Number(b.featured) - Number(a.featured));
}

function FeaturedBentoCard({ item }: { item: PortfolioItem }) {
  const description = portfolioItemDescription(item);
  return (
    <article className="stitch-portfolio-card group relative col-span-1 overflow-hidden rounded-lg border border-[#E2E8F0] bg-white md:col-span-8">
      <div className="relative h-[320px] w-full overflow-hidden sm:h-[400px] md:h-[480px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <span className="mb-2 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#10B981]">
          {item.category}
        </span>
        <h3 className="font-[family-name:var(--font-hanken)] text-2xl text-white">
          {item.title}
        </h3>
        <p className="mt-2 max-w-md text-sm text-white/80">{description}</p>
      </div>
      {item.featured ? (
        <div className="absolute left-4 top-4">
          <span className="rounded bg-[#c55316] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-wider text-white">
            {portfolioPageCopy.featuredBadge}
          </span>
        </div>
      ) : null}
    </article>
  );
}

function StackedBentoCard({ item }: { item: PortfolioItem }) {
  return (
    <article className="stitch-portfolio-card group relative h-[200px] overflow-hidden rounded-lg border border-[#E2E8F0] bg-white sm:h-[236px]">
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 border-t border-[#E2E8F0] bg-white/95 p-4 backdrop-blur-sm">
        <span className="mb-1 block font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest text-[#c55316]">
          {item.category}
        </span>
        <h4 className="text-sm font-semibold text-[#1c1b1b]">{item.title}</h4>
      </div>
    </article>
  );
}

function TileBentoCard({
  item,
  variant,
}: {
  item: PortfolioItem;
  variant: "overlay" | "peek" | "bar";
}) {
  const description = portfolioItemDescription(item);
  const categoryColor =
    item.category === "Solar"
      ? "text-[#006c49]"
      : item.category === "Industrial"
        ? "text-[#10B981]"
        : "text-[#c55316]";

  return (
    <article className="stitch-portfolio-card group relative h-[280px] overflow-hidden rounded-lg border border-[#E2E8F0] bg-white sm:h-[320px]">
      {variant === "peek" ? (
        <div className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#c55316] shadow-sm">
          <Eye size={18} aria-hidden />
        </div>
      ) : null}
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {variant === "overlay" ? (
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#c55316]/90 to-transparent p-6 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="mb-2 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest text-white">
            {item.category}
          </span>
          <h4 className="font-[family-name:var(--font-hanken)] text-xl text-white">
            {item.title}
          </h4>
          <Link
            href="/custom-product"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            View details
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 border-t border-[#E2E8F0] bg-white p-4">
          <span
            className={`font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest ${categoryColor}`}
          >
            {item.category === "Solar" ? "Sustainability" : item.category}
          </span>
          <h4 className="text-sm font-semibold text-[#1c1b1b]">{item.title}</h4>
          {variant === "bar" && description ? (
            <p className="mt-1 line-clamp-1 text-xs text-[#424754]">{description}</p>
          ) : null}
        </div>
      )}
    </article>
  );
}

function GridCard({ item }: { item: PortfolioItem }) {
  return (
    <article className="stitch-portfolio-card group relative overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 border-t border-[#E2E8F0] bg-white/95 p-4 backdrop-blur-sm">
          <span className="mb-1 block font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest text-[#c55316]">
            {item.category}
          </span>
          <h4 className="text-sm font-semibold text-[#1c1b1b]">{item.title}</h4>
        </div>
      </div>
    </article>
  );
}

function PortfolioBentoGrid({ items }: { items: PortfolioItem[] }) {
  if (items.length === 0) return null;

  const [featured, sideA, sideB, tileA, tileB, tileC, ...rest] = items;
  const tileVariants: Array<"overlay" | "peek" | "bar"> = [
    "overlay",
    "peek",
    "bar",
  ];

  return (
    <>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-2">
        {featured ? <FeaturedBentoCard item={featured} /> : null}
        {sideA || sideB ? (
          <div className="flex flex-col gap-2 md:col-span-4">
            {sideA ? <StackedBentoCard item={sideA} /> : null}
            {sideB ? <StackedBentoCard item={sideB} /> : null}
          </div>
        ) : null}
        {[tileA, tileB, tileC].map(
          (item, index) =>
            item && (
              <div key={item.id} className="md:col-span-4">
                <TileBentoCard item={item} variant={tileVariants[index] ?? "bar"} />
              </div>
            ),
        )}
      </div>
      {rest.length > 0 ? (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rest.map((item) => (
            <GridCard key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export function PortfolioPageContent() {
  const [active, setActive] = useState<PortfolioCategory>("All");
  const [visibleCount, setVisibleCount] = useState<number>(
    portfolioPageCopy.bentoInitialCount,
  );

  const filtered = useMemo(() => {
    const list =
      active === "All"
        ? portfolioItems
        : portfolioItems.filter((item) => item.category === active);
    return sortForDisplay(list);
  }, [active]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="overflow-x-hidden bg-[#fcf9f8] font-[family-name:var(--font-inter)] text-[#1c1b1b]">
      {/* Hero — Stitch Portfolio Redesign */}
      <section className="relative overflow-hidden bg-[#313030] px-6 py-16 sm:px-12 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(#c55316 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px]">
          <div className="max-w-2xl">
            <span className="mb-4 block font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#10B981]">
              {portfolioPageCopy.heroEyebrow}
            </span>
            <h1 className="mb-6 font-[family-name:var(--font-hanken)] text-4xl font-bold leading-tight tracking-tight text-[#fbfaff] sm:text-5xl">
              {portfolioPageCopy.heroTitle}
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-[#c2c6d6]">
              {portfolioPageCopy.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              {portfolioPageCopy.heroBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-md"
                >
                  {badge.tone === "green" ? (
                    <BadgeCheck
                      size={18}
                      className="text-[#10B981]"
                      fill="#10B981"
                      aria-hidden
                    />
                  ) : (
                    <BadgeCheck size={18} className="text-[#FAB40D]" aria-hidden />
                  )}
                  <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-wide text-white">
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="bg-[#F8FAFC] px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <h2 className="font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#1c1b1b]">
              {portfolioPageCopy.galleryTitle}
            </h2>
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Portfolio categories"
            >
              {portfolioFilterCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active === cat}
                  onClick={() => {
                    setActive(cat);
                    setVisibleCount(portfolioPageCopy.bentoInitialCount);
                  }}
                  className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
                    active === cat
                      ? "border-[#c55316] bg-[#c55316] text-white shadow-card"
                      : "store-card border-[#E2E8F0] bg-white text-[#1c1b1b] hover:border-[#c55316]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-16 text-center text-[#424754]">
              No projects in this category yet.
            </p>
          ) : (
            <PortfolioBentoGrid items={visible} />
          )}

          {hasMore ? (
            <div className="mt-16 text-center">
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (n) => n + portfolioPageCopy.loadMoreBatch,
                  )
                }
                className="inline-flex items-center gap-2 rounded border-2 border-[#c55316] bg-transparent px-8 py-4 text-sm font-bold text-[#c55316] shadow-sm transition-all hover:bg-[#c55316] hover:text-white"
              >
                {portfolioPageCopy.loadMoreLabel}
                <ChevronDown size={20} aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* Trust — Built on Precision */}
      <section className="bg-[#fcf9f8] px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] items-center gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-[family-name:var(--font-hanken)] text-3xl font-bold leading-tight text-[#1c1b1b] sm:text-4xl">
              {portfolioPageCopy.trustTitle}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-[#424754]">
              {portfolioPageCopy.trustBody}
            </p>
            <div className="mb-10 space-y-4">
              {portfolioPageCopy.trustFeatures.map((feature, index) => {
                const Icon = index === 0 ? Clock : Leaf;
                const tone =
                  index === 0
                    ? "bg-[#c55316]/10 text-[#c55316]"
                    : "bg-[#10B981]/10 text-[#10B981]";
                return (
                  <div key={feature.id} className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${tone}`}
                    >
                      <Icon size={22} aria-hidden />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{feature.title}</h4>
                      <p className="text-sm text-[#424754]">{feature.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link
              href={portfolioPageCopy.trustCtaHref}
              className="inline-flex rounded bg-[#c55316] px-8 py-4 text-sm font-semibold text-white transition hover:shadow-xl"
            >
              {portfolioPageCopy.trustCta}
            </Link>
          </div>
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-[#FAB40D]/10 blur-2xl" />
            <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-[#c55316]/10 blur-2xl" />
            <div className="store-card relative z-10 aspect-[4/3] overflow-hidden rounded border border-[#E2E8F0]">
              <Image
                src={portfolioPageCopy.trustImage}
                alt={portfolioPageCopy.trustImageAlt}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
