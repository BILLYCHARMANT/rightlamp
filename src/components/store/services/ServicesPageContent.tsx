"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FlaskConical,
  Leaf,
  ShoppingCart,
  Wrench,
  Zap,
} from "lucide-react";
import { pageImages, serviceImage, servicesPageCopy } from "@/lib/company/site-content";
import { StitchReveal } from "@/components/store/stitch/StitchReveal";

function InnovativeCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`stitch-innovative-card rounded-xl border border-[#E2E8F0] ${className}`}
    >
      {children}
    </div>
  );
}

export function ServicesPageContent() {
  return (
    <div className="overflow-x-hidden bg-[#fcf9f8] font-[family-name:var(--font-inter)] text-[#1c1b1b]">
      {/* Hero — Services Innovative Redesign */}
      <header className="relative flex h-[75vh] min-h-[600px] items-center justify-start overflow-hidden bg-[#313030]">
        <div className="absolute inset-0 z-0">
          <Image
            src={servicesPageCopy.heroImage}
            alt={servicesPageCopy.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="stitch-hero-pulse object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#313030] via-[#313030]/60 to-transparent" />
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#c55316 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 sm:px-12">
          <div className="max-w-3xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-[2px] w-12 bg-[#c55316]" />
              <span className="font-[family-name:var(--font-jetbrains)] text-xs font-medium uppercase tracking-widest text-[#f4a261]">
                {servicesPageCopy.eyebrow}
              </span>
            </div>
            <h1 className="mb-8 font-[family-name:var(--font-hanken)] text-4xl font-extrabold uppercase leading-[1.1] tracking-tight text-white md:text-6xl">
              {servicesPageCopy.heroTitle}
              <br />
              <span className="text-[#f4a261]">
                {servicesPageCopy.heroTitleAccent}
              </span>
            </h1>
            <p className="mb-12 max-w-xl text-lg leading-relaxed text-white/80">
              {servicesPageCopy.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href={servicesPageCopy.heroPrimaryHref}
                className="group flex items-center gap-2 rounded-lg bg-[#c55316] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#a84310]"
              >
                {servicesPageCopy.heroPrimaryCta}
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <div className="flex items-center gap-4 text-white/60">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
                  <Zap size={16} aria-hidden />
                </div>
                <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase">
                  {servicesPageCopy.heroBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 right-6 z-10 hidden lg:block">
          <div className="stitch-glass-panel rounded-xl border-l-4 border-l-[#c55316] p-6">
            <div className="font-[family-name:var(--font-hanken)] text-2xl font-bold text-[#c55316]">
              {servicesPageCopy.floatingStat}
            </div>
            <div className="font-[family-name:var(--font-jetbrains)] text-[10px] uppercase text-[#424754]">
              {servicesPageCopy.floatingStatLabel}
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1280px] px-6 py-16 sm:px-12 sm:py-20">
        <div className="absolute top-0 right-0 -z-10 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c55316]/5 blur-3xl" />

        <div className="mb-20 flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-2xl">
            <h2 className="mb-6 flex items-center gap-4 font-[family-name:var(--font-hanken)] text-4xl font-bold uppercase text-[#1c1b1b]">
              <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#c55316] text-lg text-white">
                {servicesPageCopy.sectionNumber}
              </span>
              {servicesPageCopy.sectionTitle}
            </h2>
            <p className="text-lg text-[#424754]">
              {servicesPageCopy.sectionIntro}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="mb-2 font-[family-name:var(--font-jetbrains)] text-sm tracking-tighter text-[#c55316]">
              {servicesPageCopy.sectionStandards}
            </div>
            <div className="flex gap-1">
              <div className="h-1 w-12 bg-[#c55316]" />
              <div className="h-1 w-8 bg-[#c55316]/30" />
              <div className="h-1 w-4 bg-[#c55316]/10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <StitchReveal className="md:col-span-8">
            <InnovativeCard className="group relative flex flex-col overflow-hidden bg-white md:flex-row">
              <div className="flex flex-col justify-between p-10 md:w-1/2">
                <div>
                  <span className="mb-4 block font-[family-name:var(--font-jetbrains)] text-xs uppercase text-[#c55316]">
                    Renewable solutions
                  </span>
                  <h3 className="mb-4 font-[family-name:var(--font-hanken)] text-2xl uppercase text-[#1c1b1b]">
                    Extraction of natural gases.
                  </h3>
                  <p className="mb-8 text-[#424754]">
                    We build biogas digesters both for domestic and institutional
                    use, enabling sustainable waste-to-energy transformation.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-[#f0edec] text-[#c55316]">
                    <Leaf size={22} aria-hidden />
                  </div>
                  <span className="text-sm font-semibold">
                    Sustainable infrastructure
                  </span>
                </div>
              </div>
              <div className="relative h-64 overflow-hidden md:h-auto md:w-1/2">
                <Image
                  src={serviceImage("biogas")}
                  alt="Biogas project"
                  fill
                  sizes="40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-[#c55316]/10 mix-blend-multiply" />
              </div>
            </InnovativeCard>
          </StitchReveal>

          <StitchReveal className="md:col-span-4">
            <InnovativeCard className="group relative flex h-full flex-col justify-between overflow-hidden bg-[#f6f3f2] p-10">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#c55316]/5 transition-transform duration-500 group-hover:scale-150" />
              <div>
                <ShoppingCart
                  className="mb-6 text-[#c55316]"
                  size={36}
                  aria-hidden
                />
                <h3 className="mb-4 font-[family-name:var(--font-hanken)] text-xl uppercase">
                  Retail sale of electrical appliances.
                </h3>
                <p className="text-sm text-[#424754]">
                  Retail shops stocking high-efficiency electrical equipment
                  including industrial lamps, professional cabling, and more.
                </p>
              </div>
              <div className="mt-8">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-[#c55316] transition-all hover:gap-4"
                >
                  Browse catalogue
                  <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </InnovativeCard>
          </StitchReveal>

          <StitchReveal className="md:col-span-5">
            <InnovativeCard className="group relative overflow-hidden bg-white">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={serviceImage("installation")}
                  alt="Field engineer"
                  fill
                  sizes="35vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="rounded bg-[#c55316] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase text-white">
                    Installation
                  </span>
                </div>
              </div>
              <div className="p-10">
                <h3 className="mb-4 font-[family-name:var(--font-hanken)] text-2xl uppercase">
                  Electrical installation.
                </h3>
                <p className="mb-6 text-[#424754]">
                  Implementing energy saving lighting, motor controls, and
                  advanced solar panel systems for maximum efficiency.
                </p>
                <div className="flex gap-2">
                  {["Solar", "HVAC", "Controls"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#f0edec] px-2 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </InnovativeCard>
          </StitchReveal>

          <StitchReveal className="md:col-span-7">
            <InnovativeCard className="group relative overflow-hidden bg-[#c55316] text-white">
              <div className="absolute inset-0 opacity-20">
                <Image
                  src={serviceImage("research")}
                  alt="Technical tools"
                  fill
                  sizes="50vw"
                  className="object-cover grayscale"
                />
              </div>
              <div className="absolute inset-0 bg-[#c55316]/80 backdrop-blur-sm" />
              <div className="relative z-10 flex h-full max-w-2xl flex-col justify-center p-12">
                <FlaskConical
                  className="mb-6 text-[#FAB40D]"
                  size={48}
                  aria-hidden
                />
                <h3 className="mb-6 font-[family-name:var(--font-hanken)] text-3xl uppercase">
                  Research &amp; implementation.
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-white/90">
                  We participate in renewable energy innovation by bringing new
                  energy projects to Rwanda, specializing in technology transfer
                  and pilot programs.
                </p>
                <Link
                  href="/portfolio"
                  className="self-start rounded bg-white px-8 py-3 text-sm font-semibold text-[#c55316] transition hover:shadow-xl"
                >
                  View innovations
                </Link>
              </div>
              <div className="absolute right-0 top-0 m-8 h-24 w-24 border-r-4 border-t-4 border-[#FAB40D]/30" />
            </InnovativeCard>
          </StitchReveal>

          <StitchReveal className="md:col-span-4">
            <InnovativeCard className="stitch-offset-border group flex flex-col bg-white p-10">
              <div className="mb-8 flex items-start justify-between">
                <div className="rounded-lg bg-[#c55316]/5 p-3">
                  <Wrench className="text-[#c55316]" size={28} aria-hidden />
                </div>
              </div>
              <h3 className="mb-4 font-[family-name:var(--font-hanken)] text-xl uppercase">
                Repair &amp; maintenance.
              </h3>
              <p className="mb-6 text-sm text-[#424754]">
                Rapid troubleshooting, comprehensive repairs, and maintenance
                contracts. We replace lamps, ballasts, and optimize aging
                systems.
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-[#E2E8F0] pt-6">
                <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase text-[#424754]">
                  24/7 support available
                </span>
                <Clock className="text-[#c55316]" size={18} aria-hidden />
              </div>
            </InnovativeCard>
          </StitchReveal>

          <StitchReveal className="md:col-span-8">
            <InnovativeCard className="group relative flex flex-col overflow-hidden bg-[#f0edec] md:flex-row">
              <div className="flex flex-col justify-center p-12 md:w-2/3">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded bg-[#10B981] px-3 py-1 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase text-white">
                    Proudly Rwandan
                  </div>
                  <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase text-[#424754]">
                    Manufacturing division
                  </span>
                </div>
                <h3 className="mb-6 font-[family-name:var(--font-hanken)] text-3xl font-bold uppercase">
                  Domestic appliance manufacturing.
                </h3>
                <p className="mb-8 text-lg text-[#424754]">
                  We manufacture improved cook stoves that utilize electricity,
                  specifically engineered as &ldquo;Made in Rwanda&rdquo;
                  extensions for modern homes.
                </p>
                <div className="flex flex-wrap items-center gap-6">
                  {["Efficient power", "Locally sourced"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <CheckCircle2
                        className="text-[#10B981]"
                        size={18}
                        aria-hidden
                      />
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-64 md:h-auto md:w-1/3">
                <Image
                  src={serviceImage("manufacture")}
                  alt="Manufacturing"
                  fill
                  sizes="30vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </InnovativeCard>
          </StitchReveal>
        </div>
      </main>

      <section className="relative overflow-hidden bg-[#313030] px-6 py-16 sm:px-12 sm:py-20">
        <div className="stitch-slanted-bg absolute right-0 top-0 -z-0 h-full w-1/2 bg-[#c55316]/5" />
        <div className="relative z-10 mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-20 px-6 md:grid-cols-2">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-xl shadow-2xl">
              <Image
                src={pageImages.servicesCta}
                alt="Project site"
                fill
                sizes="50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#c55316]/20 mix-blend-overlay" />
            </div>
            <div className="absolute -bottom-10 -right-10 rounded-lg bg-[#c55316] p-10 shadow-2xl">
              <div className="mb-2 font-[family-name:var(--font-hanken)] text-6xl font-bold leading-none text-white">
                {servicesPageCopy.ctaYears}
              </div>
              <div className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-white/80">
                {servicesPageCopy.ctaYearsLabel}
              </div>
            </div>
          </div>
          <div>
            <h2 className="mb-8 font-[family-name:var(--font-hanken)] text-4xl font-bold uppercase leading-tight text-white md:text-5xl">
              {servicesPageCopy.ctaTitle}
              <br />
              <span className="text-[#f4a261]">
                {servicesPageCopy.ctaTitleAccent}
              </span>
            </h2>
            <p className="mb-12 text-lg leading-relaxed text-white/70">
              {servicesPageCopy.ctaBody}
            </p>
            <div className="flex flex-col gap-6 sm:flex-row">
              <Link
                href={servicesPageCopy.ctaPrimaryHref}
                className="rounded-lg bg-[#c55316] px-10 py-5 text-center text-sm font-semibold text-white transition hover:-translate-y-1 hover:shadow-2xl"
              >
                {servicesPageCopy.ctaPrimary}
              </Link>
              <Link
                href={servicesPageCopy.ctaSecondaryHref}
                className="rounded-lg border border-white/30 px-10 py-5 text-center text-sm font-semibold text-white transition hover:bg-white/5"
              >
                {servicesPageCopy.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
