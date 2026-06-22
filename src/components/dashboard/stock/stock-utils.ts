import type {
  StockMovementReasonCode,
  StockMovementRow,
  StockProductDetail,
  SupplierRow,
} from "@/lib/dashboard/stock-shared-types";
import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";

export function unitCostCents(p: StockProductDetail): number {
  return p.costPriceCents ?? p.priceCents;
}

export function stockLineValue(p: StockProductDetail): string {
  return formatMoneyFromCents(unitCostCents(p) * p.stock, p.currency);
}

export function stockRetailValue(p: StockProductDetail): string {
  return formatMoneyFromCents(p.priceCents * p.stock, p.currency);
}

export type StockShelfStatus = "out" | "low" | "ok" | "draft";

export function stockStatusRow(p: StockProductDetail): StockShelfStatus {
  if (!p.published) return "draft";
  if (p.stock <= 0) return "out";
  if (p.stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

export function formatStockMovementReason(reason: StockMovementReasonCode): string {
  switch (reason) {
    case "RECEIPT":
      return "Receipt";
    case "WASTE":
      return "Waste / damage";
    case "TRANSFER":
      return "Stock out";
    case "ADJUSTMENT":
      return "Adjustment";
    case "OTHER":
      return "Other";
    default:
      return reason;
  }
}

/** Fixed locale so SSR and browser render the same timestamp text. */
export function formatStockMovementWhen(iso: string | Date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return String(iso);
  }
}

/** Product IDs that have at least one confirmed stock-in receipt. */
export function receivedProductIds(movements: StockMovementRow[]): Set<string> {
  const ids = new Set<string>();
  for (const m of movements) {
    if (m.reason === "RECEIPT" && m.delta > 0) {
      ids.add(m.productId);
    }
  }
  return ids;
}

/** Items eligible for stock-out: received via stock-in and still on hand. */
export function stockOutEligibleProducts(
  products: StockProductDetail[],
  movements: StockMovementRow[],
  options?: { includeProductId?: string },
): StockProductDetail[] {
  const receivedIds = receivedProductIds(movements);
  const eligible = products.filter(
    (p) => receivedIds.has(p.id) && p.stock > 0,
  );
  if (options?.includeProductId) {
    const extra = products.find((p) => p.id === options.includeProductId);
    if (extra && !eligible.some((p) => p.id === extra.id)) {
      return [...eligible, extra];
    }
  }
  return eligible;
}

export function paginate<T>(rows: T[], page: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  return {
    pages,
    safePage,
    slice: rows.slice(safePage * pageSize, safePage * pageSize + pageSize),
  };
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function currentStockToCsv(products: StockProductDetail[]): string {
  const header = ["name", "slug", "category", "qty", "status", "cost_value", "currency"];
  const lines = products.map((p) =>
    [
      `"${p.name.replace(/"/g, '""')}"`,
      p.slug,
      `"${(p.category ?? "").replace(/"/g, '""')}"`,
      p.stock,
      stockStatusRow(p),
      unitCostCents(p) * p.stock,
      p.currency,
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function suppliersToCsv(rows: SupplierRow[]): string {
  const header = ["name", "contact", "phone", "email", "status", "items"];
  const lines = rows.map((s) =>
    [
      csvEscape(s.name),
      csvEscape(s.contact ?? ""),
      csvEscape(s.phone ?? ""),
      csvEscape(s.email ?? ""),
      s.active ? "active" : "inactive",
      String(s.itemCount),
    ].join(","),
  );
  return [header.join(","), ...lines].join("\r\n");
}

export function downloadExcel(filename: string, csv: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xls") ? filename : `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

export type ParsedSupplierImportRow = {
  name: string;
  contact: string | null;
  email: string | null;
  phone: string | null;
  active: boolean;
};

export function parseSuppliersCsv(text: string): ParsedSupplierImportRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const splitRow = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };

  const header = splitRow(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = header.indexOf("name");
  if (nameIdx < 0) return [];

  const contactIdx = header.indexOf("contact");
  const phoneIdx = header.indexOf("phone");
  const emailIdx = header.indexOf("email");
  const statusIdx = header.indexOf("status");

  return lines.slice(1).map((line) => {
    const cols = splitRow(line);
    const status =
      statusIdx >= 0 ? cols[statusIdx]?.toLowerCase() ?? "active" : "active";
    return {
      name: cols[nameIdx] ?? "",
      contact: contactIdx >= 0 ? cols[contactIdx] || null : null,
      phone: phoneIdx >= 0 ? cols[phoneIdx] || null : null,
      email: emailIdx >= 0 ? cols[emailIdx] || null : null,
      active: status !== "inactive" && status !== "false" && status !== "0",
    };
  });
}
