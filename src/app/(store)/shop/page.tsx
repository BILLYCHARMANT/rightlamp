import {
  categoriesFromPublishedCatalog,
  getCachedPublishedCatalog,
} from "@/lib/store/published-catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ShopFilters } from "@/components/store/ShopFilters";
import { ShopPagination } from "@/components/store/ShopPagination";
import { storeDisplay } from "@/components/store/store-fonts";

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
      <main className="flex-1">
        <h1
          className={`${storeDisplay.className} text-3xl font-semibold text-ink`}
        >
          Shop
        </h1>
        <p className="mt-4 rounded-2xl border border-border bg-surface px-5 py-4 text-sm text-muted-foreground">
          We couldn&apos;t load the catalog. Check{" "}
          <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-sm text-ink ring-1 ring-border">
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
    <main className="flex-1">
      <header className="mb-10 space-y-3">
        <h1
          className={`${storeDisplay.className} text-3xl font-semibold tracking-tight text-ink sm:text-4xl`}
        >
          Shop
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Search and filter published SKUs from your staff dashboard — same data
          as the catalog you manage under{" "}
          <span className="font-medium text-ink">Products</span>, with Rightlamps
          orange and cyan accents.
        </p>
      </header>

      <ShopFilters
        categories={categoryOptions}
        defaultQ={qRaw}
        defaultCategory={category}
      />

      <p className="mb-8 text-sm font-medium text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-ink">{slice.length}</span> of{" "}
        <span className="font-semibold text-ink">{filtered.length}</span>{" "}
        products
        {filtered.length !== products.length ? (
          <span className="text-muted-foreground">
            {" "}
            ({products.length} published in catalog)
          </span>
        ) : null}
        .
      </p>

      {slice.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center text-muted-foreground">
          No products match these filters. Try a broader search or reset filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {slice.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}

      <ShopPagination
        page={safePage}
        totalPages={totalPages}
        q={qRaw}
        category={category}
      />
    </main>
  );
}
