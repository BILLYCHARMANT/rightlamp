"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  Send,
  Zap,
} from "lucide-react";
import { company, contactPageCopy } from "@/lib/company/site-content";

function ContactField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#424754]">
        {label}
      </span>
      <div className="stitch-contact-field-shell">{children}</div>
    </label>
  );
}

const inputClass = "stitch-contact-field";

export function ContactPageContent() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const org = String(data.get("company") ?? "");
    const email = String(data.get("email") ?? "");
    const projectType = String(data.get("projectType") ?? "");
    const message = String(data.get("message") ?? "");

    const body = [
      `Name: ${name}`,
      org ? `Company: ${org}` : null,
      email ? `Email: ${email}` : null,
      `Project type: ${projectType}`,
      "",
      message,
    ]
      .filter(Boolean)
      .join("\n");

    const mailto = `mailto:${company.email}?subject=${encodeURIComponent(
      `PV-GRID Project Inquiry — ${projectType}`,
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
  }

  return (
    <div className="overflow-x-hidden bg-[#fcf9f8] font-[family-name:var(--font-inter)] text-[#1c1b1b]">
      {/* Hero */}
      <section className="relative flex min-h-[50vh] items-center overflow-hidden bg-[#313030] py-16 sm:min-h-[60vh] sm:py-20">
        <div className="absolute inset-0 z-0 opacity-40">
          <Image
            src={contactPageCopy.heroImage}
            alt={contactPageCopy.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#313030] via-[#313030]/80 to-transparent" />
        <div className="relative z-20 mx-auto w-full max-w-[1280px] px-6 sm:px-12">
          <div className="max-w-3xl">
            <span className="mb-4 block font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#10B981]">
              {contactPageCopy.heroEyebrow}
            </span>
            <h1 className="mb-6 font-[family-name:var(--font-hanken)] text-4xl font-bold leading-none text-[#fbfaff] sm:text-5xl">
              {contactPageCopy.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#e5e2e1]">
              {contactPageCopy.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="stitch-technical-grid py-16 sm:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-6 sm:px-12 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-5">
            <div className="stitch-edge-marker store-card border border-[#E2E8F0] bg-white p-8">
              <h3 className="mb-6 font-[family-name:var(--font-hanken)] text-2xl font-semibold text-[#c55316]">
                {contactPageCopy.channelsTitle}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone
                    size={24}
                    className="shrink-0 text-[#c55316]"
                    aria-hidden
                  />
                  <div>
                    <p className="mb-1 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#424754]">
                      {contactPageCopy.phoneLabel}
                    </p>
                    <a
                      href={`tel:${company.phone}`}
                      className="font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#1c1b1b] transition hover:text-[#c55316]"
                    >
                      {company.phone}
                    </a>
                    <p className="mt-1 font-medium text-[#10B981]">
                      {contactPageCopy.phoneNote}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail
                    size={24}
                    className="shrink-0 text-[#c55316]"
                    aria-hidden
                  />
                  <div>
                    <p className="mb-1 font-[family-name:var(--font-jetbrains)] text-xs uppercase tracking-widest text-[#424754]">
                      {contactPageCopy.emailLabel}
                    </p>
                    <a
                      href={`mailto:${company.email}`}
                      className="font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#1c1b1b] transition hover:text-[#c55316]"
                    >
                      {company.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#c55316] p-8 text-white">
              <h3 className="mb-4 font-[family-name:var(--font-hanken)] text-2xl font-semibold">
                {contactPageCopy.hubTitle}
              </h3>
              <div className="flex items-start gap-4">
                <MapPin size={24} className="shrink-0" aria-hidden />
                <div>
                  <p className="leading-relaxed opacity-90">
                    {contactPageCopy.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                  <div className="mt-6">
                    <a
                      href={contactPageCopy.mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 border-b border-white pb-1 text-sm font-semibold uppercase tracking-wider transition hover:opacity-80"
                    >
                      {contactPageCopy.mapLabel}
                      <ArrowRight size={18} aria-hidden />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="stitch-glass-panel relative overflow-hidden border border-[#E2E8F0] p-8 md:p-12">
              <div className="pointer-events-none absolute right-0 top-0 opacity-5">
                <Zap size={128} className="text-[#c55316]" aria-hidden />
              </div>
              <div className="relative mb-8">
                <h2 className="mb-2 font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#1c1b1b]">
                  {contactPageCopy.formTitle}
                </h2>
                <p className="text-[#424754]">{contactPageCopy.formSubtitle}</p>
              </div>

              {submitted ? (
                <div className="rounded border border-[#10B981]/30 bg-[#10B981]/10 p-6 text-[#1c1b1b]">
                  <p className="font-semibold">Inquiry ready to send.</p>
                  <p className="mt-2 text-sm text-[#424754]">
                    Your email client should open with the inquiry details. You
                    can also reach us directly at{" "}
                    <a
                      href={`mailto:${company.email}`}
                      className="font-semibold text-[#c55316] hover:underline"
                    >
                      {company.email}
                    </a>
                    .
                  </p>
                  <Link
                    href="/custom-product"
                    className="mt-4 inline-flex text-sm font-semibold text-[#c55316] hover:underline"
                  >
                    Request a custom product quote →
                  </Link>
                </div>
              ) : (
                <form className="relative space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ContactField label={contactPageCopy.formFields.nameLabel}>
                      <input
                        name="name"
                        required
                        placeholder={contactPageCopy.formFields.namePlaceholder}
                        className={inputClass}
                      />
                    </ContactField>
                    <ContactField label={contactPageCopy.formFields.companyLabel}>
                      <input
                        name="company"
                        placeholder={contactPageCopy.formFields.companyPlaceholder}
                        className={inputClass}
                      />
                    </ContactField>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ContactField label={contactPageCopy.formFields.emailLabel}>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder={contactPageCopy.formFields.emailPlaceholder}
                        className={inputClass}
                      />
                    </ContactField>
                    <ContactField label={contactPageCopy.formFields.projectLabel}>
                      <select
                        name="projectType"
                        required
                        className={inputClass}
                        defaultValue={contactPageCopy.projectTypes[0]}
                      >
                        {contactPageCopy.projectTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </ContactField>
                  </div>
                  <ContactField label={contactPageCopy.formFields.messageLabel}>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      placeholder={contactPageCopy.formFields.messagePlaceholder}
                      className={inputClass}
                    />
                  </ContactField>
                  <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-3 bg-[#c55316] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-[#a84310] active:scale-[0.98]"
                    >
                      {contactPageCopy.submitLabel}
                      <Send size={20} aria-hidden />
                    </button>
                    <span className="text-sm italic text-[#424754]">
                      {contactPageCopy.securityNote}
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Visual anchor */}
      <section className="relative h-[320px] overflow-hidden sm:h-[400px]">
        <Image
          src={contactPageCopy.anchorImage}
          alt={contactPageCopy.anchorImageAlt}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#c55316]/20 mix-blend-overlay" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="store-card max-w-2xl border border-[#E2E8F0] bg-white/90 p-8 text-center backdrop-blur-sm sm:p-12">
            <h2 className="mb-4 font-[family-name:var(--font-hanken)] text-3xl font-semibold text-[#c55316]">
              {contactPageCopy.anchorTitle}
            </h2>
            <p className="text-[#424754]">{contactPageCopy.anchorBody}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
