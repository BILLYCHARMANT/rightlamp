-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "vendor" VARCHAR(200),
    "amountCents" INTEGER NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'TZS',
    "category" VARCHAR(120),
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "createdByEmail" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialOffer" (
    "id" TEXT NOT NULL,
    "productSlug" VARCHAR(160) NOT NULL,
    "productName" TEXT NOT NULL,
    "discountPct" INTEGER,
    "discountCents" INTEGER,
    "label" VARCHAR(200),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdByEmail" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationalReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByEmail" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OperationalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Expense_paidAt_idx" ON "Expense"("paidAt" DESC);

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "SpecialOffer_active_idx" ON "SpecialOffer"("active");

-- CreateIndex
CREATE INDEX "SpecialOffer_productSlug_idx" ON "SpecialOffer"("productSlug");

-- CreateIndex
CREATE INDEX "OperationalReport_createdAt_idx" ON "OperationalReport"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "OperationalReport_status_idx" ON "OperationalReport"("status");
