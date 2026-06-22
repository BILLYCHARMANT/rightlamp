import Image from "next/image";
import { company, homeCopy, stats } from "@/lib/company/site-content";
import { PrimaryButton } from "@/components/store/ui/Buttons";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";

export function AnnouncementBar() {
  return (
    <div className="border-b border-white/10 bg-navy text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-sm sm:px-6">
        <p className="font-medium">
          <span className="font-bold text-accent-muted">{company.shortName}</span>
          {" · "}
          {company.tagline}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
          <a
            href={`mailto:${company.email}`}
            className="text-white/85 transition hover:text-accent-muted"
          >
            {company.email}
          </a>
          <a
            href={`tel:${company.phone}`}
            className="font-semibold text-accent-muted transition hover:text-white"
          >
            {company.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <>
      <section id="home" className="relative min-h-[520px] overflow-hidden sm:min-h-[580px] lg:min-h-[640px]">
        <Image
          src={homeCopy.heroImage}
          alt="PV-GRID electrical and renewable energy projects in Rwanda"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/55 to-navy/30" />

        <div className="relative mx-auto flex min-h-[520px] max-w-7xl flex-col justify-center px-4 py-20 sm:min-h-[580px] sm:px-6 lg:min-h-[640px]">
          <p className="animate-fade-in-up text-xs font-bold uppercase tracking-[0.28em] text-accent-muted">
            {homeCopy.heroWelcome}
          </p>
          <h1 className="animate-fade-in-up animation-delay-100 mt-5 max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {homeCopy.heroTitle}
          </h1>
          <p className="animate-fade-in-up animation-delay-200 mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {homeCopy.heroSubtitle}
          </p>
          <div className="animate-fade-in-up animation-delay-300 mt-9">
            <PrimaryButton href="#about" size="lg">
              {homeCopy.heroCta}
            </PrimaryButton>
          </div>
        </div>
      </section>

      <SectionBand variant="white" className="py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:grid-cols-4 sm:px-6">
          {stats.map((stat) => (
              <div
                key={stat.label}
                className={`${cardOnBandClass} px-5 py-6 text-center`}
              >
                <p className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
              </div>
          ))}
        </div>
      </SectionBand>
    </>
  );
}
