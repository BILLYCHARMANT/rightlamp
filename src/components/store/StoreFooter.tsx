import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/company/brand-assets";
import { company, footerCopy } from "@/lib/company/site-content";

/** Stitch about-us---official-branding-update.html footer */
export function StoreFooter() {
  return (
    <footer
      id="footer-contact"
      className="mt-auto border-t border-[#E2E8F0] bg-[#e5e2e1]"
    >
      <div className="mx-auto grid max-w-[1280px] gap-12 px-6 py-16 sm:px-12 lg:grid-cols-4">
        <div className="space-y-6">
          <Image
            src={BRAND_LOGO}
            alt={BRAND_LOGO_ALT}
            width={200}
            height={80}
            className="h-16 w-auto object-contain"
          />
          <p className="font-[family-name:var(--font-hanken)] text-sm font-semibold text-[#00b4d8]">
            {company.tagline}
          </p>
          <p className="text-sm leading-relaxed text-[#424754]">
            {footerCopy.about}
          </p>
          <div className="space-y-2 text-sm text-[#424754]">
            <p>
              <strong>Phone:</strong>{" "}
              <a
                href={`tel:${company.phone}`}
                className="hover:text-[#c55316]"
              >
                {company.phone}
              </a>
            </p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href={`mailto:${company.email}`}
                className="hover:text-[#c55316]"
              >
                {company.email}
              </a>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-[family-name:var(--font-hanken)] text-lg font-semibold text-[#c55316]">
            Useful Links
          </h4>
          <ul className="space-y-2 text-sm">
            {footerCopy.usefulLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-[#424754] underline transition hover:text-[#c55316]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-[family-name:var(--font-hanken)] text-lg font-semibold text-[#c55316]">
            Our Services
          </h4>
          <ul className="space-y-2 text-sm text-[#424754]">
            {footerCopy.serviceLinks.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-[family-name:var(--font-hanken)] text-lg font-semibold text-[#c55316]">
            {footerCopy.newsletterTitle}
          </h4>
          <p className="text-sm text-[#424754]">{footerCopy.newsletterBody}</p>
          <form action="/contact" method="GET" className="space-y-2">
            <input
              type="email"
              name="newsletter"
              placeholder={footerCopy.newsletterPlaceholder}
              className="w-full rounded border border-[#E2E8F0] bg-white px-4 py-3 text-sm text-[#1c1b1b] outline-none transition focus:border-[#c55316]"
            />
            <button
              type="submit"
              className="w-full rounded bg-[#c55316] py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {footerCopy.newsletterCta}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] border-t border-[#1c1b1b]/10 px-6 py-8 text-center sm:px-12">
        <p className="text-sm text-[#424754]/70">{footerCopy.copyright}</p>
      </div>
    </footer>
  );
}
