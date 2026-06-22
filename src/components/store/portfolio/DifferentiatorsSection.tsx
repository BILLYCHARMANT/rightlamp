import { differentiators, homeCopy } from "@/lib/company/site-content";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";

const iconBadgeTones = [
  "rlsgl-icon-badge--accent",
  "rlsgl-icon-badge--warm",
  "rlsgl-icon-badge--accent-dk",
] as const;

export function DifferentiatorsSection() {
  return (
    <SectionBand variant="muted" className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {homeCopy.differentiatorsTitle}
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {differentiators.map((item, index) => (
            <article
              key={item.id}
              className={`${cardOnBandClass} animate-card-grid p-8 text-center transition hover:-translate-y-1 hover:shadow-card-lg`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`rlsgl-icon-badge rlsgl-icon-badge--md mx-auto ${iconBadgeTones[index % iconBadgeTones.length]}`}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </SectionBand>
  );
}
