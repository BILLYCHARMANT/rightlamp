-- Allow product gallery images from file picks (base64 data URLs)

ALTER TABLE "ProductImage" ALTER COLUMN "url" SET DATA TYPE TEXT;
