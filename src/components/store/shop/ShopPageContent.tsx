import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Bolt,
  FileText,
  LayoutGrid,
  Leaf,
  Search,
  Settings2,
  Sun,
  Verified,
} from "lucide-react";
import type { RightlampsProduct } from "@/lib/rightlamps/types";
import {
  shopPageCopy,
  shopSidebarCategories,
} from "@/lib/company/site-content";
import { StitchProductCard } from "@/components/store/shop/StitchProductCard";
import { ShopPagination } from "@/components/store/ShopPagination";

type Props = {
  products: RightlampsProduct[];
  filteredCount: number;
  catalogCount: number;
  categories: string[];
  q: string;
  category: string;
  page: number;
  totalPages: number;
};

function sidebarIcon(id: (typeof shopSidebarCategories)[number]["icon"]) {
  switch (id) {
    case "solar":
      return Sun;
    case "switchgear":
      return Settings2;
    case "battery":
      return BatteryCharging;
    case "grid":
      return LayoutGrid;
  }
}

function categoryHref(categoryValue: string, q: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (categoryValue) params.set("category", categoryValue);
  const s = params.toString();
  return s ? `/shop?${s}` : "/shop";
}

function resolveSidebarCategory(
  categories: string[],
  activeCategory: string,
): string {
  if (activeCategory) return activeCategory;
  for (const item of shopSidebarCategories) {
    const match = categories.find((c) => item.match.test(c));
    if (match) return match;
  }
  return "";
}

export function ShopPageContent({
  products,
  filteredCount,
  catalogCount,
  categories,
  q,
  category,
  page,
  totalPages,
}: Props) {
  const gridTitle = category || shopPageCopy.gridDefaultTitle;
  const gridSubtitle = category
    ? `Browse ${category} from our published catalog.`
    : shopPageCopy.gridDefaultSubtitle;

  const sidebarActive = resolveSidebarCategory(categories, category);

  return (
    <div className="overflow-x-hidden bg-[#F8FAFC] font-[family-name:var(--font-inter)] text-[#1c1b1b]">
      {/* Hero */}
      <section className="relative flex h-[420px] items-center overflow-hidden bg-[#1c1b1b] sm:h-[500px]">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={shopPageCopy.heroImage}
            alt={shopPageCopy.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1b1b] via-[#1c1b1b]/80 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-12">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c55316]/30 bg-[#c55316]/20 px-3 py-1">
              <Verified size={16} className="text-[#f4a261]" aria-hidden />
              <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#f4a261]">
                {shopPageCopy.heroBadge}
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-hanken)] text-4xl font-bold leading-tight text-white sm:text-5xl">
              {shopPageCopy.heroTitle}
              <br />
              {shopPageCopy.heroTitleLine2}
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-[#e5e2e1]">
              {shopPageCopy.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="rounded bg-[#c55316] px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5"
              >
                {shopPageCopy.heroPrimaryCta}
              </a>
              <Link
                href={shopPageCopy.heroSecondaryHref}
                className="rounded border border-[#e5e2e1] px-8 py-4 text-sm font-semibold text-[#e5e2e1] transition hover:bg-white/10"
              >
                {shopPageCopy.heroSecondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product workspace */}
      <div
        id="catalog"
        className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-16 sm:px-12 lg:flex-row lg:py-20"
      >
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-28 space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-hanken)] text-2xl font-bold text-[#c55316]">
                {shopPageCopy.sidebarTitle}
              </h2>
              <p className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#424754]">
                {shopPageCopy.sidebarSubtitle}
              </p>
            </div>

            <form action="/shop" method="GET" className="relative">
              {category ? (
                <input type="hidden" name="category" value={category} />
              ) : null}
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#727786]"
                aria-hidden
              />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search components..."
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#f6f3f2] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c55316]/20"
              />
            </form>

            <nav className="flex flex-col gap-2">
              <Link
                href={shopPageCopy.sidebarQuoteHref}
                className="flex translate-x-0.5 items-center gap-3 rounded-lg bg-[#c55316] p-3 text-sm font-bold text-white transition hover:opacity-90"
              >
                {shopPageCopy.sidebarQuoteLabel}
              </Link>
              <Link
                href={categoryHref("", q)}
                className={`flex items-center gap-3 rounded-lg p-3 text-sm transition ${
                  !category
                    ? "bg-[#e5e2e1] font-semibold text-[#1c1b1b]"
                    : "text-[#424754] hover:bg-[#e5e2e1]"
                }`}
              >
                <LayoutGrid size={20} aria-hidden />
                <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest">
                  All Products
                </span>
              </Link>
              {shopSidebarCategories.map((item) => {
                const Icon = sidebarIcon(item.icon);
                const matched = categories.find((c) => item.match.test(c));
                const href = matched
                  ? categoryHref(matched, q)
                  : `/shop?q=${encodeURIComponent(item.label.split(" ")[0].toLowerCase())}`;
                const isActive =
                  (matched && category === matched) ||
                  (!matched && category === item.label);
                return (
                  <Link
                    key={item.id}
                    href={href}
                    className={`flex items-center gap-3 rounded-lg p-3 text-sm transition ${
                      isActive
                        ? "bg-[#e5e2e1] font-semibold text-[#1c1b1b]"
                        : "text-[#424754] hover:bg-[#e5e2e1]"
                    }`}
                  >
                    <Icon size={20} aria-hidden />
                    <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
              {categories
                .filter(
                  (c) =>
                    !shopSidebarCategories.some((s) => s.match.test(c)) &&
                    c !== sidebarActive,
                )
                .slice(0, 6)
                .map((c) => (
                  <Link
                    key={c}
                    href={categoryHref(c, q)}
                    className={`flex items-center gap-3 rounded-lg p-3 text-sm transition ${
                      category === c
                        ? "bg-[#e5e2e1] font-semibold text-[#1c1b1b]"
                        : "text-[#424754] hover:bg-[#e5e2e1]"
                    }`}
                  >
                    <LayoutGrid size={20} aria-hidden />
                    <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest">
                      {c}
                    </span>
                  </Link>
                ))}
            </nav>

            <div className="store-card rounded-xl border border-[#E2E8F0] bg-[#f0edec] p-6">
              <FileText size={28} className="mb-4 text-[#c55316]" aria-hidden />
              <h4 className="mb-2 font-[family-name:var(--font-hanken)] text-lg font-semibold">
                {shopPageCopy.sidebarGuideTitle}
              </h4>
              <p className="mb-4 text-sm text-[#424754]">
                {shopPageCopy.sidebarGuideBody}
              </p>
              <Link
                href={shopPageCopy.sidebarGuideHref}
                className="block w-full rounded border border-[#c55316] py-2 text-center text-sm font-semibold text-[#c55316] transition hover:bg-[#c55316]/5"
              >
                {shopPageCopy.sidebarGuideCta}
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-grow">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h3 className="font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#1c1b1b]">
                {gridTitle}
              </h3>
              <p className="text-[#424754]">{gridSubtitle}</p>
              <p className="mt-2 text-sm text-[#727786]">
                Showing{" "}
                <span className="font-semibold text-[#1c1b1b]">
                  {products.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#1c1b1b]">
                  {filteredCount}
                </span>{" "}
                products
                {filteredCount !== catalogCount ? (
                  <span> ({catalogCount} in catalog)</span>
                ) : null}
                .
              </p>
            </div>
            {(q || category) && (
              <Link
                href="/shop"
                className="text-sm font-semibold text-[#c55316] hover:underline"
              >
                Reset filters
              </Link>
            )}
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[#E2E8F0] bg-white px-6 py-14 text-center text-[#424754]">
              {shopPageCopy.emptyState}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {products.map((p) => (
                <StitchProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          <ShopPagination
            page={page}
            totalPages={totalPages}
            q={q}
            category={category}
          />
        </div>
      </div>

      {/* Featured innovation */}
      <section className="relative overflow-hidden bg-[#1c1b1b] py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #E2E8F0 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 sm:px-12">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="w-full lg:w-1/2">
              <div className="mb-8 inline-block rounded border border-[#10B981]/30 bg-[#10B981]/20 px-4 py-1 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#10B981]">
                {shopPageCopy.featuredEyebrow}
              </div>
              <h2 className="mb-6 font-[family-name:var(--font-hanken)] text-4xl font-bold text-white sm:text-5xl">
                {shopPageCopy.featuredTitle}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-[#e5e2e1]">
                {shopPageCopy.featuredBody}
              </p>
              <div className="mb-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {shopPageCopy.featuredHighlights.map((item, i) => (
                  <div key={item.id} className="flex gap-4">
                    {i === 0 ? (
                      <Bolt
                        size={24}
                        className="shrink-0 text-[#10B981]"
                        fill="#10B981"
                        aria-hidden
                      />
                    ) : (
                      <Leaf
                        size={24}
                        className="shrink-0 text-[#10B981]"
                        fill="#10B981"
                        aria-hidden
                      />
                    )}
                    <div>
                      <h5 className="font-bold text-white">{item.title}</h5>
                      <p className="text-sm text-[#727786]">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href={shopPageCopy.featuredCtaHref}
                className="inline-flex items-center gap-3 rounded bg-[#10B981] px-10 py-5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {shopPageCopy.featuredCta}
                <ArrowRight size={20} aria-hidden />
              </Link>
            </div>
            <div className="relative w-full lg:w-1/2">
              <div className="stitch-glass-panel overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                <Image
                  src={shopPageCopy.featuredImage}
                  alt={shopPageCopy.featuredImageAlt}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="store-card absolute -bottom-6 -left-6 hidden rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-xl md:block">
                <div className="mb-2 flex items-center gap-4">
                  <div className="h-3 w-3 rounded-full bg-[#10B981]" />
                  <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#1c1b1b]">
                    {shopPageCopy.featuredStatLabel}
                  </span>
                </div>
                <div className="text-2xl font-bold text-[#c55316]">
                  {shopPageCopy.featuredStatValue}
                </div>
                <div className="text-xs text-[#727786]">
                  {shopPageCopy.featuredStatNote}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
