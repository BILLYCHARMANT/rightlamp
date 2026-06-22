import { DEFAULT_CURRENCY, normalizeCurrency } from "@/lib/dashboard/constants";

export function formatRetailPrice(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
): string {
  const code = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${code}`;
  }
}
