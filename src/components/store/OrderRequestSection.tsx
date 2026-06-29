import { ProductOrderRequestWizard } from "@/components/orders/product-order-request-wizard";
import { getActiveOrderBranches } from "@/lib/dashboard/order-branches";
import { getOrderableProducts } from "@/lib/dashboard/order-actions";
import { SectionBand } from "@/components/store/ui/SectionBand";

export async function OrderRequestSection({
  defaultProductSlug,
}: {
  defaultProductSlug?: string;
}) {
  const [products, branches] = await Promise.all([
    getOrderableProducts(),
    getActiveOrderBranches(),
  ]);

  const defaultProduct =
    products.find((product) => product.slug === defaultProductSlug)?.id ??
    products[0]?.id;

  return (
    <SectionBand
      id="order-request"
      variant="muted"
      className="scroll-mt-24 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="border border-[#E2E8F0] bg-white px-5 py-8 sm:px-8 sm:py-10">
          <ProductOrderRequestWizard
            products={products}
            branches={branches}
            defaultProductId={defaultProduct}
            compactHeader
          />
        </div>
      </div>
    </SectionBand>
  );
}
