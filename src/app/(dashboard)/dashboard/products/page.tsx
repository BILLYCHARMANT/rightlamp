import { DashboardProductsHub } from "@/components/dashboard/dashboard-products-hub";
import { listProductCategories } from "@/lib/dashboard/category-actions";
import { getDashboardOverviewStats } from "@/lib/dashboard/overview-stats";
import { fetchExplorerProducts } from "@/lib/dashboard/product-queries";

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const sp = await searchParams;
  const initialCreateOpen = sp.create === "1";

  const stats = await getDashboardOverviewStats();
  const categoryRows = await listProductCategories();
  const categories = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const CATALOG_LIST_WARNING =
    "Product list could not be loaded — the database server was unreachable. Fix DATABASE_URL or start the Railway Postgres service, then refresh.";

  let listWarning: string | undefined;
  const { products, connectionError } = await fetchExplorerProducts(120);
  if (connectionError) {
    listWarning = CATALOG_LIST_WARNING;
  }

  const explorerProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    description: p.description,
    priceCents: p.priceCents,
    costPriceCents: p.costPriceCents,
    currency: p.currency,
    stock: p.stock,
    published: p.published,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    accessories: p.accessories.map((a) => ({
      id: a.id,
      name: a.name,
      imageUrl: a.imageUrl,
      priceCents: a.priceCents,
      sortOrder: a.sortOrder,
    })),
  }));

  return (
    <DashboardProductsHub
      explorerProducts={explorerProducts}
      categories={categories}
      initialCreateOpen={initialCreateOpen}
      connectionWarning={listWarning ?? stats.connectionWarning}
    />
  );
}
