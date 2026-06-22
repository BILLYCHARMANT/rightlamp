import { normalizeCurrency } from "@/lib/dashboard/constants";

/** Whole currency units (e.g. production API `price` / `totalCostPrice`). */
export function formatMoneyMajor(amount: number, currency: string): string {
  const code = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${code}`;
  }
}

export function formatMoneyFromCents(cents: number, currency: string): string {
  const code = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toLocaleString()} ${code}`;
  }
}
