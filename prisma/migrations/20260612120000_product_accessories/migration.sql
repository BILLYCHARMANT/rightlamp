-- CreateTable
CREATE TABLE "ProductAccessory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAccessory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemAccessory" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "accessoryId" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" VARCHAR(500),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPriceCents" INTEGER NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'RWF',

    CONSTRAINT "OrderItemAccessory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductAccessory_productId_sortOrder_idx" ON "ProductAccessory"("productId", "sortOrder");

-- CreateIndex
CREATE INDEX "OrderItemAccessory_orderItemId_idx" ON "OrderItemAccessory"("orderItemId");

-- AddForeignKey
ALTER TABLE "ProductAccessory" ADD CONSTRAINT "ProductAccessory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAccessory" ADD CONSTRAINT "OrderItemAccessory_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAccessory" ADD CONSTRAINT "OrderItemAccessory_accessoryId_fkey" FOREIGN KEY ("accessoryId") REFERENCES "ProductAccessory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
