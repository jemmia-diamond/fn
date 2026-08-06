
-- CreateTable
CREATE TABLE "erpnext"."lead_products" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "product_type" VARCHAR(255),
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_products_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_products_name_key" ON "erpnext"."lead_products"("name");

-- CreateIndex
CREATE INDEX "lead_products_name_idx" ON "erpnext"."lead_products"("name");

