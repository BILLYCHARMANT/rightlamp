-- Switch default currency from TZS to RWF (Rwanda Franc).
ALTER TABLE "Product" ALTER COLUMN "currency" SET DEFAULT 'RWF';
ALTER TABLE "Expense" ALTER COLUMN "currency" SET DEFAULT 'RWF';

UPDATE "Product" SET "currency" = 'RWF' WHERE "currency" = 'TZS';
UPDATE "Expense" SET "currency" = 'RWF' WHERE "currency" = 'TZS';
