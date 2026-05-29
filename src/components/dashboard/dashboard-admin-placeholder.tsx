import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getDashboardRelatedLinks } from "@/lib/dashboard/nav-config";

type DashboardAdminPlaceholderProps = {
  productionPath: string;
  description: string;
  /** Canonical dashboard path for “related hubs” shortcuts */
  primaryHref: string;
};

export function DashboardAdminPlaceholder({
  productionPath,
  description,
  primaryHref,
}: DashboardAdminPlaceholderProps) {
  const related = getDashboardRelatedLinks(primaryHref);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="max-w-2xl space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Mirrors live admin · {productionPath}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      {related.length > 0 ? (
        <section className="rounded-2xl border border-border bg-surface-elevated p-5 shadow-sm shadow-ink/[0.04] ring-1 ring-ink/[0.03] md:p-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Related hubs
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Crew shortcuts — jump between screens people usually pair with this one.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {related.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:border-brand/35 hover:bg-brand/10"
                >
                  {label}
                  <ArrowUpRight size={12} className="opacity-60" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-dashed border-border/90 bg-surface/80 p-8 text-center md:p-10">
        <p className="text-sm font-semibold text-ink">Workspace wiring next</p>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted-foreground">
          Tables and forms land here without renaming routes — operators keep muscle memory;
          engineering plugs APIs into this shell when ready.
        </p>
      </section>
    </div>
  );
}
