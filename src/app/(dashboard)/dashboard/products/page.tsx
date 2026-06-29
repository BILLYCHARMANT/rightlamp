import { DashboardProductsHub } from "@/components/dashboard/dashboard-products-hub";
import { listProductCategories } from "@/lib/dashboard/category-actions";
import { toExplorerProduct } from "@/lib/dashboard/explorer-product";
import { getDashboardOverviewStats } from "@/lib/dashboard/overview-stats";
import { fetchExplorerProducts } from "@/lib/dashboard/product-queries";

export default async function DashboardProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string; edit?: string }>;
}) {
  const sp = await searchParams;
  const initialCreateOpen = sp.create === "1";
  const initialEditId = sp.edit?.trim() || null;

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

  const explorerProducts = products.map(toExplorerProduct);

  return (
    <DashboardProductsHub
      explorerProducts={explorerProducts}
      categories={categories}
      initialCreateOpen={initialCreateOpen}
      initialEditId={initialEditId}
      connectionWarning={listWarning ?? stats.connectionWarning}
    />
  );
}
