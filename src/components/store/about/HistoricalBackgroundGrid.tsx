import Image from "next/image";
import { aboutHistory } from "@/lib/company/site-content";

function HistoryTextCell({
  text,
  step,
}: {
  text: string;
  step: number;
}) {
  return (
    <div className="flex min-h-[240px] items-center justify-center bg-surface p-6 sm:p-8 lg:border-r lg:border-border">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
          {step}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {text}
        </p>
      </div>
    </div>
  );
}

function HistoryImageCell({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-full min-h-[240px] w-full bg-surface-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover object-center"
        priority={priority}
      />
    </div>
  );
}

function HistoryNoteCell({ text }: { text: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center bg-brand/5 p-6 sm:p-8">
      <p className="max-w-md text-center text-sm font-medium leading-relaxed text-ink sm:text-base">
        {text}
      </p>
    </div>
  );
}

export function HistoricalBackgroundGrid() {
  const rows = [
    {
      text: aboutHistory.points[0],
      image: aboutHistory.images[0],
      step: 1,
    },
    {
      text: aboutHistory.points[1],
      image: aboutHistory.images[1],
      step: 2,
    },
    {
      text: aboutHistory.points[2],
      note: aboutHistory.servingNote,
      step: 3,
    },
  ] as const;

  return (
    <div className="space-y-4 lg:space-y-0 lg:divide-y lg:divide-border">
      {rows.map((row, index) => (
        <div
          key={row.step}
          className="overflow-hidden rounded-xl border border-border bg-surface shadow-card lg:rounded-none lg:border-0 lg:shadow-none"
        >
          <div className="grid lg:grid-cols-2 lg:items-stretch">
            <HistoryTextCell text={row.text} step={row.step} />
            {"image" in row && row.image ? (
              <HistoryImageCell
                src={row.image.src}
                alt={row.image.alt}
                priority={index === 0}
              />
            ) : (
              <HistoryNoteCell text={"note" in row ? row.note : ""} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
