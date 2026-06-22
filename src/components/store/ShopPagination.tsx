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
    "rounded-lg px-5 py-2.5 text-sm font-semibold transition";

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-3"
      aria-label="Pagination"
    >
      {page <= 1 ? (
        <span className={`${pill} text-[#727786]`}>Previous</span>
      ) : (
        <Link
          href={href(page - 1)}
          className={`${pill} border border-[#E2E8F0] bg-white text-[#1c1b1b] hover:border-[#c55316]`}
        >
          Previous
        </Link>
      )}
      <span className="rounded-lg border border-[#E2E8F0] bg-[#f6f3f2] px-4 py-2 text-sm font-medium text-[#424754]">
        Page {page} of {totalPages}
      </span>
      {page >= totalPages ? (
        <span className={`${pill} text-[#727786]`}>Next</span>
      ) : (
        <Link
          href={href(page + 1)}
          className={`${pill} border border-[#E2E8F0] bg-white text-[#1c1b1b] hover:border-[#c55316]`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
