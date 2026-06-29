import Link from "next/link";
import { ProductOrderRequestWizard } from "@/components/orders/product-order-request-wizard";
import { getActiveOrderBranches } from "@/lib/dashboard/order-branches";
import { getOrderableProducts } from "@/lib/dashboard/order-actions";

export default async function RequestOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const sp = await searchParams;
  const [products, branches] = await Promise.all([
    getOrderableProducts(),
    getActiveOrderBranches(),
  ]);
  const defaultProduct =
    products.find((p) => p.slug === sp.product)?.id ?? products[0]?.id;

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
      <div className="border border-[#E2E8F0] bg-white px-5 py-8 sm:px-8 sm:py-10">
        <ProductOrderRequestWizard
          products={products}
          branches={branches}
          defaultProductId={defaultProduct}
        />
      </div>

      <p className="mt-8 text-center text-sm text-[#424754]">
        Prefer to browse first?{" "}
        <Link href="/shop" className="font-semibold text-[#c55316] hover:underline">
          View shop catalog
        </Link>
        {" · "}
        <Link href="/" className="font-semibold text-[#c55316] hover:underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
