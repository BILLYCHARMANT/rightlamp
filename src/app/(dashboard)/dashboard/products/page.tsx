import Link from "next/link";
import { DashboardProductsHub } from "@/components/dashboard/dashboard-products-hub";
import { getDashboardOverviewStats } from "@/lib/dashboard/overview-stats";
import { isPrismaConnectionError } from "@/lib/dashboard/prisma-connection";
import {
  getCachedRightlampsProducts,
  topCategoriesByVolume,
} from "@/lib/rightlamps/server-products";
import { prisma } from "@/lib/db";

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const sp = await searchParams;
  const initialCreateOpen = sp.create === "1";

  const stats = await getDashboardOverviewStats();
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );

  let categorySuggestions: string[] = [];
  try {
    const rp = await getCachedRightlampsProducts();
    categorySuggestions = topCategoriesByVolume(rp, 200);
  } catch {
    categorySuggestions = [];
  }

  const CATALOG_LIST_WARNING =
    "Product list could not be loaded — the database server was unreachable. Fix DATABASE_URL or start the Railway Postgres service, then refresh.";

  type ProductRow = {
    id: string;
    name: string;
    slug: string;
    category: string | null;
    priceCents: number;
    currency: string;
    stock: number;
    published: boolean;
    updatedAt: Date;
  };

  let products: ProductRow[] = [];
  let newThisMonth = 0;
  let listWarning: string | undefined;

  try {
    const [rows, monthCount] = await Promise.all([
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        take: 120,
        select: {
          id: true,
          name: true,
          slug: true,
          category: true,
          priceCents: true,
          currency: true,
          stock: true,
          published: true,
          updatedAt: true,
        },
      }),
      prisma.product.count({
        where: { createdAt: { gte: monthStart } },
      }),
    ]);
    products = rows;
    newThisMonth = monthCount;
  } catch (e) {
    if (!isPrismaConnectionError(e)) throw e;
    listWarning = CATALOG_LIST_WARNING;
  }

  const explorerProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    priceCents: p.priceCents,
    currency: p.currency,
    stock: p.stock,
    published: p.published,
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <>
      <nav aria-label="Breadcrumb" className="px-4 pt-4 md:hidden md:px-8">
        <ol className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-muted-foreground">
          <li>
            <Link href="/dashboard" className="text-brand hover:underline">
              Dashboard
            </Link>
          </li>
          <li aria-hidden className="text-muted-foreground/70">
            •
          </li>
          <li className="font-medium text-ink">Products</li>
        </ol>
      </nav>

      <DashboardProductsHub
        explorerProducts={explorerProducts}
        totalProducts={stats.totalSkus}
        newThisMonth={newThisMonth}
        publishedSkus={stats.publishedSkus}
        totalSkus={stats.totalSkus}
        categorySuggestions={categorySuggestions}
        initialCreateOpen={initialCreateOpen}
        connectionWarning={listWarning ?? stats.connectionWarning}
      />
    </>
  );
}
