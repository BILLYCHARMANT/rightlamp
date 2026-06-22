"use client";

import Image from "next/image";
import { Cog, User } from "lucide-react";
import { aboutPageCopy, teamMembers } from "@/lib/company/site-content";

type CommitteeSlot = (typeof aboutPageCopy.committeeMembers)[number];

function offsetClass(offset: CommitteeSlot["offset"]) {
  if (offset === "center") return "md:-translate-y-4 md:z-20";
  if (offset === "high") return "md:translate-y-12";
  return "md:translate-y-8";
}

function PlaceholderIcon({ icon }: { icon: CommitteeSlot["placeholderIcon"] }) {
  const Icon = icon === "engineering" ? Cog : User;
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f0edec]">
      <Icon className="text-[#c55316]/30" size={96} strokeWidth={1.25} aria-hidden />
    </div>
  );
}

function InnovativeCommitteeCard({
  name,
  role,
  image,
  tag,
  variant,
  placeholderIcon,
}: {
  name: string;
  role: string;
  image: string;
  tag: string;
  variant: CommitteeSlot["variant"];
  placeholderIcon?: CommitteeSlot["placeholderIcon"];
}) {
  const shell =
    variant === "primary"
      ? "bg-[#c55316]/5 backdrop-blur-xl border-[#c55316]/20"
      : "stitch-glass-panel border-white/40";

  return (
    <div
      className={`store-card rounded-xl border p-4 transition-all duration-500 hover:-translate-y-4 ${shell}`}
    >
      <div className="stitch-profile-mask relative mb-6 aspect-[4/5] overflow-hidden bg-[#f0edec]">
        {image ? (
          <>
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#c55316]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <Image
              src={image}
              alt={`${name}, ${role}`}
              fill
              sizes="(max-width: 768px) 100vw, 30vw"
              className="object-cover object-center grayscale transition-all duration-700 group-hover:grayscale-0"
            />
          </>
        ) : (
          <PlaceholderIcon icon={placeholderIcon ?? "person"} />
        )}
      </div>
      <div className="px-2 pb-4">
        <p className="mb-1 font-[family-name:var(--font-jetbrains)] text-[10px] font-bold uppercase tracking-widest text-[#c55316]">
          {tag}
        </p>
        <h4 className="mb-2 font-[family-name:var(--font-hanken)] text-xl font-semibold text-[#1c1b1b]">
          {name}
        </h4>
        <div className="flex items-center gap-2">
          <span className="h-px w-6 bg-[#c55316]/30" />
          <span className="font-[family-name:var(--font-jetbrains)] text-xs uppercase text-[#424754]">
            {role}
          </span>
        </div>
      </div>
    </div>
  );
}

export function InnovativeCommitteeSection() {
  const byId = Object.fromEntries(teamMembers.map((m) => [m.id, m]));

  return (
    <section
      id="committee"
      className="stitch-technical-bg relative scroll-mt-28 overflow-hidden px-6 py-16 sm:px-12 sm:py-20"
    >
      <div className="pointer-events-none absolute -right-48 -top-48 h-96 w-96 rounded-full bg-[#c55316]/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-[#10B981]/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-[1280px]">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 lg:mb-20 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-4 font-[family-name:var(--font-jetbrains)] text-xs font-bold uppercase tracking-[0.2em] text-[#c55316]">
              {aboutPageCopy.committeeEyebrow}
            </p>
            <h2 className="font-[family-name:var(--font-hanken)] text-4xl font-bold tracking-tight text-[#1c1b1b] sm:text-5xl">
              {aboutPageCopy.committeeTitle}{" "}
              <span className="italic text-[#c55316]">
                {aboutPageCopy.committeeTitleAccent}
              </span>
            </h2>
            <div className="mt-4 h-1.5 w-24 rounded-full bg-[#c55316]" />
          </div>
          <p className="max-w-md text-lg text-[#424754] lg:text-right">
            {aboutPageCopy.committeeAside}
          </p>
        </div>

        <div className="relative grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-y-0">
          {aboutPageCopy.committeeMembers.map((slot) => {
            const member = byId[slot.id];
            if (!member) return null;
            return (
              <div
                key={slot.id}
                className={`group md:col-span-4 ${offsetClass(slot.offset)}`}
              >
                <InnovativeCommitteeCard
                  name={member.name}
                  role={member.role}
                  image={member.image}
                  tag={slot.tag}
                  variant={slot.variant}
                  placeholderIcon={slot.placeholderIcon}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
