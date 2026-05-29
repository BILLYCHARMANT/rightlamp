"use client";

import { CalendarPlus, CalendarDays, MoreHorizontal } from "lucide-react";
import { DEMO_SCHEDULED_VISITS } from "@/lib/dashboard/demo-data";

export function DashboardScheduledVisits({
  visits = DEMO_SCHEDULED_VISITS,
}: {
  visits?: typeof DEMO_SCHEDULED_VISITS;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm shadow-ink/[0.03] md:p-6">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-ink">Scheduled visits</h2>
          <p className="text-xs text-muted-foreground">
            Showroom consults and on-site lighting surveys.
          </p>
        </div>
        <CalendarDays size={20} className="shrink-0 text-accent" aria-hidden />
      </div>

      <ul className="space-y-3">
        {visits.map((v) => (
          <li
            key={v.id}
            className="rounded-lg border border-border bg-surface p-4 transition hover:border-brand/25"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-brand/10 text-[10px] font-bold leading-tight text-brand ring-1 ring-brand/15">
                  {v.dayParts.split(" ").map((part) => (
                    <span key={part}>{part}</span>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{v.headline}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{v.detail}</p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-surface-elevated hover:text-ink"
                aria-label="More actions"
              >
                <MoreHorizontal size={18} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-3 text-sm font-semibold text-accent transition hover:border-accent hover:bg-accent/5"
      >
        <CalendarPlus size={18} aria-hidden />
        Schedule visit
      </button>
    </section>
  );
}
