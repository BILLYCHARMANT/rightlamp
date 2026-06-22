-- AlterTable
ALTER TABLE "User" ADD COLUMN "imageUrl" VARCHAR(2000),
ADD COLUMN "phone" VARCHAR(64),
ADD COLUMN "jobTitle" VARCHAR(120),
ADD COLUMN "bio" TEXT,
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "User_active_idx" ON "User"("active");
