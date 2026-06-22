import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PortfolioItem } from "@/lib/company/site-content";

export function PortfolioProjectCard({
  item,
  className = "",
  style,
}: {
  item: PortfolioItem;
  className?: string;
  style?: CSSProperties;
}) {  return (
    <article
      style={style}
      className={`group relative overflow-hidden rounded-[var(--radius)] border border-border bg-surface shadow-card transition-shadow hover:shadow-card-lg ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/25 to-transparent opacity-90 transition group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="inline-flex rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
            {item.category}
          </span>
          <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
        </div>
      </div>
      <div className="border-t border-border bg-surface-muted/50 px-4 py-3">
        <Link
          href="/custom-product"
          className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-hover"
        >
          Request similar work <span className="transition group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
