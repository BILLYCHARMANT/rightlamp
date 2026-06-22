import type { MovementFlowPoint } from "@/lib/dashboard/stock-shared-types";

export type FlowPeriod = "daily" | "weekly" | "monthly" | "yearly";

type MovementRow = { createdAt: Date; delta: number };

const DAY_MS = 86400000;

function slidingWindowFlow(
  rows: MovementRow[],
  bucketCount: number,
  windowMs: number,
  labelForStart: (start: Date) => string,
): MovementFlowPoint[] {
  const now = Date.now();
  type Bucket = MovementFlowPoint & { rangeStart: number; rangeEnd: number };
  const buckets: Bucket[] = [];

  for (let i = bucketCount - 1; i >= 0; i--) {
    const rangeEnd = now - i * windowMs;
    const rangeStart = rangeEnd - windowMs;
    buckets.push({
      rangeStart,
      rangeEnd,
      label: labelForStart(new Date(rangeStart)),
      in: 0,
      out: 0,
    });
  }

  for (const r of rows) {
    const t = r.createdAt.getTime();
    for (const b of buckets) {
      if (t > b.rangeStart && t <= b.rangeEnd) {
        if (r.delta > 0) b.in += r.delta;
        else b.out += -r.delta;
        break;
      }
    }
  }

  return buckets.map(({ label, in: inbound, out: outbound }) => ({
    label,
    in: inbound,
    out: outbound,
  }));
}

export function movementsToWeeklyFlow(
  rows: MovementRow[],
  bucketCount = 8,
): MovementFlowPoint[] {
  return slidingWindowFlow(rows, bucketCount, 7 * DAY_MS, (d) => {
    const m = d.getMonth() + 1;
    return `${m}/${d.getDate()}`;
  });
}

export function movementsToPeriodFlow(
  rows: MovementRow[],
  period: FlowPeriod,
): MovementFlowPoint[] {
  switch (period) {
    case "daily":
      return slidingWindowFlow(rows, 14, DAY_MS, (d) =>
        new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric" }).format(d),
      );
    case "weekly":
      return movementsToWeeklyFlow(rows, 8);
    case "monthly":
      return slidingWindowFlow(rows, 6, 30 * DAY_MS, (d) =>
        new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d),
      );
    case "yearly":
      return slidingWindowFlow(rows, 5, 365 * DAY_MS, (d) =>
        String(d.getFullYear()),
      );
  }
}

export function buildAllPeriodFlows(
  rows: MovementRow[],
): Record<FlowPeriod, MovementFlowPoint[]> {
  return {
    daily: movementsToPeriodFlow(rows, "daily"),
    weekly: movementsToPeriodFlow(rows, "weekly"),
    monthly: movementsToPeriodFlow(rows, "monthly"),
    yearly: movementsToPeriodFlow(rows, "yearly"),
  };
}

export function flowHasSignal(points: MovementFlowPoint[]): boolean {
  return points.some((p) => p.in > 0 || p.out > 0);
}
