import type { DemoDailyPoint } from "@/lib/dashboard/demo-data";

export function DashboardRevenueBars({ data }: { data: DemoDailyPoint[] }) {
  const max = Math.max(...data.map((d) => d.revenueRwf), 1);

  return (
    <div className="flex h-56 items-end gap-2 pt-2">
      {data.map((d) => {
        const pct = Math.max(8, Math.round((d.revenueRwf / max) * 100));
        return (
          <div
            key={d.label}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="flex h-44 w-full flex-col justify-end">
              <div
                className="mx-auto w-full max-w-[2.75rem] rounded-t-md bg-gradient-to-t from-brand/95 to-brand/55 shadow-sm ring-1 ring-brand/20"
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
