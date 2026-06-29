import { notFound } from "next/navigation";
import { DashboardProductDetail } from "@/components/dashboard/dashboard-product-detail";
import { listProductCategories } from "@/lib/dashboard/category-actions";
import { toExplorerProduct } from "@/lib/dashboard/explorer-product";
import {
  fetchExplorerProductById,
  fetchProductVersions,
} from "@/lib/dashboard/product-queries";
import type { PageParams } from "@/types/next-page";

type Params = PageParams<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const product = await fetchExplorerProductById(id);
  if (!product) return { title: "Product not found" };
  return { title: product.name };
}

export default async function DashboardProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const record = await fetchExplorerProductById(id);
  if (!record) notFound();

  const categoryRows = await listProductCategories();
  const categories = categoryRows.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const versions = record.familyId
    ? await fetchProductVersions(record.familyId)
    : [
        {
          id: record.id,
          name: record.name,
          slug: record.slug,
          variantLabel: record.variantLabel,
          priceCents: record.priceCents,
          currency: record.currency,
          stock: record.stock,
          published: record.published,
        },
      ];

  return (
    <DashboardProductDetail
      product={toExplorerProduct(record)}
      versions={versions}
      categories={categories}
    />
  );
}
