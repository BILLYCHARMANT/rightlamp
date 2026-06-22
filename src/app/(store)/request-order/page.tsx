import Link from "next/link";
import { OrderRequestForm } from "@/components/orders/order-request-form";
import { getActiveOrderBranches } from "@/lib/dashboard/order-branches";
import {
  getOrderableProducts,
  submitOrderRequest,
} from "@/lib/dashboard/order-actions";

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
      <header className="max-w-xl">
        <p className="font-[family-name:var(--font-jetbrains)] text-[10px] font-medium uppercase tracking-[0.2em] text-[#c55316]">
          Order request
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-hanken)] text-3xl font-bold tracking-tight text-[#1c1b1b] sm:text-4xl">
          Tell us what you need
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#424754]">
          A short form — your details, a branch location from our shops, and product
          choices. Our team picks it up in the dashboard and follows up with you.
        </p>
      </header>

      <div className="mt-10 border border-[#E2E8F0] bg-white px-5 py-8 sm:px-8 sm:py-10">
        <OrderRequestForm
          products={products}
          branches={branches}
          defaultProductId={defaultProduct}
          submitLabel="Submit request"
          variant="store"
          onSubmit={submitOrderRequest}
        />
      </div>

      <p className="mt-8 text-center text-sm text-[#424754]">
        Prefer to browse first?{" "}
        <Link href="/shop" className="font-semibold text-[#c55316] hover:underline">
          View shop catalog
        </Link>
      </p>
    </main>
  );
}
