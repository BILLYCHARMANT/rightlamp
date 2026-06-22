import type { DemoDailyPoint } from "@/lib/dashboard/demo-data";

export function DashboardRevenueBars({ data }: { data: DemoDailyPoint[] }) {
  const max = Math.max(...data.map((d) => d.revenueRwf), 1);

  return (
    <div className="flex h-52 items-end gap-1.5 sm:gap-2">
      {data.map((d) => {
        const pct = Math.max(6, Math.round((d.revenueRwf / max) * 100));
        return (
          <div
            key={d.label}
            className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="relative flex h-40 w-full flex-col justify-end">
              <div
                className="mx-auto w-full max-w-[2.25rem] rounded-t-lg bg-gradient-to-t from-brand to-brand/50 shadow-sm ring-1 ring-brand/15 transition group-hover:from-brand-hover group-hover:to-brand/60 sm:max-w-[2.75rem]"
                style={{ height: `${pct}%` }}
                title={`${d.label}: ${d.revenueRwf.toLocaleString()} RWF`}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
