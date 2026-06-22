/** Published rows at or below this stock level surface as “low stock”. */
export const LOW_STOCK_THRESHOLD = 10;

/** Rwanda Franc — production PV-GRID currency. */
export const DEFAULT_CURRENCY = "RWF";

/** Legacy code from early dev — always treat as RWF in UI and on save. */
const LEGACY_CURRENCY = "TZS";

/** Normalize stored/API currency codes to PV-GRID standard (RWF). */
export function normalizeCurrency(code?: string | null): string {
  const normalized = (code ?? "").trim().toUpperCase().slice(0, 3);
  if (!normalized || normalized === LEGACY_CURRENCY) {
    return DEFAULT_CURRENCY;
  }
  return normalized;
}