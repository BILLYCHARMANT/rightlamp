import Link from "next/link";
import { company, homeCopy } from "@/lib/company/site-content";
import { PrimaryButton } from "@/components/store/ui/Buttons";

const contactItems = [
  {
    id: "location",
    label: "Location",
    value: company.location,
    href: undefined,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19.5 11.5c0 5.25-7.5 9.5-7.5 9.5S4.5 16.75 4.5 11.5a7.5 7.5 0 1115 0z"
      />
    ),
  },
  {
    id: "phone",
    label: "Phone",
    value: company.phoneDisplay,
    sub: company.hours,
    href: `tel:${company.phone}`,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5.5A1.5 1.5 0 014.5 4h2.2a1 1 0 01.95.68l.9 2.7a1 1 0 01-.23 1.03l-1.2 1.2a12 12 0 005.2 5.2l1.2-1.2a1 1 0 011.03-.23l2.7.9a1 1 0 01.68.95V19.5A1.5 1.5 0 0117.5 21h-.5C9.5 21 3 14.5 3 6v-.5z"
      />
    ),
  },
  {
    id: "email",
    label: "Email",
    value: company.email,
    href: `mailto:${company.email}`,
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6.5h16v11H4V6.5zm0 0l8 6 8-6"
      />
    ),
  },
] as const;

export function QuoteCTA() {
  return (
    <section
      id="contact"
      className="rlsgl-band--contact w-full scroll-mt-24 py-16 text-white sm:py-24"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-accent-muted">
          {homeCopy.contactTitle}
        </p>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem]">
          Let&apos;s power your next project
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
          {homeCopy.contactSubtitle}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryButton href="/contact" size="lg">
            Get a quote
          </PrimaryButton>
          <Link
            href={`tel:${company.phone}`}
            className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/15"
          >
            Call us
          </Link>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {contactItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center gap-3 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-navy shadow-card">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  className="h-6 w-6"
                  aria-hidden
                >
                  {item.icon}
                </svg>
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/65">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-1 block text-sm font-semibold text-white transition hover:text-accent-muted sm:text-base"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-white sm:text-base">
                    {item.value}
                  </p>
                )}
                {"sub" in item && item.sub ? (
                  <p className="mt-1 text-xs text-white/70">{item.sub}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
