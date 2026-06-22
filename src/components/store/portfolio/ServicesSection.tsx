"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ServiceIcon } from "@/components/store/services/ServiceIcon";
import { homeCopy, services } from "@/lib/company/site-content";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";

const serviceTabs = [
  { id: "contracting", label: "Installation & maintenance" },
  { id: "renewable", label: "Renewable energy" },
  { id: "retail", label: "Retail & products" },
] as const;

const tabServiceIds: Record<(typeof serviceTabs)[number]["id"], string[]> = {
  contracting: ["installation", "maintenance", "manufacture"],
  renewable: ["biogas", "research"],
  retail: ["retail"],
};

export function ServicesSection() {
  const [activeTab, setActiveTab] =
    useState<(typeof serviceTabs)[number]["id"]>("contracting");

  const visible = services.filter((s) =>
    tabServiceIds[activeTab].includes(s.id),
  );

  return (
    <SectionBand
      id="services"
      variant="white"
      className="scroll-mt-24 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-accent">
          {homeCopy.servicesEyebrow}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:gap-3">
          {serviceTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-navy text-white shadow-card"
                  : "store-card border border-border bg-white text-muted-foreground hover:border-navy/30 hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service, index) => {
            const iconTones = [
              "rlsgl-icon-badge--accent",
              "rlsgl-icon-badge--warm",
              "rlsgl-icon-badge--navy",
            ];
            return (
              <article
                key={service.id}
                className={`${cardOnBandClass} animate-card-grid group overflow-hidden`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                  <div
                    className={`rlsgl-icon-badge rlsgl-icon-badge--sm absolute bottom-3 left-3 shadow-card ${iconTones[index % iconTones.length]}`}
                  >
                    <ServiceIcon icon={service.icon} className="h-5 w-5" />
                  </div>
                </div>
                <div className="bg-white p-5">
                  <h3 className="text-lg font-bold text-ink">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 rounded-full border border-navy bg-navy px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary"
          >
            View all services
            <span aria-hidden>→</span>
          </Link>
        </p>
      </div>
    </SectionBand>
  );
}
