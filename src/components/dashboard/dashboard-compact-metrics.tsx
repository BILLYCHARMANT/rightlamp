import type { LucideIcon } from "lucide-react";

export type CompactMetricItem = {
  icon: LucideIcon;
  label: string;
  value: string | number;
};

export function DashboardCompactMetrics({ items }: { items: CompactMetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-surface-elevated px-4 py-3 shadow-sm shadow-ink/[0.02]"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="rounded-md bg-brand/10 p-2 text-brand">
              <Icon size={16} aria-hidden />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="text-xl font-bold tabular-nums tracking-tight text-ink">
            {item.value}
          </p>
        </div>
        );
      })}
    </div>
  );
}
