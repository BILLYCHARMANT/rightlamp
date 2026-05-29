import Link from "next/link";
import { getCachedRightlampsProducts } from "@/lib/rightlamps/server-products";

export default async function DashboardCategoriesPage() {
  let rows: { name: string; count: number }[] = [];
  try {
    const products = await getCachedRightlampsProducts();
    const counts = new Map<string, number>();
    for (const p of products) {
      const c = (p.category ?? "").trim();
      if (!c) continue;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    rows = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  } catch {
    rows = [];
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <p className="max-w-2xl text-sm text-muted-foreground">
        Category buckets mirror the live catalog served from{" "}
        <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs ring-1 ring-border">
          /api/products
        </code>{" "}
        on{" "}
        <a
          className="font-medium text-accent hover:text-accent-muted"
          href="https://www.rightlamps.com/"
          target="_blank"
          rel="noreferrer"
        >
          rightlamps.com
        </a>
        . Open a category on the storefront with one click.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center text-sm text-muted-foreground">
          No categories loaded — check{" "}
          <code className="rounded bg-surface-elevated px-1 font-mono ring-1 ring-border">
            RIGHTLAMPS_API_ORIGIN
          </code>{" "}
          or network access.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-sm">
          <div className="border-b border-border px-4 py-3 md:px-6">
            <h2 className="text-sm font-semibold text-ink">Catalog categories</h2>
            <p className="text-xs text-muted-foreground">
              {rows.length} categories · sorted by product count
            </p>
          </div>
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li
                key={r.name}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6"
              >
                <span className="font-medium text-ink">{r.name}</span>
                <div className="flex items-center gap-4">
                  <span className="tabular-nums text-sm text-muted-foreground">
                    {r.count} SKUs
                  </span>
                  <Link
                    href={`/shop?category=${encodeURIComponent(r.name)}`}
                    className="text-sm font-semibold text-accent hover:text-accent-muted"
                  >
                    View on storefront →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
