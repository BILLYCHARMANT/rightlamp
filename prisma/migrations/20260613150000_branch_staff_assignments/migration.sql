-- CreateTable
CREATE TABLE "BranchStaffAssignment" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchStaffAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BranchStaffAssignment_branchId_idx" ON "BranchStaffAssignment"("branchId");

-- CreateIndex
CREATE INDEX "BranchStaffAssignment_userId_idx" ON "BranchStaffAssignment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BranchStaffAssignment_branchId_userId_key" ON "BranchStaffAssignment"("branchId", "userId");

-- AddForeignKey
ALTER TABLE "BranchStaffAssignment" ADD CONSTRAINT "BranchStaffAssignment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchStaffAssignment" ADD CONSTRAINT "BranchStaffAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
