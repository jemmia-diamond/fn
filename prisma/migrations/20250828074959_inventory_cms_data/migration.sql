-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory_cms";

-- CreateTable
CREATE TABLE "inventory_cms"."inventory_check_sheets" (
    "uuid" UUID NOT NULL,
    "id" INTEGER NOT NULL,
    "status" TEXT,
    "sort" TEXT,
    "user_created" TEXT,
    "date_created" TIMESTAMP(3),
    "user_updated" TEXT,
    "date_updated" TIMESTAMP(3),
    "warehouse" TEXT,
    "staff" INTEGER,
    "result" TEXT,
    "code" TEXT,
    "warehouse_id" TEXT,
    "count_in_book" INTEGER,
    "count_for_real" INTEGER,
    "extra" INTEGER,
    "lines" JSONB,

    CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "inventory_cms"."inventory_check_lines" (
    "uuid" UUID NOT NULL,
    "id" INTEGER NOT NULL,
    "status" TEXT,
    "sort" TEXT,
    "user_created" TEXT,
    "date_created" TIMESTAMP(3),
    "user_updated" TEXT,
    "date_updated" TIMESTAMP(3),
    "product_name" TEXT,
    "product_id" TEXT,
    "variant_id" INTEGER,
    "count_in_book" INTEGER,
    "count_for_real" INTEGER,
    "checked_status" TEXT,
    "sheet_id" INTEGER,
    "variant_name" TEXT,
    "product_image" TEXT,
    "sku" TEXT,
    "count_extra_for_real" INTEGER,
    "barcode" TEXT,
    "category" TEXT,
    "count_in_ordered" TEXT,
    "rfid_tags" JSONB,

    CONSTRAINT "inventory_check_lines_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_check_sheets_id_key" ON "inventory_cms"."inventory_check_sheets"("id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_check_lines_id_key" ON "inventory_cms"."inventory_check_lines"("id");
