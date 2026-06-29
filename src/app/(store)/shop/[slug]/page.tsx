import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/store/shop/product-detail-view";
import { getStoreProductDetail } from "@/lib/store/product-detail-data";

import type { PageParams } from "@/types/next-page";

type Params = PageParams<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const product = await getStoreProductDetail(decoded);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} · PV-GRID`,
    description: product.description ?? product.name,
  };
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);

  const product = await getStoreProductDetail(decoded);
  if (!product) notFound();

  return (
    <main className="mx-auto flex-1 max-w-7xl px-4 py-4 sm:px-6 sm:py-5">
      <Link
        href="/shop"
        className="inline-flex text-sm font-semibold text-[#007185] hover:text-[#c55316] hover:underline"
      >
        ← Back to shop
      </Link>

      <ProductDetailView product={product} />
    </main>
  );
}
