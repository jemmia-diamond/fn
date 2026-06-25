
-- CreateTable
CREATE TABLE "misa"."inventory_detail_log" (
    "id" SERIAL NOT NULL,
    "stock_id" UUID NOT NULL,
    "stock_code" VARCHAR(100),
    "inventory_item_id" UUID NOT NULL,
    "inventory_item_code" VARCHAR(100),
    "inventory_item_name" TEXT,
    "history_details" JSONB NOT NULL,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_detail_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_inv_log_item" ON "misa"."inventory_detail_log"("inventory_item_code");

-- CreateIndex
CREATE INDEX "idx_inv_log_stock" ON "misa"."inventory_detail_log"("stock_code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_stock_item_log" ON "misa"."inventory_detail_log"("stock_id", "inventory_item_id");
