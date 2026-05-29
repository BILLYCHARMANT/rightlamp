import "server-only";

import { LOW_STOCK_THRESHOLD } from "@/lib/dashboard/constants";
import { isPrismaConnectionError } from "@/lib/dashboard/prisma-connection";
import { prisma } from "@/lib/db";

const DB_FALLBACK_WARNING =
  "Could not reach the database (check Railway is running and DATABASE_URL). Metrics below are placeholders until the connection works again.";

export type DashboardOverviewStats = {
  totalSkus: number;
  publishedSkus: number;
  draftSkus: number;
  lowStockSkus: number;
  /** Set when counts could not be loaded — UI should show a banner. */
  connectionWarning?: string;
};

const EMPTY_STATS: DashboardOverviewStats = {
  totalSkus: 0,
  publishedSkus: 0,
  draftSkus: 0,
  lowStockSkus: 0,
};

export async function getDashboardOverviewStats(): Promise<DashboardOverviewStats> {
  try {
    const [totalSkus, publishedSkus, lowStockSkus] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.product.count({
        where: {
          published: true,
          stock: { lte: LOW_STOCK_THRESHOLD, gt: 0 },
        },
      }),
    ]);

    const draftSkus = Math.max(0, totalSkus - publishedSkus);

    return { totalSkus, publishedSkus, draftSkus, lowStockSkus };
  } catch (e) {
    if (!isPrismaConnectionError(e)) throw e;
    return { ...EMPTY_STATS, connectionWarning: DB_FALLBACK_WARNING };
  }
}
