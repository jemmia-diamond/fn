/*
  Warnings:

  - A unique constraint covering the columns `[haravan_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecom";

-- AlterTable
ALTER TABLE "payment"."manual_payments" ADD COLUMN     "misa_synced_at" TIMESTAMP(6);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ecom"."leads" (
    "id" SERIAL NOT NULL,
    "raw_data" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "custom_uuid" TEXT DEFAULT (gen_random_uuid())::text,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ecom"."products" (
    "haravan_product_id" BIGINT,
    "haravan_product_type" TEXT,
    "design_id" BIGINT,
    "handle" VARCHAR,
    "workplace_id" INTEGER,
    "category" TEXT,
    "title" TEXT,
    "min_price" DECIMAL,
    "max_price" DECIMAL,
    "qty_onhand" BIGINT,
    "image_updated_at" TIMESTAMP(6),
    "wedding_ring_id" INTEGER,
    "primary_collection" TEXT,
    "primary_collection_handle" TEXT,
    "pages" TEXT,
    "max_price_18" INTEGER,
    "max_price_14" INTEGER
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ecom"."qr_generator" (
    "id" VARCHAR NOT NULL,
    "bank_code" VARCHAR,
    "bank_account_number" VARCHAR,
    "customer_name" VARCHAR,
    "customer_phone_number" VARCHAR,
    "transfer_amount" BIGINT,
    "transfer_note" VARCHAR,
    "transfer_status" VARCHAR,
    "haravan_order_number" VARCHAR,
    "haravan_order_status" VARCHAR,
    "haravan_order_id" BIGINT,
    "haravan_order_total_price" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "is_deleted" BOOLEAN,
    "qr_url" TEXT,
    "lark_record_id" VARCHAR(255),
    "all_lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_synced_at" TIMESTAMP(6),
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,

    CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ecom"."variants" (
    "hararvan_product_id" BIGINT,
    "haravan_variant_id" BIGINT,
    "sku" VARCHAR,
    "price" DECIMAL,
    "price_compare_at" DECIMAL(36,8),
    "material_color" TEXT,
    "fineness" TEXT,
    "ring_size" DECIMAL,
    "haravan_product_id" INTEGER
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ecom"."wedding_rings" (
    "id" INTEGER,
    "title" TEXT,
    "max_price" DECIMAL,
    "min_price" DECIMAL,
    "image_updated_at" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "erpnext"."lead_sources" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "pancake_page_id" VARCHAR,
    "pancake_platform" VARCHAR,
    "source_name" VARCHAR,

    CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."buyback_exchange_approval_instances" (
    "id" SERIAL NOT NULL,
    "instance_code" VARCHAR,
    "serial_number" VARCHAR,
    "instance_type" VARCHAR,
    "order_code" VARCHAR,
    "new_order_code" VARCHAR,
    "status" VARCHAR,
    "customer_name" VARCHAR,
    "phone_number" VARCHAR,
    "national_id" VARCHAR,
    "products_info" JSONB,
    "reason" VARCHAR,
    "refund_amount" DECIMAL,
    "is_synced_to_crm" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "submitted_date" TIMESTAMP(6),

    CONSTRAINT "buyback_exchange_approval_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."crm_lark_message" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "crm_id" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lark_message_id" VARCHAR,
    "order_data_item" JSON,
    "order_id" BIGINT,
    "order_name" VARCHAR,

    CONSTRAINT "crm_lark_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."cskh" (
    "instance_code" TEXT,
    "instance_type" TEXT,
    "order_code" TEXT,
    "new_order_code" TEXT,
    "status" TEXT,
    "customer_name" TEXT,
    "phone_number" TEXT,
    "products_info" TEXT,
    "reason" TEXT,
    "refund_amount" DOUBLE PRECISION,
    "submitted_date" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."customer_appointments" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "lead_sale_name" VARCHAR,
    "lead_sale_email" VARCHAR,
    "suport_sale_name_list" TEXT,
    "suport_sale_email_list" TEXT,
    "store_name" VARCHAR,
    "customer_name" VARCHAR,
    "customer_phone" VARCHAR,
    "customer_gender" VARCHAR,
    "channel" VARCHAR,
    "order_status" VARCHAR,
    "expected_visit_date" TIMESTAMP(6),
    "expected_visit_time_utc_plus_7" TIMESTAMP(6),
    "store_welcome_content" TEXT,
    "exchange_policy" TEXT,
    "note" TEXT,
    "budget_range" VARCHAR,
    "budget" DECIMAL(36,8),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_appointments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."departments" (
    "department_id" TEXT NOT NULL,
    "open_department_id" TEXT,
    "name" TEXT,
    "parent_department_id" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."groups" (
    "group_id" TEXT NOT NULL,
    "group_name" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."instances" (
    "uuid" TEXT NOT NULL,
    "serial_number" TEXT,
    "instance_code" TEXT,
    "approval_code" TEXT,
    "approval_name" TEXT,
    "status" TEXT,
    "department_id" TEXT,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "user_id" TEXT,
    "form" JSONB,
    "form_data" JSONB,

    CONSTRAINT "instances_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."lark_line_items_payment" (
    "lark_record_id" VARCHAR(255) NOT NULL,
    "order_id" VARCHAR(50) NOT NULL,
    "variant_id" VARCHAR NOT NULL,

    CONSTRAINT "lark_line_items_payment_pkey" PRIMARY KEY ("order_id","variant_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."lark_order_qr_generator" (
    "haravan_order_id" BIGINT NOT NULL,
    "lark_record_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "lark_order_qr_generator_pkey" PRIMARY KEY ("haravan_order_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."lark_variants" (
    "variant_id" BIGINT NOT NULL,
    "lark_record_id" VARCHAR(255),

    CONSTRAINT "lark_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."lark_warehouse_inventories" (
    "id" SERIAL NOT NULL,
    "lark_record_id" VARCHAR,
    "qty_onhand" BIGINT,
    "qty_committed" BIGINT,
    "qty_available" BIGINT,
    "qty_incoming" BIGINT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_inventories_lark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."promotion_approval" (
    "id" SERIAL NOT NULL,
    "order_code" VARCHAR,
    "reason" VARCHAR,
    "customer_name" VARCHAR,
    "phone_number" VARCHAR,
    "order_amount" DECIMAL,
    "order_request_discount" DECIMAL,
    "is_synced_to_crm" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "submitted_date" TIMESTAMP(6),
    "instance_code" VARCHAR,
    "serial_number" VARCHAR,

    CONSTRAINT "promotion_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."shifts" (
    "shift_id" TEXT NOT NULL,
    "shift_name" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."user_daily_shifts" (
    "day_no" INTEGER NOT NULL,
    "group_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "shift_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_shifts_pkey" PRIMARY KEY ("day_no","group_id","month","user_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "larksuite"."users" (
    "user_id" TEXT NOT NULL,
    "open_id" TEXT,
    "union_id" TEXT,
    "name" TEXT,
    "en_name" TEXT,
    "email" TEXT,
    "enterprise_email" TEXT,
    "gender" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "department_ids" TEXT[],
    "description" TEXT,
    "employee_no" TEXT,
    "employee_type" INTEGER,
    "is_tenant_manager" BOOLEAN,
    "job_title" TEXT,
    "join_time" BIGINT,
    "leader_user_id" TEXT,
    "work_station" TEXT,
    "status_is_activated" BOOLEAN,
    "status_is_exited" BOOLEAN,
    "status_is_frozen" BOOLEAN,
    "status_is_resigned" BOOLEAN,
    "status_is_unjoin" BOOLEAN,
    "avatar" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "misa"."inventory_items" (
    "uuid" VARCHAR NOT NULL,
    "sku" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "misa"."items" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "dictionary_type" INTEGER,
    "inventory_item_name" VARCHAR,
    "inventory_item_code" VARCHAR,
    "inventory_item_type" INTEGER,
    "minimum_stock" DOUBLE PRECISION,
    "inventory_item_category_code_list" VARCHAR,
    "inventory_item_category_name_list" VARCHAR,
    "inventory_item_category_id_list" VARCHAR,
    "inventory_item_category_misa_code_list" VARCHAR,
    "branch_id" VARCHAR,
    "discount_type" INTEGER,
    "inventory_item_cost_method" INTEGER,
    "unit_id" VARCHAR,
    "is_unit_price_after_tax" BOOLEAN,
    "is_system" BOOLEAN,
    "inactive" BOOLEAN,
    "is_follow_serial_number" BOOLEAN,
    "is_allow_duplicate_serial_number" BOOLEAN,
    "purchase_discount_rate" DOUBLE PRECISION,
    "unit_price" DECIMAL(36,8),
    "sale_price1" DECIMAL(36,8),
    "sale_price2" DECIMAL(36,8),
    "sale_price3" DECIMAL(36,8),
    "fixed_sale_price" DECIMAL(36,8),
    "import_tax_rate" DOUBLE PRECISION,
    "export_tax_rate" DOUBLE PRECISION,
    "fixed_unit_price" DECIMAL(36,8),
    "description" TEXT,
    "inventory_account" VARCHAR,
    "cogs_account" VARCHAR,
    "sale_account" VARCHAR,
    "unit_list" JSONB,
    "unit_name" VARCHAR,
    "reftype" INTEGER,
    "reftype_category" INTEGER,
    "quantityBarCode" INTEGER,
    "allocation_type" INTEGER,
    "allocation_time" INTEGER,
    "tax_reduction_type" INTEGER,
    "purchase_last_unit_price" DECIMAL(36,8),
    "is_specific_inventory_item" BOOLEAN,
    "has_delete_fixed_unit_price" BOOLEAN,
    "has_delete_unit_price" BOOLEAN,
    "has_delete_discount" BOOLEAN,
    "has_delete_unit_convert" BOOLEAN,
    "has_delete_norm" BOOLEAN,
    "has_delete_serial_type" BOOLEAN,
    "is_edit_multiple" BOOLEAN,
    "is_not_sync_crm" BOOLEAN,
    "isUpdateRebundant" BOOLEAN,
    "is_special_inv" BOOLEAN,
    "isCustomPrimaryKey" BOOLEAN,
    "isFromProcessBalance" BOOLEAN,
    "is_drug" BOOLEAN,
    "status_sync_medicine_national" INTEGER,
    "is_sync_corp" BOOLEAN,
    "convert_rate" DOUBLE PRECISION,
    "is_update_main_unit" BOOLEAN,
    "is_image_duplicate" BOOLEAN,
    "is_group" BOOLEAN,
    "discount_value" DECIMAL(36,8),
    "is_set_discount" BOOLEAN,
    "index_unit_convert" INTEGER,
    "excel_row_index" INTEGER,
    "is_valid" BOOLEAN,
    "created_date" TIMESTAMP(6),
    "created_by" VARCHAR,
    "modified_date" TIMESTAMP(6),
    "modified_by" VARCHAR,
    "auto_refno" BOOLEAN,
    "force_update" BOOLEAN,
    "state" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "misa"."purchase_voucher_details" (
    "uuid" VARCHAR(36) NOT NULL,
    "ref_detail_id" VARCHAR(36) NOT NULL,
    "refid" VARCHAR(36),
    "inventory_item_id" VARCHAR(36),
    "inventory_item_name" VARCHAR,
    "stock_id" VARCHAR(36),
    "unit_id" VARCHAR(36),
    "pu_invoice_refid" VARCHAR(36),
    "main_unit_id" VARCHAR(36),
    "purchase_purpose_id" VARCHAR(36),
    "organization_unit_id" VARCHAR(36),
    "sort_order" INTEGER,
    "inventory_resale_type_id" INTEGER,
    "inv_date" TIMESTAMP(6),
    "date_enough_tax_payment" TIMESTAMP(6),
    "un_resonable_cost" BOOLEAN,
    "quantity" DOUBLE PRECISION,
    "unit_price" DECIMAL(36,8),
    "amount_oc" DECIMAL(36,8),
    "amount" DECIMAL(36,8),
    "discount_rate" DOUBLE PRECISION,
    "discount_amount_oc" DECIMAL(36,8),
    "import_charge_before_custom_amount_oc" DECIMAL(36,8),
    "import_charge_before_custom_amount" DECIMAL(36,8),
    "import_charge_before_custom_amount_main_currency" DECIMAL(36,8),
    "allocation_rate_import_origin_currency" DOUBLE PRECISION,
    "import_charge_before_custom_amount_allocated" DECIMAL(36,8),
    "cash_out_exchange_rate_management" DOUBLE PRECISION,
    "allocation_rate" DOUBLE PRECISION,
    "allocation_rate_import" DOUBLE PRECISION,
    "unit_price_after_tax" DECIMAL(36,8),
    "import_charge_exchange_rate" DECIMAL(36,8),
    "cash_out_diff_vat_amount_finance" DECIMAL(36,8),
    "cash_out_amount_management" DECIMAL(36,8),
    "cash_out_diff_amount_management" DECIMAL(36,8),
    "cash_out_vat_amount_management" DECIMAL(36,8),
    "cash_out_diff_vat_amount_management" DECIMAL(36,8),
    "cash_out_exchange_rate_finance" DOUBLE PRECISION,
    "special_consume_tax_amount" DECIMAL(36,8),
    "environmental_tax_amount" DECIMAL(36,8),
    "environmental_tax_amount_oc" DECIMAL(36,8),
    "cash_out_amount_finance" DECIMAL(36,8),
    "cash_out_diff_amount_finance" DECIMAL(36,8),
    "cash_out_vat_amount_finance" DECIMAL(36,8),
    "import_tax_rate_price" DECIMAL(36,8),
    "import_tax_rate" DOUBLE PRECISION,
    "import_tax_amount_oc" DECIMAL(36,8),
    "import_tax_amount" DECIMAL(36,8),
    "anti_dumping_tax_rate" DOUBLE PRECISION,
    "anti_dumping_tax_amount" DECIMAL(36,8),
    "anti_dumping_tax_amount_oc" DECIMAL(36,8),
    "anti_dumping_tax_account" VARCHAR,
    "special_consume_tax_rate" DOUBLE PRECISION,
    "special_consume_tax_amount_oc" DECIMAL(36,8),
    "vat_rate" DOUBLE PRECISION,
    "vat_amount_oc" DECIMAL(36,8),
    "vat_amount" DECIMAL(36,8),
    "fob_amount_oc" DECIMAL(36,8),
    "fob_amount" DECIMAL(36,8),
    "import_charge_amount" DECIMAL(36,8),
    "discount_amount" DECIMAL(36,8),
    "freight_amount" DECIMAL(36,8),
    "inward_amount" DECIMAL(36,8),
    "main_convert_rate" DOUBLE PRECISION,
    "main_quantity" DOUBLE PRECISION,
    "main_unit_price" DECIMAL(36,8),
    "description" TEXT,
    "debit_account" VARCHAR,
    "credit_account" VARCHAR,
    "exchange_rate_operator" VARCHAR,
    "vat_account" VARCHAR,
    "inv_no" VARCHAR,
    "import_tax_account" VARCHAR,
    "special_consume_tax_account" VARCHAR,
    "environmental_tax_account" VARCHAR,
    "vat_description" TEXT,
    "stock_code" VARCHAR,
    "inventory_item_code" VARCHAR,
    "main_unit_name" VARCHAR,
    "organization_unit_code" VARCHAR,
    "organization_unit_name" VARCHAR,
    "unit_name" VARCHAR,
    "edit_version" BIGINT,
    "purchase_purpose_code" VARCHAR,
    "inventory_item_type" INTEGER,
    "purchase_purpose_name" TEXT,
    "pu_order_refno" VARCHAR,
    "pu_order_code" VARCHAR,
    "is_follow_serial_number" BOOLEAN,
    "is_allow_duplicate_serial_number" BOOLEAN,
    "is_description" BOOLEAN,
    "panel_height_quantity" DOUBLE PRECISION,
    "panel_length_quantity" DOUBLE PRECISION,
    "panel_quantity" DOUBLE PRECISION,
    "panel_radius_quantity" DOUBLE PRECISION,
    "panel_width_quantity" DOUBLE PRECISION,
    "inventory_item_cogs_account" VARCHAR,
    "inventory_account" VARCHAR,
    "unit_list" TEXT,
    "import_tax_rate_price_origin" DECIMAL(36,8),
    "quantity_product_produce" DOUBLE PRECISION,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_voucher_details_pkey" PRIMARY KEY ("uuid","ref_detail_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "misa"."purchase_vouchers" (
    "uuid" VARCHAR(36) NOT NULL,
    "refid" VARCHAR(50),
    "branch_id" VARCHAR(36),
    "account_object_id" VARCHAR(36),
    "reftype" INTEGER,
    "display_on_book" INTEGER,
    "refdate" TIMESTAMP(6),
    "posted_date" TIMESTAMP(6),
    "caba_refdate" TIMESTAMP(6),
    "caba_posted_date" TIMESTAMP(6),
    "created_date" TIMESTAMP(6),
    "modified_date" TIMESTAMP(6),
    "is_posted_finance" BOOLEAN,
    "is_posted_management" BOOLEAN,
    "is_posted_cash_book_finance" BOOLEAN,
    "is_posted_cash_book_management" BOOLEAN,
    "is_posted_inventory_book_finance" BOOLEAN,
    "is_posted_inventory_book_management" BOOLEAN,
    "total_amount_oc" DECIMAL(36,8),
    "total_amount" DECIMAL(36,8),
    "total_import_tax_amount_oc" DECIMAL(36,8),
    "total_import_tax_amount" DECIMAL(36,8),
    "total_vat_amount_oc" DECIMAL(36,8),
    "total_special_consume_tax_amount" DECIMAL(36,8),
    "total_custom_before_amount" DECIMAL(36,8),
    "caba_amount_oc" DECIMAL(36,8),
    "caba_amount" DECIMAL(36,8),
    "total_vat_amount" DECIMAL(36,8),
    "total_discount_amount_oc" DECIMAL(36,8),
    "total_discount_amount" DECIMAL(36,8),
    "total_freight_amount" DECIMAL(36,8),
    "total_inward_amount" DECIMAL(36,8),
    "total_special_consume_tax_amount_oc" DECIMAL(36,8),
    "total_payment_amount" DECIMAL(36,8),
    "total_payment_amount_oc" DECIMAL(36,8),
    "total_environmental_tax_amount" DECIMAL(36,8),
    "refno_finance" VARCHAR,
    "account_object_name" VARCHAR,
    "account_object_address" VARCHAR,
    "created_by" VARCHAR,
    "modified_by" VARCHAR,
    "journal_memo" TEXT,
    "account_object_code" VARCHAR,
    "paid_status" INTEGER,
    "include_invoice" INTEGER,
    "branch_name" VARCHAR,
    "edit_version" BIGINT,
    "currency_id" VARCHAR,
    "exchange_rate" DOUBLE PRECISION,
    "account_object_tax_code" VARCHAR,
    "is_freight_service" BOOLEAN,
    "employee_id" VARCHAR(36),
    "in_outward_refno" VARCHAR,
    "status_sync_medicine_national" INTEGER,
    "discount_type" INTEGER,
    "employee_name" VARCHAR,
    "employee_code" VARCHAR,
    "total_anti_dumping_tax_amount" DECIMAL(36,8),
    "total_anti_dumping_tax_amount_oc" DECIMAL(36,8),
    "wesign_document_text" TEXT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_vouchers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "misa"."warehouse_inventories" (
    "uuid" VARCHAR(36) NOT NULL,
    "inventory_item_id" VARCHAR(36) NOT NULL,
    "inventory_item_code" VARCHAR(50),
    "inventory_item_name" VARCHAR(255),
    "stock_id" VARCHAR(36) NOT NULL,
    "stock_code" VARCHAR(50),
    "stock_name" VARCHAR(255),
    "organization_unit_id" VARCHAR(36),
    "organization_unit_code" VARCHAR(50),
    "organization_unit_name" VARCHAR(255),
    "quantity_balance" DOUBLE PRECISION,
    "amount_balance" DECIMAL(36,2),
    "unit_price" DECIMAL(36,2),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("inventory_item_id","stock_id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payment"."sepay_transaction" (
    "id" VARCHAR(50) NOT NULL,
    "bank_brand_name" VARCHAR,
    "account_number" VARCHAR,
    "transaction_date" VARCHAR,
    "amount_out" VARCHAR,
    "amount_in" VARCHAR,
    "accumulated" VARCHAR,
    "transaction_content" TEXT,
    "reference_number" VARCHAR,
    "code" VARCHAR,
    "sub_account" VARCHAR,
    "bank_account_id" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lark_record_id" VARCHAR(255),

    CONSTRAINT "sepay_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "leads_custom_uuid_key" ON "ecom"."leads"("custom_uuid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "products_unique_haravan_id" ON "ecom"."products"("haravan_product_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_ecom_qr_generator_id" ON "ecom"."qr_generator"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "unique_haravan_variant_id" ON "ecom"."variants"("haravan_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "wedding_rings_id_key" ON "ecom"."wedding_rings"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "lead_sources_name_key" ON "erpnext"."lead_sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "buyback_exchange_approval_instances_instance_code_key" ON "larksuite"."buyback_exchange_approval_instances"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ix_larksuite_customer_appointments_id" ON "larksuite"."customer_appointments"("id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_larksuite_customer_appointments_uuid" ON "larksuite"."customer_appointments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "departments_open_department_id_key" ON "larksuite"."departments"("open_department_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "instances_serial_number_key" ON "larksuite"."instances"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "instances_instance_code_key" ON "larksuite"."instances"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ix_larksuite_warehouse_inventories_lark_id" ON "larksuite"."lark_warehouse_inventories"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "instance_code_unique" ON "larksuite"."promotion_approval"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_open_id_key" ON "larksuite"."users"("open_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_union_id_key" ON "larksuite"."users"("union_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ix_misa_inventory_items_sku" ON "misa"."inventory_items"("sku");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_misa_inventory_items_uuid" ON "misa"."inventory_items"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ix_misa_items_id" ON "misa"."items"("id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "purchase_voucher_details_ref_detail_id_key" ON "misa"."purchase_voucher_details"("ref_detail_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ix_misa_purchase_voucher_details_refid" ON "misa"."purchase_voucher_details"("refid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ix_misa_purchase_vouchers_refid" ON "misa"."purchase_vouchers"("refid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_haravan_id_key" ON "misa"."users"("haravan_id");
