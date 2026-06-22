import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import {
  teamCardSlots,
  teamIntro,
  teamMembersByCarousel,
  type TeamCarouselSlot,
  type TeamMember,
} from "@/lib/company/site-content";

function TeamCard({
  member,
  slot,
}: {
  member: TeamMember;
  slot: TeamCarouselSlot;
}) {
  const size = teamCardSlots[slot];

  return (
    <div
      className={`relative min-w-0 shrink-0 overflow-hidden rounded-lg sm:rounded-xl ${size.flex} ${size.aspect}`}
    >
      {member.image ? (
        <Image
          src={member.image}
          alt={`${member.name}, ${member.role}`}
          fill
          sizes="(max-width: 640px) 18vw, (max-width: 1024px) 15vw, 180px"
          className="object-cover object-center"
          priority={member.id === "md"}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#f0edec]">
          <User className="text-[#c55316]/25" size={48} aria-hidden />
        </div>
      )}
    </div>
  );
}

export function TeamHierarchySection() {
  const items = teamMembersByCarousel();

  return (
    <section className="relative bg-white py-16 sm:py-20">
      <div
        className="absolute inset-y-0 left-0 w-3 bg-navy sm:w-4"
        aria-hidden
      />
      <div
        className="absolute inset-y-0 right-0 w-3 bg-navy sm:w-4"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-center gap-2 sm:max-w-5xl sm:gap-3 md:max-w-6xl md:gap-4">
            {items.map(({ key, member, slot }) => (
              <TeamCard key={key} member={member} slot={slot} />
            ))}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-xl text-center sm:mt-12">
          <p className="text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {teamIntro}
          </p>
          <Link
            href="/custom-product"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-navy px-10 py-3.5 text-sm font-semibold text-white transition hover:bg-primary"
          >
            Check Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
