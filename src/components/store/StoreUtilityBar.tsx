import { company } from "@/lib/company/site-content";

export function StoreUtilityBar() {
  return (
    <div className="hidden border-b border-white/10 bg-[#1c1b1b] md:block">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-2 font-[family-name:var(--font-jetbrains)] text-[10px] uppercase tracking-widest text-[#e5e2e1] lg:px-12">
        <div className="flex gap-6">
          <a
            href={`mailto:${company.email}`}
            className="transition hover:text-[#f4a261]"
          >
            {company.email}
          </a>
          <a
            href={`tel:${company.phone}`}
            className="transition hover:text-[#f4a261]"
          >
            {company.phone}
          </a>
        </div>
        <span>{company.hours}</span>
      </div>
    </div>
  );
}
