import type { PortfolioCategory } from "@/lib/company/site-content";

export function PortfolioFilterTabs({
  categories,
  active,
  onChange,
  sticky = false,
}: {
  categories: PortfolioCategory[];
  active: PortfolioCategory;
  onChange: (cat: PortfolioCategory) => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={
        sticky
          ? "sticky top-16 z-40 -mx-4 border-b border-border bg-canvas/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6"
          : "mt-8"
      }
    >
      <div
        className="flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Portfolio categories"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={active === cat}
            onClick={() => onChange(cat)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              active === cat
                ? "bg-accent text-white shadow-card"
                : "border border-border bg-surface text-muted-foreground hover:border-accent/40 hover:text-ink"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
