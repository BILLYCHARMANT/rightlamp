import Image from "next/image";
import Link from "next/link";
import { company, stitchImages } from "@/lib/company/site-content";

/** Storefront header — logo image + PV-GRID wordmark */
export function StoreBrandLogo({
  showWordmark = true,
  shopVariant = false,
}: {
  showWordmark?: boolean;
  shopVariant?: boolean;
}) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-3">
      <Image
        src={stitchImages.brandLogo}
        alt={`${company.shortName} Logo`}
        width={120}
        height={48}
        className="h-12 w-auto object-contain"
        priority
      />
      {showWordmark ? (
        <span className="font-[family-name:var(--font-hanken)] text-xl font-bold text-[#c55316]">
          {shopVariant ? `${company.shortName}.` : company.shortName}
        </span>
      ) : null}
    </Link>
  );
}
