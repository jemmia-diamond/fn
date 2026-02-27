-- CreateTable
CREATE TABLE "erpnext"."buyback_exchanges" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "lark_instance_id" VARCHAR(255),
    "instance_type" VARCHAR(255),
    "status" VARCHAR(50),
    "submitted_date" TIMESTAMP(6),
    "customer_name" VARCHAR(255),
    "phone_number" VARCHAR(50),
    "national_id" VARCHAR(255),
    "order_code" VARCHAR(255),
    "new_order_code" VARCHAR(255),
    "refund_amount" DECIMAL(18,6),
    "reason" TEXT,
    "products_info" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "buyback_exchanges_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."buyback_exchange_items" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "product_name" VARCHAR(255),
    "item_code" VARCHAR(255),
    "order_code" VARCHAR(255),
    "prev_sales_order" VARCHAR(255),
    "prev_sales_order_item" VARCHAR(255),
    "current_sales_order" VARCHAR(255),
    "sale_price" DECIMAL(18,6),
    "buyback_percentage" DECIMAL(18,6),
    "calculated_buyback_price" DECIMAL(18,6),
    "buyback_price" DECIMAL(18,6),
    "parent" VARCHAR(255),
    "parentfield" VARCHAR(255),
    "parenttype" VARCHAR(255),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "buyback_exchange_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyback_exchanges_name_key" ON "erpnext"."buyback_exchanges"("name");

-- CreateIndex
CREATE INDEX "buyback_exchanges_order_code_idx" ON "erpnext"."buyback_exchanges"("order_code");

-- CreateIndex
CREATE INDEX "buyback_exchanges_new_order_code_idx" ON "erpnext"."buyback_exchanges"("new_order_code");

-- CreateIndex
CREATE UNIQUE INDEX "buyback_exchange_items_name_key" ON "erpnext"."buyback_exchange_items"("name");

-- CreateIndex
CREATE INDEX "buyback_exchange_items_parent_idx" ON "erpnext"."buyback_exchange_items"("parent");

-- CreateIndex
CREATE INDEX "buyback_exchange_items_order_code_idx" ON "erpnext"."buyback_exchange_items"("order_code");

-- CreateIndex
CREATE INDEX "buyback_exchange_items_current_sales_order_idx" ON "erpnext"."buyback_exchange_items"("current_sales_order");
