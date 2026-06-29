-- Allow accessory images from file picks (base64 data URLs)

ALTER TABLE "ProductAccessory" ALTER COLUMN "imageUrl" SET DATA TYPE TEXT;
