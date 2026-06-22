import Image from "next/image";
import Link from "next/link";
import { BRAND_LOGO, BRAND_LOGO_ALT } from "@/lib/company/brand-assets";

/** Storefront header — official PV-GRID logo (includes wordmark). */
export function StoreBrandLogo({
  showWordmark = false,
  shopVariant = false,
  className = "",
}: {
  showWordmark?: boolean;
  shopVariant?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`flex shrink-0 items-center gap-3 ${className}`.trim()}
    >
      <Image
        src={BRAND_LOGO}
        alt={BRAND_LOGO_ALT}
        width={200}
        height={80}
        className="h-14 w-auto object-contain sm:h-16"
        priority
      />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-hanken)] text-xl font-bold text-[#e85d04]">
          {shopVariant ? "PV-GRID." : "PV-GRID"}
        </span>
      ) : null}
    </Link>
  );
}
