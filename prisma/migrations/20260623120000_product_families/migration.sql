-- Product families for capacity/size versions
CREATE TABLE "ProductFamily" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" VARCHAR(160),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductFamily_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductFamily_name_idx" ON "ProductFamily"("name");

ALTER TABLE "Product" ADD COLUMN "familyId" TEXT;
ALTER TABLE "Product" ADD COLUMN "variantLabel" VARCHAR(120);

CREATE INDEX "Product_familyId_idx" ON "Product"("familyId");

ALTER TABLE "Product" ADD CONSTRAINT "Product_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "ProductFamily"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One family per existing product (staff can merge by creating versions from product detail)
INSERT INTO "ProductFamily" ("id", "name", "category", "createdAt", "updatedAt")
SELECT
    'fam_' || "id",
    regexp_replace(regexp_replace("name", '\s*\([^)]*\)', '', 'g'), '\s+\d+(?:\.\d+)?\s*(?:kW|KW|W|w|V|Ah|L|litres?|quarts?|cm|mm|m|%).*$', '', 'i'),
    "category",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Product";

UPDATE "Product" p
SET
    "familyId" = 'fam_' || p."id",
    "variantLabel" = COALESCE(
        NULLIF(trim(substring(p."name" from '(\d+(?:\.\d+)?\s*(?:kW|KW|W|w|V|Ah|L|litres?|quarts?|cm|mm|m|%))')), ''),
        'Standard'
    );
