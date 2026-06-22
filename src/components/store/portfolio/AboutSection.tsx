import Image from "next/image";
import Link from "next/link";
import { aboutHistory, company, homeCopy } from "@/lib/company/site-content";
import { PrimaryButton } from "@/components/store/ui/Buttons";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";

export function AboutSection() {
  return (
    <SectionBand id="about" variant="muted" className="scroll-mt-24 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-accent">
          {homeCopy.aboutEyebrow}
        </p>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div
            className={`relative aspect-[4/3] overflow-hidden ${cardOnBandClass}`}
          >
            <Image
              src={aboutHistory.images[0].src}
              alt={aboutHistory.images[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className={`${cardOnBandClass} p-8 sm:p-10`}>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {homeCopy.aboutTitle}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {homeCopy.aboutBody}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PrimaryButton href="/about">About us</PrimaryButton>
              <Link
                href={`tel:${company.phone}`}
                className={`${cardOnBandClass} inline-flex items-center gap-4 px-5 py-3 transition hover:-translate-y-0.5 hover:shadow-card-lg`}
              >
                <span className="rlsgl-icon-badge rlsgl-icon-badge--sm rlsgl-icon-badge--accent">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5.5A1.5 1.5 0 014.5 4h2.2a1 1 0 01.95.68l.9 2.7a1 1 0 01-.23 1.03l-1.2 1.2a12 12 0 005.2 5.2l1.2-1.2a1 1 0 011.03-.23l2.7.9a1 1 0 01.68.95V19.5A1.5 1.5 0 0117.5 21h-.5C9.5 21 3 14.5 3 6v-.5z"
                    />
                  </svg>
                </span>
                <span className="text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {homeCopy.questionLabel}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-navy">
                    {company.phoneDisplay}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SectionBand>
  );
}
