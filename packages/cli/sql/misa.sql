/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : misa

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:20
*/

CREATE SCHEMA IF NOT EXISTS "misa";

-- ----------------------------
-- Table structure for inventory_items
-- ----------------------------
DROP TABLE IF EXISTS "misa"."inventory_items";
CREATE TABLE "misa"."inventory_items" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "sku" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."inventory_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for items
-- ----------------------------
DROP TABLE IF EXISTS "misa"."items";
CREATE TABLE "misa"."items" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "dictionary_type" int4,
  "inventory_item_name" varchar COLLATE "pg_catalog"."default",
  "inventory_item_code" varchar COLLATE "pg_catalog"."default",
  "inventory_item_type" int4,
  "minimum_stock" float8,
  "inventory_item_category_code_list" varchar COLLATE "pg_catalog"."default",
  "inventory_item_category_name_list" varchar COLLATE "pg_catalog"."default",
  "inventory_item_category_id_list" varchar COLLATE "pg_catalog"."default",
  "inventory_item_category_misa_code_list" varchar COLLATE "pg_catalog"."default",
  "branch_id" varchar COLLATE "pg_catalog"."default",
  "discount_type" int4,
  "inventory_item_cost_method" int4,
  "unit_id" varchar COLLATE "pg_catalog"."default",
  "is_unit_price_after_tax" bool,
  "is_system" bool,
  "inactive" bool,
  "is_follow_serial_number" bool,
  "is_allow_duplicate_serial_number" bool,
  "purchase_discount_rate" float8,
  "unit_price" numeric(36,8),
  "sale_price1" numeric(36,8),
  "sale_price2" numeric(36,8),
  "sale_price3" numeric(36,8),
  "fixed_sale_price" numeric(36,8),
  "import_tax_rate" float8,
  "export_tax_rate" float8,
  "fixed_unit_price" numeric(36,8),
  "description" text COLLATE "pg_catalog"."default",
  "inventory_account" varchar COLLATE "pg_catalog"."default",
  "cogs_account" varchar COLLATE "pg_catalog"."default",
  "sale_account" varchar COLLATE "pg_catalog"."default",
  "unit_list" jsonb,
  "unit_name" varchar COLLATE "pg_catalog"."default",
  "reftype" int4,
  "reftype_category" int4,
  "quantityBarCode" int4,
  "allocation_type" int4,
  "allocation_time" int4,
  "tax_reduction_type" int4,
  "purchase_last_unit_price" numeric(36,8),
  "is_specific_inventory_item" bool,
  "has_delete_fixed_unit_price" bool,
  "has_delete_unit_price" bool,
  "has_delete_discount" bool,
  "has_delete_unit_convert" bool,
  "has_delete_norm" bool,
  "has_delete_serial_type" bool,
  "is_edit_multiple" bool,
  "is_not_sync_crm" bool,
  "isUpdateRebundant" bool,
  "is_special_inv" bool,
  "isCustomPrimaryKey" bool,
  "isFromProcessBalance" bool,
  "is_drug" bool,
  "status_sync_medicine_national" int4,
  "is_sync_corp" bool,
  "convert_rate" float8,
  "is_update_main_unit" bool,
  "is_image_duplicate" bool,
  "is_group" bool,
  "discount_value" numeric(36,8),
  "is_set_discount" bool,
  "index_unit_convert" int4,
  "excel_row_index" int4,
  "is_valid" bool,
  "created_date" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "modified_date" timestamp(6),
  "modified_by" varchar COLLATE "pg_catalog"."default",
  "auto_refno" bool,
  "force_update" bool,
  "state" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_voucher_details
-- ----------------------------
DROP TABLE IF EXISTS "misa"."purchase_voucher_details";
CREATE TABLE "misa"."purchase_voucher_details" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "ref_detail_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "refid" varchar(36) COLLATE "pg_catalog"."default",
  "inventory_item_id" varchar(36) COLLATE "pg_catalog"."default",
  "inventory_item_name" varchar COLLATE "pg_catalog"."default",
  "stock_id" varchar(36) COLLATE "pg_catalog"."default",
  "unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "pu_invoice_refid" varchar(36) COLLATE "pg_catalog"."default",
  "main_unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "purchase_purpose_id" varchar(36) COLLATE "pg_catalog"."default",
  "organization_unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "sort_order" int4,
  "inventory_resale_type_id" int4,
  "inv_date" timestamp(6),
  "date_enough_tax_payment" timestamp(6),
  "un_resonable_cost" bool,
  "quantity" float8,
  "unit_price" numeric(36,8),
  "amount_oc" numeric(36,8),
  "amount" numeric(36,8),
  "discount_rate" float8,
  "discount_amount_oc" numeric(36,8),
  "import_charge_before_custom_amount_oc" numeric(36,8),
  "import_charge_before_custom_amount" numeric(36,8),
  "import_charge_before_custom_amount_main_currency" numeric(36,8),
  "allocation_rate_import_origin_currency" float8,
  "import_charge_before_custom_amount_allocated" numeric(36,8),
  "cash_out_exchange_rate_management" float8,
  "allocation_rate" float8,
  "allocation_rate_import" float8,
  "unit_price_after_tax" numeric(36,8),
  "import_charge_exchange_rate" numeric(36,8),
  "cash_out_diff_vat_amount_finance" numeric(36,8),
  "cash_out_amount_management" numeric(36,8),
  "cash_out_diff_amount_management" numeric(36,8),
  "cash_out_vat_amount_management" numeric(36,8),
  "cash_out_diff_vat_amount_management" numeric(36,8),
  "cash_out_exchange_rate_finance" float8,
  "special_consume_tax_amount" numeric(36,8),
  "environmental_tax_amount" numeric(36,8),
  "environmental_tax_amount_oc" numeric(36,8),
  "cash_out_amount_finance" numeric(36,8),
  "cash_out_diff_amount_finance" numeric(36,8),
  "cash_out_vat_amount_finance" numeric(36,8),
  "import_tax_rate_price" numeric(36,8),
  "import_tax_rate" float8,
  "import_tax_amount_oc" numeric(36,8),
  "import_tax_amount" numeric(36,8),
  "anti_dumping_tax_rate" float8,
  "anti_dumping_tax_amount" numeric(36,8),
  "anti_dumping_tax_amount_oc" numeric(36,8),
  "anti_dumping_tax_account" varchar COLLATE "pg_catalog"."default",
  "special_consume_tax_rate" float8,
  "special_consume_tax_amount_oc" numeric(36,8),
  "vat_rate" float8,
  "vat_amount_oc" numeric(36,8),
  "vat_amount" numeric(36,8),
  "fob_amount_oc" numeric(36,8),
  "fob_amount" numeric(36,8),
  "import_charge_amount" numeric(36,8),
  "discount_amount" numeric(36,8),
  "freight_amount" numeric(36,8),
  "inward_amount" numeric(36,8),
  "main_convert_rate" float8,
  "main_quantity" float8,
  "main_unit_price" numeric(36,8),
  "description" text COLLATE "pg_catalog"."default",
  "debit_account" varchar COLLATE "pg_catalog"."default",
  "credit_account" varchar COLLATE "pg_catalog"."default",
  "exchange_rate_operator" varchar COLLATE "pg_catalog"."default",
  "vat_account" varchar COLLATE "pg_catalog"."default",
  "inv_no" varchar COLLATE "pg_catalog"."default",
  "import_tax_account" varchar COLLATE "pg_catalog"."default",
  "special_consume_tax_account" varchar COLLATE "pg_catalog"."default",
  "environmental_tax_account" varchar COLLATE "pg_catalog"."default",
  "vat_description" text COLLATE "pg_catalog"."default",
  "stock_code" varchar COLLATE "pg_catalog"."default",
  "inventory_item_code" varchar COLLATE "pg_catalog"."default",
  "main_unit_name" varchar COLLATE "pg_catalog"."default",
  "organization_unit_code" varchar COLLATE "pg_catalog"."default",
  "organization_unit_name" varchar COLLATE "pg_catalog"."default",
  "unit_name" varchar COLLATE "pg_catalog"."default",
  "edit_version" int8,
  "purchase_purpose_code" varchar COLLATE "pg_catalog"."default",
  "inventory_item_type" int4,
  "purchase_purpose_name" text COLLATE "pg_catalog"."default",
  "pu_order_refno" varchar COLLATE "pg_catalog"."default",
  "pu_order_code" varchar COLLATE "pg_catalog"."default",
  "is_follow_serial_number" bool,
  "is_allow_duplicate_serial_number" bool,
  "is_description" bool,
  "panel_height_quantity" float8,
  "panel_length_quantity" float8,
  "panel_quantity" float8,
  "panel_radius_quantity" float8,
  "panel_width_quantity" float8,
  "inventory_item_cogs_account" varchar COLLATE "pg_catalog"."default",
  "inventory_account" varchar COLLATE "pg_catalog"."default",
  "unit_list" text COLLATE "pg_catalog"."default",
  "import_tax_rate_price_origin" numeric(36,8),
  "quantity_product_produce" float8,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."purchase_voucher_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_vouchers
-- ----------------------------
DROP TABLE IF EXISTS "misa"."purchase_vouchers";
CREATE TABLE "misa"."purchase_vouchers" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "refid" varchar(50) COLLATE "pg_catalog"."default",
  "branch_id" varchar(36) COLLATE "pg_catalog"."default",
  "account_object_id" varchar(36) COLLATE "pg_catalog"."default",
  "reftype" int4,
  "display_on_book" int4,
  "refdate" timestamp(6),
  "posted_date" timestamp(6),
  "caba_refdate" timestamp(6),
  "caba_posted_date" timestamp(6),
  "created_date" timestamp(6),
  "modified_date" timestamp(6),
  "is_posted_finance" bool,
  "is_posted_management" bool,
  "is_posted_cash_book_finance" bool,
  "is_posted_cash_book_management" bool,
  "is_posted_inventory_book_finance" bool,
  "is_posted_inventory_book_management" bool,
  "total_amount_oc" numeric(36,8),
  "total_amount" numeric(36,8),
  "total_import_tax_amount_oc" numeric(36,8),
  "total_import_tax_amount" numeric(36,8),
  "total_vat_amount_oc" numeric(36,8),
  "total_special_consume_tax_amount" numeric(36,8),
  "total_custom_before_amount" numeric(36,8),
  "caba_amount_oc" numeric(36,8),
  "caba_amount" numeric(36,8),
  "total_vat_amount" numeric(36,8),
  "total_discount_amount_oc" numeric(36,8),
  "total_discount_amount" numeric(36,8),
  "total_freight_amount" numeric(36,8),
  "total_inward_amount" numeric(36,8),
  "total_special_consume_tax_amount_oc" numeric(36,8),
  "total_payment_amount" numeric(36,8),
  "total_payment_amount_oc" numeric(36,8),
  "total_environmental_tax_amount" numeric(36,8),
  "refno_finance" varchar COLLATE "pg_catalog"."default",
  "account_object_name" varchar COLLATE "pg_catalog"."default",
  "account_object_address" varchar COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "modified_by" varchar COLLATE "pg_catalog"."default",
  "journal_memo" text COLLATE "pg_catalog"."default",
  "account_object_code" varchar COLLATE "pg_catalog"."default",
  "paid_status" int4,
  "include_invoice" int4,
  "branch_name" varchar COLLATE "pg_catalog"."default",
  "edit_version" int8,
  "currency_id" varchar COLLATE "pg_catalog"."default",
  "exchange_rate" float8,
  "account_object_tax_code" varchar COLLATE "pg_catalog"."default",
  "is_freight_service" bool,
  "employee_id" varchar(36) COLLATE "pg_catalog"."default",
  "in_outward_refno" varchar COLLATE "pg_catalog"."default",
  "status_sync_medicine_national" int4,
  "discount_type" int4,
  "employee_name" varchar COLLATE "pg_catalog"."default",
  "employee_code" varchar COLLATE "pg_catalog"."default",
  "total_anti_dumping_tax_amount" numeric(36,8),
  "total_anti_dumping_tax_amount_oc" numeric(36,8),
  "wesign_document_text" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."purchase_vouchers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "misa"."users";
CREATE TABLE "misa"."users" (
  "uuid" uuid NOT NULL,
  "employee_code" varchar(255) COLLATE "pg_catalog"."default",
  "haravan_id" int8 NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(3)
)
;
ALTER TABLE "misa"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for warehouse_inventories
-- ----------------------------
DROP TABLE IF EXISTS "misa"."warehouse_inventories";
CREATE TABLE "misa"."warehouse_inventories" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "inventory_item_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "inventory_item_code" varchar(50) COLLATE "pg_catalog"."default",
  "inventory_item_name" varchar(255) COLLATE "pg_catalog"."default",
  "stock_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "stock_code" varchar(50) COLLATE "pg_catalog"."default",
  "stock_name" varchar(255) COLLATE "pg_catalog"."default",
  "organization_unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "organization_unit_code" varchar(50) COLLATE "pg_catalog"."default",
  "organization_unit_name" varchar(255) COLLATE "pg_catalog"."default",
  "quantity_balance" float8,
  "amount_balance" numeric(36,2),
  "unit_price" numeric(36,2),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."warehouse_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table inventory_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_misa_inventory_items_sku" ON "misa"."inventory_items" USING btree (
  "sku" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_misa_inventory_items_uuid" ON "misa"."inventory_items" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table inventory_items
-- ----------------------------
ALTER TABLE "misa"."inventory_items" ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table items
-- ----------------------------
CREATE UNIQUE INDEX "ix_misa_items_id" ON "misa"."items" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table items
-- ----------------------------
ALTER TABLE "misa"."items" ADD CONSTRAINT "items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_voucher_details
-- ----------------------------
CREATE INDEX "ix_misa_purchase_voucher_details_refid" ON "misa"."purchase_voucher_details" USING btree (
  "refid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table purchase_voucher_details
-- ----------------------------
ALTER TABLE "misa"."purchase_voucher_details" ADD CONSTRAINT "purchase_voucher_details_ref_detail_id_key" UNIQUE ("ref_detail_id");

-- ----------------------------
-- Primary Key structure for table purchase_voucher_details
-- ----------------------------
ALTER TABLE "misa"."purchase_voucher_details" ADD CONSTRAINT "purchase_voucher_details_pkey" PRIMARY KEY ("uuid", "ref_detail_id");

-- ----------------------------
-- Indexes structure for table purchase_vouchers
-- ----------------------------
CREATE UNIQUE INDEX "ix_misa_purchase_vouchers_refid" ON "misa"."purchase_vouchers" USING btree (
  "refid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_vouchers
-- ----------------------------
ALTER TABLE "misa"."purchase_vouchers" ADD CONSTRAINT "purchase_vouchers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "users_employee_code_key" ON "misa"."users" USING btree (
  "employee_code" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "users_haravan_id_key" ON "misa"."users" USING btree (
  "haravan_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "misa"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table warehouse_inventories
-- ----------------------------
ALTER TABLE "misa"."warehouse_inventories" ADD CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("inventory_item_id", "stock_id");
