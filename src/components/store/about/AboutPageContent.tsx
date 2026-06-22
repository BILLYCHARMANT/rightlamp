import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Check,
  Heart,
  Leaf,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { aboutPageCopy } from "@/lib/company/site-content";
import { InnovativeCommitteeSection } from "@/components/store/about/InnovativeCommitteeSection";

function StitchLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-jetbrains)] text-xs font-medium uppercase tracking-[0.05em] text-[#c55316]">
      {children}
    </p>
  );
}

function ValueIcon({ tone }: { tone: "primary" | "green" | "yellow" }) {
  const tones = {
    primary: "bg-[#c55316]/10 text-[#c55316]",
    green: "bg-[#10B981]/10 text-[#10B981]",
    yellow: "bg-[#FAB40D]/10 text-[#785400]",
  };
  const icons = { primary: Zap, green: Leaf, yellow: Award };
  const Icon = icons[tone];
  return (
    <span
      className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded ${tones[tone]}`}
    >
      <Icon size={22} strokeWidth={1.75} aria-hidden />
    </span>
  );
}

export function AboutPageContent() {
  return (
    <div className="font-[family-name:var(--font-inter)] text-[#1c1b1b]">
      {/* Hero — Stitch: primary-container split with square image */}
      <section className="relative flex min-h-[60vh] items-center overflow-hidden bg-[#a84310] text-white">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:px-12 md:py-20">
          <div className="space-y-6">
            <span className="inline-block rounded bg-[#10B981]/10 px-3 py-1 font-[family-name:var(--font-jetbrains)] text-xs font-medium uppercase tracking-[0.05em] text-[#10B981]">
              {aboutPageCopy.heroEst}
            </span>
            <h1 className="max-w-xl font-[family-name:var(--font-hanken)] text-[2.25rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-5xl">
              {aboutPageCopy.heroTitle}
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-white/90">
              {aboutPageCopy.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={aboutPageCopy.heroPrimaryHref}
                className="inline-flex items-center justify-center rounded-lg bg-[#FAB40D] px-8 py-4 text-sm font-semibold text-[#271900] shadow-lg transition hover:-translate-y-0.5"
              >
                {aboutPageCopy.heroPrimaryCta}
              </Link>
              <Link
                href={aboutPageCopy.heroSecondaryHref}
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {aboutPageCopy.heroSecondaryCta}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-xl border-4 border-white/10 shadow-2xl">
              <Image
                src={aboutPageCopy.heroImage}
                alt={aboutPageCopy.heroImageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="stitch-glass-panel absolute -bottom-6 -left-6 max-w-[240px] rounded-lg p-6 shadow-xl">
              <p className="font-[family-name:var(--font-hanken)] text-2xl font-semibold text-[#c55316]">
                {aboutPageCopy.heroYearsValue} {aboutPageCopy.heroYearsLabel}
              </p>
              <p className="mt-1 text-sm text-[#424754]">
                {aboutPageCopy.heroYearsCaption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-[#fcf9f8] px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] items-start gap-16 md:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#c55316] sm:text-[2rem]">
                {aboutPageCopy.storyTitle}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#424754]">
                {aboutPageCopy.storyBody}
              </p>
            </div>
            <div className="space-y-4">
              {aboutPageCopy.storyFeatures.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center text-[#10B981]">
                    <Check size={22} strokeWidth={2.5} aria-hidden />
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-hanken)] font-semibold text-[#1c1b1b]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#424754]">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="store-card rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-8">
            <div className="relative mb-6 h-64 overflow-hidden rounded">
              <Image
                src={aboutPageCopy.storyImage}
                alt={aboutPageCopy.storyImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <h3 className="font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#1c1b1b]">
              Our Commitment
            </h3>
            <p className="mt-2 text-base leading-relaxed text-[#424754]">
              &ldquo;{aboutPageCopy.commitmentQuote}&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#f6f3f2] px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto max-w-[1280px] text-center">
          <h2 className="font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#c55316] sm:text-[2rem]">
            {aboutPageCopy.valuesTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-[#424754]">
            {aboutPageCopy.valuesSubtitle}
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {aboutPageCopy.coreValues.map((value) => (
              <article
                key={value.id}
                className="store-card rounded-xl border border-[#E2E8F0] bg-white p-8 text-left transition hover:-translate-y-1"
              >
                <ValueIcon tone={value.iconTone} />
                <h3 className="font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#1c1b1b]">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#424754]">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* From Concept to Reality */}
      <section className="overflow-hidden px-6 py-16 sm:px-12 sm:py-20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-16 md:flex-row">
          <div className="relative md:w-1/2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={aboutPageCopy.impactsImage}
                alt={aboutPageCopy.impactsImageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#c55316]/5 blur-3xl" />
          </div>
          <div className="space-y-8 md:w-1/2">
            <div>
              <StitchLabel>{aboutPageCopy.impactsEyebrow}</StitchLabel>
              <h2 className="mt-2 font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#1c1b1b] sm:text-[2rem]">
                {aboutPageCopy.impactsTitle}
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[#424754]">
                {aboutPageCopy.impactsBody}
              </p>
            </div>
            <ol className="space-y-6">
              {aboutPageCopy.impactsSteps.map((step) => (
                <li key={step.number} className="group flex gap-6">
                  <span className="font-[family-name:var(--font-hanken)] text-2xl font-semibold text-[#c55316]/20 transition group-hover:text-[#c55316]">
                    {step.number}
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-hanken)] font-semibold text-[#1c1b1b]">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-[#424754]">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <InnovativeCommitteeSection />

      {/* Why Choose Us */}
      <section className="bg-[#313030] px-6 py-16 text-[#f3f0ef] sm:px-12 sm:py-20">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="text-center font-[family-name:var(--font-hanken)] text-3xl font-semibold sm:text-[2rem]">
            {aboutPageCopy.whyTitle}
          </h2>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {aboutPageCopy.whyItems.map((item, index) => {
              const Icon = [Heart, Users, Shield][index] ?? Heart;
              return (
                <div key={item.id} className="space-y-4 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center text-[#10B981]">
                    <Icon size={40} strokeWidth={1.5} aria-hidden />
                  </span>
                  <h3 className="font-[family-name:var(--font-hanken)] text-xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed opacity-80">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#c55316] px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="max-w-2xl text-center md:text-left">
            <h2 className="font-[family-name:var(--font-hanken)] text-3xl font-semibold sm:text-[2rem]">
              {aboutPageCopy.ctaTitle}
            </h2>
            <p className="mt-4 text-lg text-white/90">
              {aboutPageCopy.ctaSubtitle}
            </p>
          </div>
          <Link
            href={aboutPageCopy.ctaHref}
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#FAB40D] px-10 py-5 text-sm font-semibold text-[#271900] shadow-xl transition hover:scale-105"
          >
            {aboutPageCopy.ctaButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
