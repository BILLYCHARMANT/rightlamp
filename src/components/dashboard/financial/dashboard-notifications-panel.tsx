"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import type { DashboardNotification } from "@/lib/dashboard/financial-overview";
import {
  DashboardEcomCard,
  DashboardEcomPanelHeader,
} from "@/components/dashboard/ui/dashboard-ecom";

const toneClass: Record<DashboardNotification["tone"], string> = {
  brand: "bg-brand/12 text-brand",
  warn: "bg-amber-500/12 text-amber-800",
  danger: "bg-danger/12 text-danger",
  accent: "bg-accent/12 text-accent",
};

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function DashboardNotificationsPanel({
  items,
}: {
  items: DashboardNotification[];
}) {
  return (
    <DashboardEcomCard>
      <DashboardEcomPanelHeader
        title="Notifications"
        action={
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--dash-accent-yellow)]/25 text-[#2c3e50]">
            <Bell size={16} aria-hidden />
          </span>
        }
      />
      {items.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {items.map((n) => {
            const inner = (
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${toneClass[n.tone]}`}
                  aria-hidden
                >
                  !
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.detail}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatWhen(n.at)}
                  </p>
                </div>
              </div>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link
                    href={n.href}
                    className="block px-5 py-3.5 transition hover:bg-slate-50/60"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="px-5 py-3.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No new notifications.
        </p>
      )}
    </DashboardEcomCard>
  );
}
