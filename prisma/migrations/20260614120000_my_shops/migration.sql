-- CreateEnum
CREATE TYPE "BranchActivityAction" AS ENUM ('PRODUCT_ASSIGNED', 'PRODUCT_SOLD', 'STOCK_ADJUSTED', 'STAFF_ASSIGNED', 'STAFF_REMOVED', 'SHOP_UPDATED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "branchId" TEXT;

-- CreateTable
CREATE TABLE "BranchInventory" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "quantitySold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchActivityLog" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "action" "BranchActivityAction" NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "userEmail" VARCHAR(255),
    "userName" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_branchId_idx" ON "Order"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchInventory_branchId_productId_key" ON "BranchInventory"("branchId", "productId");

-- CreateIndex
CREATE INDEX "BranchInventory_branchId_idx" ON "BranchInventory"("branchId");

-- CreateIndex
CREATE INDEX "BranchInventory_productId_idx" ON "BranchInventory"("productId");

-- CreateIndex
CREATE INDEX "BranchActivityLog_branchId_createdAt_idx" ON "BranchActivityLog"("branchId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "BranchActivityLog_createdAt_idx" ON "BranchActivityLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchInventory" ADD CONSTRAINT "BranchInventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchInventory" ADD CONSTRAINT "BranchInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchActivityLog" ADD CONSTRAINT "BranchActivityLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill branch inventory from historical transfer movements
INSERT INTO "BranchInventory" ("id", "branchId", "productId", "quantity", "quantitySold", "createdAt", "updatedAt")
SELECT
  md5(sm."destinationBranchId" || ':' || sm."productId"),
  sm."destinationBranchId",
  sm."productId",
  SUM(ABS(sm."delta"))::int,
  0,
  MIN(sm."createdAt"),
  MAX(sm."createdAt")
FROM "StockMovement" sm
WHERE sm."reason" = 'TRANSFER'
  AND sm."destinationBranchId" IS NOT NULL
  AND sm."delta" < 0
GROUP BY sm."destinationBranchId", sm."productId"
ON CONFLICT ("branchId", "productId") DO NOTHING;
