-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecom";

-- CreateTable
CREATE TABLE "ecom"."jewelry_diamond_pairs" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "haravan_product_id" INTEGER NOT NULL,
    "haravan_variant_id" INTEGER NOT NULL,
    "haravan_diamond_product_id" INTEGER NOT NULL,
    "haravan_diamond_variant_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "jewelry_diamond_pairs_id_key" ON "ecom"."jewelry_diamond_pairs"("id");

-- CreateIndex
CREATE INDEX "jewelry_diamond_pairs_id_idx" ON "ecom"."jewelry_diamond_pairs"("id");

-- CreateIndex
CREATE INDEX "jewelry_diamond_pairs_haravan_product_id_haravan_variant_id_idx" ON "ecom"."jewelry_diamond_pairs"("haravan_product_id", "haravan_variant_id", "is_active");

-- CreateIndex
CREATE INDEX "jewelry_diamond_pairs_haravan_diamond_product_id_haravan_di_idx" ON "ecom"."jewelry_diamond_pairs"("haravan_diamond_product_id", "haravan_diamond_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "jewelry_diamond_pairing_unique_pairing" ON "ecom"."jewelry_diamond_pairs"("haravan_product_id", "haravan_variant_id", "haravan_diamond_product_id", "haravan_diamond_variant_id");
