import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import {
  categoriesFromPublishedCatalog,
  getCachedPublishedCatalog,
} from "@/lib/store/published-catalog";
import { ShopPageContent } from "@/components/store/shop/ShopPageContent";
import { company } from "@/lib/company/site-content";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Shop",
  description: `${company.shortName} technical catalog — electrical components, switchgear, solar arrays, and industrial-grade solutions.`,
};

type SearchParams = Promise<{
  q?: string;
  category?: string;
  page?: string;
}>;

const PAGE_SIZE = 24;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const qRaw = (sp.q ?? "").trim();
  const q = qRaw.toLowerCase();
  const category = (sp.category ?? "").trim();
  const pageRaw = parseInt(sp.page ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  let products;
  try {
    products = await getCachedPublishedCatalog();
  } catch {
    return (
      <main
        className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} mx-auto flex-1 max-w-7xl px-4 py-8 sm:px-6 sm:py-10`}
      >
        <h1 className="font-[family-name:var(--font-hanken)] text-3xl font-bold tracking-tight text-[#1c1b1b] sm:text-4xl">
          Shop
        </h1>
        <p className="mt-4 rounded-lg border border-[#E2E8F0] bg-white px-5 py-4 text-sm text-[#424754]">
          We couldn&apos;t load the catalog. Check{" "}
          <code className="rounded-md bg-[#f6f3f2] px-1.5 py-0.5 font-mono text-sm text-[#1c1b1b] ring-1 ring-[#E2E8F0]">
            DATABASE_URL
          </code>{" "}
          or try again shortly.
        </p>
      </main>
    );
  }

  let filtered = products;
  if (category) {
    filtered = filtered.filter(
      (p) => (p.category ?? "").trim() === category,
    );
  }
  if (q) {
    filtered = filtered.filter((p) => {
      const hay = [p.name, p.slug, p.category, p.brand, p.description]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .join(" ");
      return hay.includes(q);
    });
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const categoryOptions = categoriesFromPublishedCatalog(products, 180);

  return (
    <main
      className={`${hanken.variable} ${inter.variable} ${jetbrains.variable} flex-1 [--stitch-green:#10B981] [--stitch-primary:#c55316] [--stitch-yellow:#FAB40D]`}
    >
      <ShopPageContent
        products={slice}
        filteredCount={filtered.length}
        catalogCount={products.length}
        categories={categoryOptions}
        q={qRaw}
        category={category}
        page={safePage}
        totalPages={totalPages}
      />
    </main>
  );
}
