"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  href?: string;
  disabled?: boolean;
};

export function DashboardQuickActionCard({
  icon,
  label,
  href,
  disabled,
}: Props) {
  const base =
    "flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-surface-elevated/95 p-6 text-center shadow-sm shadow-ink/[0.04] ring-1 ring-ink/[0.03] transition-all";

  const interactive =
    "cursor-pointer hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10 hover:ring-brand/15";

  const content = (
    <>
      <div className="rounded-lg bg-brand/10 p-4 text-brand transition-colors group-hover:bg-brand/16">
        {icon}
      </div>
      <span className="text-sm font-medium text-ink">{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={`group ${base} ${interactive}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={`group ${base} ${disabled ? "cursor-not-allowed opacity-55" : interactive}`}
    >
      {content}
    </button>
  );
}
