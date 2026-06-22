"use client";

type Point = { label: string; value: number };

function maxValue(points: Point[]) {
  return Math.max(...points.map((p) => p.value), 1);
}

export function ShopTrendChart({
  title,
  points,
  formatValue,
  stroke = "#6366f1",
}: {
  title: string;
  points: Point[];
  formatValue: (value: number) => string;
  stroke?: string;
}) {
  const max = maxValue(points);
  const width = 560;
  const height = 180;
  const pad = 24;

  const coords = points.map((point, index) => {
    const x = pad + (index / Math.max(points.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - (point.value / max) * (height - pad * 2);
    return { x, y, label: point.label };
  });

  const line = coords.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`;

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {points.length === 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">No data in this period.</p>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-44 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`fill-${title.replace(/\s+/g, "-")}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill={`url(#fill-${title.replace(/\s+/g, "-")})`} />
            <path d={line} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="mt-2 flex justify-between gap-1 text-[10px] text-slate-400">
            {coords.map((point) => (
              <span key={point.label} className="min-w-0 flex-1 truncate text-center">
                {point.label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Peak: {formatValue(Math.max(...points.map((p) => p.value)))}
          </p>
        </>
      )}
    </section>
  );
}

export function ShopDistributionChart({
  title,
  slices,
  formatValue,
}: {
  title: string;
  slices: Point[];
  formatValue: (value: number) => string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const colors = ["#6366f1", "#f97316", "#ef4444", "#0ea5e9", "#22c55e", "#a855f7"];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {total <= 0 ? (
        <p className="mt-8 text-center text-sm text-slate-500">No inventory assigned yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {slices.map((slice, index) => {
            const pct = Math.round((slice.value / total) * 100);
            return (
              <li key={slice.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-600">{slice.label}</span>
                  <span className="font-semibold text-slate-800">
                    {formatValue(slice.value)} · {pct}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
