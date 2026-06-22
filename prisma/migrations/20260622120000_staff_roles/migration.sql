-- Expand staff roles for branch-based access control
ALTER TYPE "StaffRole" ADD VALUE IF NOT EXISTS 'MAIN_STORE_MANAGER';
ALTER TYPE "StaffRole" ADD VALUE IF NOT EXISTS 'BRANCH_MANAGER';
ALTER TYPE "StaffRole" ADD VALUE IF NOT EXISTS 'BRANCH_SELLER';
ALTER TYPE "StaffRole" ADD VALUE IF NOT EXISTS 'PARTNER_INVESTOR';

-- Migrate legacy staff accounts to branch seller
UPDATE "User" SET role = 'BRANCH_SELLER' WHERE role = 'STAFF';
