-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(32),
    "location" VARCHAR(500),
    "phone" VARCHAR(64),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE INDEX "Branch_active_idx" ON "Branch"("active");

-- CreateIndex
CREATE INDEX "Branch_name_idx" ON "Branch"("name");

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN "destinationBranchId" TEXT;

-- CreateIndex
CREATE INDEX "StockMovement_destinationBranchId_idx" ON "StockMovement"("destinationBranchId");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_destinationBranchId_fkey" FOREIGN KEY ("destinationBranchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
