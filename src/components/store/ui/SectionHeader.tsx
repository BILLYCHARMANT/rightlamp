import Link from "next/link";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: { label: string; href: string };
}) {
  const centered = align === "center";

  return (
    <div
      className={
        centered
          ? "mx-auto flex max-w-3xl flex-col items-center text-center"
          : "flex flex-wrap items-end justify-between gap-6"
      }
    >
      <div className={centered ? "w-full" : "max-w-2xl"}>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className={`inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-accent transition hover:text-accent-hover ${centered ? "mt-4" : ""}`}
        >
          {action.label}
          <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
