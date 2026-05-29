import Link from "next/link";

export function ShopPagination({
  page,
  totalPages,
  q,
  category,
}: {
  page: number;
  totalPages: number;
  q: string;
  category: string;
}) {
  function href(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return s ? `/shop?${s}` : "/shop";
  }

  if (totalPages <= 1) return null;

  const pill =
    "rounded-full px-5 py-2.5 text-sm font-semibold transition";

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
      aria-label="Pagination"
    >
      {page <= 1 ? (
        <span className={`${pill} text-muted-foreground`}>Previous</span>
      ) : (
        <Link
          href={href(page - 1)}
          className={`${pill} border border-border bg-surface-elevated text-ink hover:border-brand`}
        >
          Previous
        </Link>
      )}
      <span className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page >= totalPages ? (
        <span className={`${pill} text-muted-foreground`}>Next</span>
      ) : (
        <Link
          href={href(page + 1)}
          className={`${pill} border border-border bg-surface-elevated text-ink hover:border-brand`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
