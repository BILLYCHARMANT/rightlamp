import Link from "next/link";

export const metadata = {
  title: "Shopping Cart",
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-10 sm:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-ink">
        Shopping Cart
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Same entry point as{" "}
        <Link
          href="/cart"
          className="font-medium text-accent hover:text-accent-muted"
        >
          PV-GRID cart
        </Link>
        . Checkout wiring comes next — browse the catalog and add lines here once
        cart persistence is connected.
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
        <p className="text-sm font-medium text-ink">Your cart is empty</p>
        <p className="mt-2 text-sm text-muted-foreground">
          When session cart or guest checkout is enabled, line items will list here.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex rounded-full bg-brand/94 px-8 py-3 text-sm font-semibold text-ink ring-1 ring-brand/15 transition hover:bg-brand-hover"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
