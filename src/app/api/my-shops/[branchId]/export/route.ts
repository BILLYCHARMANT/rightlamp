import { NextResponse } from "next/server";
import { canAccessDashboardPath, hasGlobalShopAccess } from "@/lib/dashboard/rbac";
import {
  canAccessOrderBranch,
  getDashboardSession,
  getOrderViewerScope,
} from "@/lib/dashboard/rbac-server";
import { formatMoneyFromCents } from "@/lib/dashboard/format-money";
import { getShopExportRows } from "@/lib/dashboard/shop-queries";

export async function GET(
  request: Request,
  context: { params: Promise<{ branchId: string }> },
) {
  const session = await getDashboardSession();
  if (!session || !canAccessDashboardPath(session.role, "/dashboard/my-shops")) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const { branchId } = await context.params;

  if (!hasGlobalShopAccess(session.role)) {
    const scope = await getOrderViewerScope();
    if (!scope || !canAccessOrderBranch(branchId, scope)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }
  }
  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "csv";
  const dateFrom = url.searchParams.get("from") ?? undefined;
  const dateTo = url.searchParams.get("to") ?? undefined;

  const payload = await getShopExportRows(branchId, dateFrom, dateTo);
  if (!payload) {
    return NextResponse.json({ error: "Shop not found." }, { status: 404 });
  }

  const { detail, activity } = payload;
  const currency = detail.currency;

  if (format === "pdf") {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${detail.name} — Shop Report</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; padding: 32px; }
    h1 { margin: 0 0 8px; }
    .muted { color: #666; font-size: 14px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>${detail.name}</h1>
  <p class="muted">${detail.location ?? "No location"} · Generated ${new Date().toLocaleString()}</p>
  <div class="grid">
    <div class="card"><strong>Inventory cost</strong><br />${formatMoneyFromCents(detail.assignedInventoryCostCents, currency)}</div>
    <div class="card"><strong>Total sales</strong><br />${formatMoneyFromCents(detail.totalSalesCents, currency)}</div>
    <div class="card"><strong>Total profit</strong><br />${formatMoneyFromCents(detail.totalProfitCents, currency)}</div>
    <div class="card"><strong>Assigned</strong><br />${detail.productsAssigned}</div>
    <div class="card"><strong>Sold</strong><br />${detail.productsSold}</div>
    <div class="card"><strong>Remaining</strong><br />${detail.remainingStock}</div>
  </div>
  <h2>Inventory</h2>
  <table>
    <thead><tr><th>Product</th><th>Assigned</th><th>Sold</th><th>Remaining</th><th>Value</th></tr></thead>
    <tbody>
      ${detail.inventory
        .map(
          (row) =>
            `<tr><td>${row.productName}</td><td>${row.quantity}</td><td>${row.quantitySold}</td><td>${row.remaining}</td><td>${formatMoneyFromCents(row.inventoryCostCents, row.currency)}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <h2>Activity log</h2>
  <table>
    <thead><tr><th>When</th><th>User</th><th>Action</th><th>Description</th></tr></thead>
    <tbody>
      ${activity
        .map(
          (row) =>
            `<tr><td>${new Date(row.createdAt).toLocaleString()}</td><td>${row.userName ?? row.userEmail ?? "System"}</td><td>${row.actionLabel}</td><td>${row.description}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  const lines = [
    "Shop Report",
    `Name,${detail.name}`,
    `Location,${detail.location ?? ""}`,
    `Inventory Cost,${(detail.assignedInventoryCostCents / 100).toFixed(2)}`,
    `Total Sales,${(detail.totalSalesCents / 100).toFixed(2)}`,
    `Total Profit,${(detail.totalProfitCents / 100).toFixed(2)}`,
    `Products Assigned,${detail.productsAssigned}`,
    `Products Sold,${detail.productsSold}`,
    `Remaining Stock,${detail.remainingStock}`,
    "",
    "Inventory",
    "Product,SKU,Assigned,Sold,Remaining,Unit Cost,Inventory Value",
    ...detail.inventory.map(
      (row) =>
        `"${row.productName}","${row.sku}",${row.quantity},${row.quantitySold},${row.remaining},${(row.unitCostCents / 100).toFixed(2)},${(row.inventoryCostCents / 100).toFixed(2)}`,
    ),
    "",
    "Activity Log",
    "Date,User,Action,Description",
    ...activity.map(
      (row) =>
        `"${new Date(row.createdAt).toISOString()}","${row.userName ?? row.userEmail ?? "System"}","${row.actionLabel}","${row.description.replace(/"/g, '""')}"`,
    ),
  ];

  const csv = lines.join("\n");
  const filename = `${detail.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-shop-report.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
