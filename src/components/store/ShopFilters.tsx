import Link from "next/link";

type Props = {
  categories: string[];
  defaultQ: string;
  defaultCategory: string;
};

export function ShopFilters({
  categories,
  defaultQ,
  defaultCategory,
}: Props) {
  const field =
    "w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-ink placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/14";

  return (
    <form
      action="/shop"
      method="GET"
      className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5"
    >
      <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
        <span className="font-semibold text-ink">Search</span>
        <input
          name="q"
          defaultValue={defaultQ}
          placeholder="Name, category, brand…"
          className={field}
        />
      </label>
      <label className="flex w-full flex-col gap-1.5 text-sm sm:w-72">
        <span className="font-semibold text-ink">Category</span>
        <select
          name="category"
          defaultValue={defaultCategory}
          className={field}
        >
          <option value="">
            All categories (top {categories.length} by volume)
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2 sm:pb-0.5">
        <button
          type="submit"
          className="rounded-full bg-brand/94 px-6 py-2.5 text-sm font-semibold text-ink shadow-md shadow-brand/8 ring-1 ring-brand/15 hover:bg-brand-hover"
        >
          Apply
        </button>
        <Link
          href="/shop"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-ink hover:border-accent hover:text-accent"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
