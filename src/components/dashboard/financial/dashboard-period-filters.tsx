"use client";

import type { FinancialPeriod } from "@/lib/dashboard/financial-period";
import { FINANCIAL_PERIOD_OPTIONS } from "@/lib/dashboard/financial-period";

type Props = {
  period: FinancialPeriod;
  onChange: (period: FinancialPeriod) => void;
};

export function DashboardPeriodFilters({ period, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FINANCIAL_PERIOD_OPTIONS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            period === id
              ? "bg-[var(--dash-accent-yellow)] font-semibold text-[#2c3e50] shadow-sm"
              : "bg-white text-muted-foreground shadow-sm hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
