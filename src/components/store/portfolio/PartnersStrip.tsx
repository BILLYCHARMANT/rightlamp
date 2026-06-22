import Image from "next/image";
import { homeCopy, partners, type Partner } from "@/lib/company/site-content";
import { SectionBand, cardOnBandClass } from "@/components/store/ui/SectionBand";

const PARTNER_ROW_IDS: [string[], string[]] = [
  ["p1", "p2", "p3", "p4"],
  ["minecofin", "minirena", "wda", "minaLoc"],
];

function partnerRows(items: Partner[]): Partner[][] {
  const byId = new Map(items.map((p) => [p.id, p]));
  return PARTNER_ROW_IDS.map((ids) =>
    ids.map((id) => byId.get(id)).filter((p): p is Partner => p != null),
  );
}

function PartnerLogoCard({ partner }: { partner: Partner }) {
  return (
    <div
      className={`${cardOnBandClass} flex h-32 w-[calc(50%-0.5rem)] items-center justify-center px-5 py-4 transition hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-card-lg sm:h-36 sm:w-44 md:h-40 md:w-48 lg:w-52 xl:w-56`}
    >
      <Image
        src={partner.image}
        alt={partner.name}
        width={220}
        height={100}
        className="h-16 w-auto max-w-[92%] object-contain sm:h-20 md:h-24"
        unoptimized={partner.image.endsWith(".gif")}
      />
    </div>
  );
}

export function PartnersStrip() {
  const rows = partnerRows(partners);

  return (
    <SectionBand
      id="partners"
      variant="muted"
      className="scroll-mt-24 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.28em] text-accent">
          {homeCopy.partnersEyebrow}
        </p>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Trusted collaborators across Rwanda
        </h2>

        <div className="mx-auto mt-10 max-w-6xl space-y-5">
          {rows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-5"
            >
              {row.map((partner) => (
                <PartnerLogoCard key={partner.id} partner={partner} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </SectionBand>
  );
}
