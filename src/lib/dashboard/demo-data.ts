/**
 * Demo fixtures for dashboard UX parity with Pod Café (orders, visits, charts).
 * Replace with API / Prisma when backends exist.
 */

export type DemoOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "FULFILLED"
  | "CANCELLED";

export type DemoOrder = {
  id: string;
  customer: string;
  channel: string;
  lineSummary: string;
  totalCents: number;
  currency: string;
  status: DemoOrderStatus;
  placedAt: string;
};

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: "RL-20481",
    customer: "Kigali Electrical Ltd",
    channel: "B2B quote",
    lineSummary: "River 20 W LED × 24 · Batten fittings × 12",
    totalCents: 18400000,
    currency: "RWF",
    status: "PROCESSING",
    placedAt: "2026-05-09T09:12:00.000Z",
  },
  {
    id: "RL-20480",
    customer: "Marie Uwimana",
    channel: "Store pickup",
    lineSummary: "Warm white GU10 pack × 6",
    totalCents: 4200000,
    currency: "RWF",
    status: "PENDING",
    placedAt: "2026-05-09T08:40:00.000Z",
  },
  {
    id: "RL-20479",
    customer: "Bright Homes Rwanda",
    channel: "Delivery",
    lineSummary: "Outdoor flood LED × 4 · Cable reels × 2",
    totalCents: 9560000,
    currency: "RWF",
    status: "FULFILLED",
    placedAt: "2026-05-08T16:22:00.000Z",
  },
  {
    id: "RL-20478",
    customer: "Jean Bosco",
    channel: "Walk-in",
    lineSummary: "Desk lamp · Extension cord",
    totalCents: 1780000,
    currency: "RWF",
    status: "FULFILLED",
    placedAt: "2026-05-08T14:05:00.000Z",
  },
  {
    id: "RL-20477",
    customer: "Nyamirambo Workshop",
    channel: "B2B quote",
    lineSummary: "Tubes T8 LED × 40",
    totalCents: 22300000,
    currency: "RWF",
    status: "PROCESSING",
    placedAt: "2026-05-08T11:30:00.000Z",
  },
  {
    id: "RL-20476",
    customer: "Alice Mukamana",
    channel: "Phone order",
    lineSummary: "Ceiling panel 600×600 × 2",
    totalCents: 6100000,
    currency: "RWF",
    status: "CANCELLED",
    placedAt: "2026-05-07T10:18:00.000Z",
  },
  {
    id: "RL-20475",
    customer: "Rwandex Offices",
    channel: "Installation job",
    lineSummary: "Retrofit bundle · Dimmers × 8",
    totalCents: 31250000,
    currency: "RWF",
    status: "PENDING",
    placedAt: "2026-05-07T09:00:00.000Z",
  },
  {
    id: "RL-20474",
    customer: "Eric Habimana",
    channel: "Store pickup",
    lineSummary: "Smart bulb starter kit",
    totalCents: 2950000,
    currency: "RWF",
    status: "FULFILLED",
    placedAt: "2026-05-06T13:45:00.000Z",
  },
  {
    id: "RL-20473",
    customer: "Muhima Clinic",
    channel: "Delivery",
    lineSummary: "Emergency fixture kit · Batteries",
    totalCents: 5400000,
    currency: "RWF",
    status: "PROCESSING",
    placedAt: "2026-05-06T08:20:00.000Z",
  },
  {
    id: "RL-20472",
    customer: "Sophie N.",
    channel: "Online",
    lineSummary: "Garden spike lights × 8",
    totalCents: 4680000,
    currency: "RWF",
    status: "PENDING",
    placedAt: "2026-05-05T15:50:00.000Z",
  },
];

export type DemoScheduledVisit = {
  id: string;
  dayParts: string;
  headline: string;
  detail: string;
};

/** Analogue to Pod Café “Next bookings” — showroom / site visits for lighting jobs */
export const DEMO_SCHEDULED_VISITS: DemoScheduledVisit[] = [
  {
    id: "v1",
    dayParts: "MAY 12",
    headline: "Site survey · Nyarugenge warehouse",
    detail: "Eric Habimana · retrofit audit · 10:00",
  },
  {
    id: "v2",
    dayParts: "MAY 12",
    headline: "Showroom consult · bulk GU10 swap",
    detail: "Bright Homes Rwanda · 14:30",
  },
  {
    id: "v3",
    dayParts: "MAY 13",
    headline: "Installation kickoff · Muhima Clinic",
    detail: "Lead technician · corridor fixtures · 09:00",
  },
];

export type DemoDailyPoint = { label: string; revenueRwf: number };

/** Demo series for reports — swap with aggregated sales API later */
export const DEMO_DAILY_REVENUE: DemoDailyPoint[] = [
  { label: "Mon", revenueRwf: 4200000 },
  { label: "Tue", revenueRwf: 5100000 },
  { label: "Wed", revenueRwf: 3800000 },
  { label: "Thu", revenueRwf: 6200000 },
  { label: "Fri", revenueRwf: 7400000 },
  { label: "Sat", revenueRwf: 8900000 },
  { label: "Sun", revenueRwf: 6100000 },
];

export type DemoSkuRank = { rank: number; name: string; qty: number; revenueRwf: number };

/** Demo in/out quantities per period — mirrors Pod Café overview “stock flow” chart. */
export type DemoStockFlowRow = { label: string; in: number; out: number };

export const STOCK_FLOW_BY_PERIOD: Record<
  "daily" | "weekly" | "monthly" | "yearly",
  DemoStockFlowRow[]
> = {
  daily: [
    { label: "Day −6", in: 42, out: 28 },
    { label: "Day −5", in: 55, out: 41 },
    { label: "Day −4", in: 38, out: 52 },
    { label: "Day −3", in: 71, out: 33 },
    { label: "Day −2", in: 49, out: 47 },
    { label: "Day −1", in: 63, out: 39 },
    { label: "Today", in: 58, out: 44 },
  ],
  weekly: [
    { label: "Wk 1", in: 420, out: 310 },
    { label: "Wk 2", in: 510, out: 402 },
    { label: "Wk 3", in: 388, out: 455 },
    { label: "Wk 4", in: 620, out: 398 },
    { label: "Wk 5", in: 540, out: 521 },
    { label: "Wk 6", in: 712, out: 489 },
    { label: "Wk 7", in: 605, out: 533 },
  ],
  monthly: [
    { label: "Jan", in: 1820, out: 1540 },
    { label: "Feb", in: 1650, out: 1720 },
    { label: "Mar", in: 2040, out: 1610 },
    { label: "Apr", in: 2230, out: 1890 },
    { label: "May", in: 1980, out: 2050 },
    { label: "Jun", in: 2410, out: 1920 },
  ],
  yearly: [
    { label: "2021", in: 14200, out: 13800 },
    { label: "2022", in: 16800, out: 15900 },
    { label: "2023", in: 18500, out: 17200 },
    { label: "2024", in: 21200, out: 19800 },
    { label: "2025", in: 22800, out: 21500 },
    { label: "2026", in: 9600, out: 8900 },
  ],
};

export const DEMO_TOP_SKUS: DemoSkuRank[] = [
  { rank: 1, name: "River 20 W LED (warm)", qty: 142, revenueRwf: 18400000 },
  { rank: 2, name: "GU10 triple pack", qty: 96, revenueRwf: 9200000 },
  { rank: 3, name: "T8 LED tube 120cm", qty: 78, revenueRwf: 15600000 },
  { rank: 4, name: "Outdoor flood 50 W", qty: 44, revenueRwf: 13200000 },
  { rank: 5, name: "Ceiling panel 600×600", qty: 31, revenueRwf: 18600000 },
];
