-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecom";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "haravan";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "larksuite";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "misa";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pancake";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payment";

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

-- CreateTable
CREATE TABLE "ecom"."leads" (
    "id" SERIAL NOT NULL,
    "raw_data" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "custom_uuid" TEXT DEFAULT (gen_random_uuid())::text,
    "source" TEXT DEFAULT 'Website',

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecom"."products" (
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
CREATE TABLE "ecom"."qr_generator" (
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
    "haravan_order_id" INTEGER,
    "haravan_order_total_price" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "is_deleted" BOOLEAN DEFAULT false,
    "qr_url" TEXT,
    "lark_record_id" VARCHAR(255),
    "all_lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_synced_at" TIMESTAMP(6),
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,
    "payment_entry_name" VARCHAR,
    "payment_references" JSONB,
    "refund_amount" DECIMAL(12,2),

    CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecom"."variants" (
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
CREATE TABLE "ecom"."wedding_rings" (
    "id" INTEGER,
    "title" TEXT,
    "max_price" DECIMAL,
    "min_price" DECIMAL,
    "image_updated_at" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE "haravan"."collection_product" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "collection_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "featured" BOOLEAN,
    "position" INTEGER,
    "product_id" BIGINT,
    "sort_value" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_product_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."custom_collections" (
    "uuid" VARCHAR NOT NULL,
    "id" INTEGER,
    "body_html" TEXT,
    "handle" VARCHAR,
    "image" JSONB,
    "published" BOOLEAN,
    "published_at" TIMESTAMP(6),
    "published_scope" VARCHAR,
    "sort_order" VARCHAR,
    "template_suffix" VARCHAR,
    "title" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "products_count" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_collections_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."customers" (
    "uuid" VARCHAR NOT NULL,
    "id" INTEGER,
    "accepts_marketing" BOOLEAN,
    "default_address" JSONB,
    "addresses" JSONB,
    "address_address1" VARCHAR,
    "address_address2" VARCHAR,
    "address_city" VARCHAR,
    "address_company" VARCHAR,
    "address_country" VARCHAR,
    "address_country_code" VARCHAR,
    "address_id" BIGINT,
    "address_first_name" VARCHAR,
    "address_last_name" VARCHAR,
    "address_phone" VARCHAR,
    "address_province" VARCHAR,
    "address_province_code" VARCHAR,
    "address_zip" VARCHAR,
    "address_name" VARCHAR,
    "address_default" BOOLEAN,
    "address_district" VARCHAR,
    "address_district_code" VARCHAR,
    "address_ward" VARCHAR,
    "address_ward_code" VARCHAR,
    "email" VARCHAR,
    "phone" VARCHAR,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "multipass_identifier" BOOLEAN,
    "last_order_id" BIGINT,
    "last_order_name" VARCHAR,
    "published" BOOLEAN,
    "note" VARCHAR,
    "orders_count" INTEGER,
    "state" VARCHAR,
    "tags" VARCHAR,
    "total_spent" DECIMAL(36,8),
    "total_paid" DECIMAL(36,8),
    "verified_email" BOOLEAN,
    "group_name" VARCHAR,
    "birthday" TIMESTAMP(6),
    "gender" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."fulfillments" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
    "order_id" BIGINT,
    "status" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "tracking_company" VARCHAR,
    "tracking_company_code" VARCHAR,
    "tracking_numbers" JSONB,
    "tracking_number" VARCHAR,
    "tracking_url" VARCHAR,
    "tracking_urls" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."images" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "src" VARCHAR,
    "position" INTEGER,
    "filename" VARCHAR,
    "variant_ids" JSONB,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."inventory_logs" (
    "id" BIGINT NOT NULL,
    "storeid" BIGINT,
    "typeid" BIGINT,
    "locid" BIGINT,
    "refid" BIGINT,
    "reflineid" BIGINT,
    "refnumber" VARCHAR,
    "productid" BIGINT,
    "variantid" BIGINT,
    "qty_onhand" DECIMAL,
    "qty_commited" DECIMAL,
    "qty_incoming" DECIMAL,
    "last_qty_onhand" DECIMAL,
    "last_qty_onhand_loc" DECIMAL,
    "last_qty_onhand_lot" DECIMAL,
    "last_qty_commited" DECIMAL,
    "last_qty_commited_loc" DECIMAL,
    "last_macostamount" DECIMAL,
    "costamount" DECIMAL,
    "trandate" TIMESTAMP(6),
    "createddate" TIMESTAMP(6),
    "createduser" BIGINT,
    "createdusername" VARCHAR,
    "locationname" VARCHAR,
    "trannumber" VARCHAR,
    "lotno" VARCHAR,
    "lotexpiredate" TIMESTAMP(6),
    "sku" VARCHAR,
    "barcode" VARCHAR,
    "producttypename" VARCHAR,
    "productvendorname" VARCHAR,
    "productname" VARCHAR,
    "optionvalue" VARCHAR,
    "reasonid" BIGINT,
    "varianttitle" VARCHAR,
    "typename" VARCHAR,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haravan"."line_items" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" INTEGER,
    "order_id" INTEGER,
    "fulfillable_quantity" INTEGER,
    "fulfillment_service" VARCHAR,
    "fulfillment_status" VARCHAR,
    "grams" DOUBLE PRECISION,
    "price" DECIMAL(36,8),
    "price_original" DECIMAL(36,8),
    "price_promotion" DECIMAL(36,8),
    "product_id" BIGINT,
    "quantity" INTEGER,
    "requires_shipping" BOOLEAN,
    "sku" VARCHAR,
    "title" VARCHAR,
    "variant_id" BIGINT,
    "variant_title" VARCHAR,
    "vendor" VARCHAR,
    "type" VARCHAR,
    "name" VARCHAR,
    "gift_card" BOOLEAN,
    "taxable" BOOLEAN,
    "tax_lines" JSONB,
    "product_exists" BOOLEAN,
    "barcode" VARCHAR,
    "properties" JSONB,
    "total_discount" DECIMAL(36,8),
    "applied_discounts" JSONB,
    "image" JSONB,
    "not_allow_promotion" BOOLEAN,
    "ma_cost_amount" DOUBLE PRECISION,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."orders" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" INTEGER,
    "billing_address_id" BIGINT,
    "billing_address_address1" VARCHAR,
    "billing_address_address2" VARCHAR,
    "billing_address_city" VARCHAR,
    "billing_address_company" VARCHAR,
    "billing_address_country" VARCHAR,
    "billing_address_first_name" VARCHAR,
    "billing_address_last_name" VARCHAR,
    "billing_address_phone" VARCHAR,
    "billing_address_province" VARCHAR,
    "billing_address_zip" VARCHAR,
    "billing_address_name" VARCHAR,
    "billing_address_province_code" VARCHAR,
    "billing_address_country_code" VARCHAR,
    "billing_address_default" BOOLEAN,
    "billing_address_district" VARCHAR,
    "billing_address_district_code" VARCHAR,
    "billing_address_ward" VARCHAR,
    "billing_address_ward_code" VARCHAR,
    "browser_ip" VARCHAR,
    "buyer_accepts_marketing" BOOLEAN,
    "cancel_reason" VARCHAR,
    "cancelled_at" TIMESTAMP(6),
    "cart_token" VARCHAR,
    "checkout_token" VARCHAR,
    "client_details_accept_language" VARCHAR,
    "client_details_browser_height" BIGINT,
    "client_details_browser_width" BIGINT,
    "client_details_session_hash" VARCHAR,
    "client_details_user_agent" VARCHAR,
    "client_details_browser_ip" VARCHAR,
    "closed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "currency" VARCHAR,
    "customer_id" BIGINT,
    "customer_email" VARCHAR,
    "customer_phone" VARCHAR,
    "customer_first_name" VARCHAR,
    "customer_last_name" VARCHAR,
    "customer_multipass_identifier" VARCHAR,
    "customer_last_order_id" BIGINT,
    "customer_last_order_name" VARCHAR,
    "customer_note" TEXT,
    "customer_order_count" INTEGER,
    "customer_state" VARCHAR,
    "customer_tags" VARCHAR,
    "customer_total_spent" DECIMAL(36,8),
    "customer_updated_at" TIMESTAMP(6),
    "customer_verified_email" BOOLEAN,
    "customer_send_email_invite" BOOLEAN,
    "customer_send_email_welcome" BOOLEAN,
    "customer_password" VARCHAR,
    "customer_password_confirmation" VARCHAR,
    "customer_group_name" VARCHAR,
    "customer_birthday" VARCHAR,
    "customer_gender" VARCHAR,
    "customer_last_order_date" TIMESTAMP(6),
    "customer_default_address_id" BIGINT,
    "customer_default_address_address1" VARCHAR,
    "customer_default_address_address2" VARCHAR,
    "customer_default_address_city" VARCHAR,
    "customer_default_address_company" VARCHAR,
    "customer_default_address_country" VARCHAR,
    "customer_default_address_province" VARCHAR,
    "customer_default_address_first_name" VARCHAR,
    "customer_default_address_last_name" VARCHAR,
    "customer_default_address_phone" VARCHAR,
    "customer_default_address_province_code" VARCHAR,
    "customer_default_address_country_code" VARCHAR,
    "customer_default_address_default" BOOLEAN,
    "customer_default_address_district" VARCHAR,
    "customer_default_address_district_code" VARCHAR,
    "customer_default_address_ward" VARCHAR,
    "customer_default_address_ward_code" VARCHAR,
    "discount_codes" JSONB,
    "email" VARCHAR,
    "financial_status" VARCHAR,
    "fulfillment_status" VARCHAR,
    "tags" VARCHAR,
    "gateway" VARCHAR,
    "gateway_code" VARCHAR,
    "landing_site" VARCHAR,
    "landing_site_ref" VARCHAR,
    "source" VARCHAR,
    "name" VARCHAR,
    "note" TEXT,
    "number" INTEGER,
    "order_number" VARCHAR,
    "processing_method" VARCHAR,
    "shipping_address_address1" VARCHAR,
    "shipping_address_address2" VARCHAR,
    "shipping_address_city" VARCHAR,
    "shipping_address_company" VARCHAR,
    "shipping_address_country" VARCHAR,
    "shipping_address_first_name" VARCHAR,
    "shipping_address_last_name" VARCHAR,
    "shipping_address_latitude" DOUBLE PRECISION,
    "shipping_address_longitude" DOUBLE PRECISION,
    "shipping_address_phone" VARCHAR,
    "shipping_address_province" VARCHAR,
    "shipping_address_zip" VARCHAR,
    "shipping_address_name" VARCHAR,
    "shipping_address_province_code" VARCHAR,
    "shipping_address_country_code" VARCHAR,
    "shipping_address_district_code" VARCHAR,
    "shipping_address_district" VARCHAR,
    "shipping_address_ward_code" VARCHAR,
    "shipping_address_ward" VARCHAR,
    "shipping_lines" JSONB,
    "source_name" VARCHAR,
    "subtotal_price" DECIMAL(36,8),
    "tax_lines" VARCHAR,
    "taxes_included" BOOLEAN,
    "token" VARCHAR,
    "total_discounts" DECIMAL(36,8),
    "total_line_items_price" DECIMAL(36,8),
    "total_price" DECIMAL(36,8),
    "total_tax" DECIMAL(36,8),
    "total_weight" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(6),
    "note_attributes" JSONB,
    "confirmed_at" TIMESTAMP(6),
    "closed_status" VARCHAR,
    "cancelled_status" VARCHAR,
    "confirmed_status" VARCHAR,
    "assigned_location_id" BIGINT,
    "assigned_location_name" VARCHAR,
    "assigned_location_at" TIMESTAMP(6),
    "exported_confirm_at" TIMESTAMP(6),
    "user_id" BIGINT,
    "device_id" BIGINT,
    "location_id" BIGINT,
    "location_name" VARCHAR,
    "ref_order_id" BIGINT,
    "ref_order_date" TIMESTAMP(6),
    "ref_order_number" VARCHAR,
    "utm_source" VARCHAR,
    "utm_medium" VARCHAR,
    "utm_campaign" VARCHAR,
    "utm_term" VARCHAR,
    "utm_content" VARCHAR,
    "payment_url" VARCHAR,
    "contact_email" VARCHAR,
    "order_processing_status" VARCHAR,
    "prev_order_id" BIGINT,
    "prev_order_number" VARCHAR,
    "prev_order_date" TIMESTAMP(6),
    "redeem_model" VARCHAR,
    "confirm_user" BIGINT,
    "risk_level" VARCHAR,
    "discount_applications" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."products" (
    "uuid" VARCHAR NOT NULL,
    "id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "published_scope" VARCHAR,
    "handle" VARCHAR,
    "product_type" VARCHAR,
    "images" JSONB,
    "tags" VARCHAR,
    "template_suffix" VARCHAR,
    "title" VARCHAR,
    "variants" JSONB,
    "only_hide_from_list" BOOLEAN,
    "not_allow_promotion" BOOLEAN,
    "options" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."purchase_receives" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "receive_number" VARCHAR,
    "supplier" JSONB,
    "supplier_id" BIGINT,
    "supplier_name" VARCHAR,
    "location" JSONB,
    "location_id" BIGINT,
    "location_name" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "received_at" TIMESTAMP(6),
    "notes" TEXT,
    "status" VARCHAR,
    "total" DECIMAL(36,8),
    "total_cost" DECIMAL(36,8),
    "tags" VARCHAR,
    "ref_purchase_order_id" VARCHAR,
    "ref_number" VARCHAR,
    "line_items" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_receives_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."purchase_receives_items" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "purchase_receive_id" BIGINT,
    "purchase_receive_number" VARCHAR,
    "product_id" BIGINT,
    "product_name" VARCHAR,
    "product_variant_id" BIGINT,
    "variant_title" VARCHAR,
    "sku" VARCHAR,
    "barcode" VARCHAR,
    "original_cost" DECIMAL(36,8),
    "discount_amount" DECIMAL(36,8),
    "cost" DECIMAL(36,8),
    "product_quantity" INTEGER,
    "total_cost" DECIMAL(36,8),
    "variant_unit" JSONB,
    "lots" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_receives_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."refunds" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
    "order_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "note" VARCHAR,
    "refund_line_items" JSONB,
    "restock" BOOLEAN,
    "user_id" BIGINT,
    "location_id" BIGINT,
    "transactions" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."transactions" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
    "order_id" BIGINT,
    "amount" DECIMAL(36,8),
    "authorization" VARCHAR(50),
    "created_at" TIMESTAMP(6),
    "device_id" BIGINT,
    "gateway" VARCHAR(100),
    "kind" VARCHAR(10),
    "receipt" VARCHAR(255),
    "status" VARCHAR(10),
    "test" BOOLEAN,
    "user_id" BIGINT,
    "location_id" BIGINT,
    "currency" VARCHAR,
    "is_cod_gateway" BOOLEAN,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."users" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "email" VARCHAR,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "phone" VARCHAR,
    "account_owner" BOOLEAN,
    "bio" TEXT,
    "im" TEXT,
    "receive_announcements" INTEGER,
    "url" TEXT,
    "user_type" VARCHAR,
    "permissions" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."variants" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "product_id" BIGINT,
    "published_scope" VARCHAR,
    "handle" VARCHAR,
    "product_type" VARCHAR,
    "template_suffix" VARCHAR,
    "product_title" VARCHAR,
    "product_vendor" VARCHAR,
    "barcode" VARCHAR,
    "compare_at_price" DECIMAL(36,8),
    "created_at" TIMESTAMP(6),
    "fulfillment_service" VARCHAR,
    "grams" INTEGER,
    "inventory_management" VARCHAR,
    "inventory_policy" VARCHAR,
    "inventory_quantity" INTEGER,
    "position" INTEGER,
    "price" DECIMAL(36,8),
    "requires_shipping" BOOLEAN,
    "sku" VARCHAR,
    "taxable" BOOLEAN,
    "title" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "image_id" BIGINT,
    "option1" VARCHAR,
    "option2" VARCHAR,
    "option3" VARCHAR,
    "qty_onhand" INTEGER,
    "qty_commited" INTEGER,
    "qty_available" INTEGER,
    "qty_incoming" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."warehouse_inventories" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "loc_id" BIGINT,
    "product_id" BIGINT,
    "variant_id" BIGINT,
    "qty_onhand" BIGINT,
    "qty_committed" BIGINT,
    "qty_available" BIGINT,
    "qty_incoming" BIGINT,
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."warehouses" (
    "id" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "larksuite"."records" (
    "uuid" UUID NOT NULL,
    "record_id" TEXT NOT NULL,
    "table_id" TEXT,
    "app_token" TEXT,
    "fields" JSONB NOT NULL DEFAULT '{}',
    "database_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "larksuite"."buyback_exchange_approval_instances" (
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
    "user_id" VARCHAR,
    "department_id" VARCHAR,
    "department_name" VARCHAR,
    "product_handed_over_at" TIMESTAMP(6),

    CONSTRAINT "buyback_exchange_approval_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "larksuite"."crm_lark_message" (
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
CREATE TABLE "larksuite"."cskh" (
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
CREATE TABLE "larksuite"."customer_appointments" (
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
CREATE TABLE "larksuite"."departments" (
    "department_id" TEXT NOT NULL,
    "open_department_id" TEXT,
    "name" TEXT,
    "parent_department_id" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "larksuite"."groups" (
    "group_id" TEXT NOT NULL,
    "group_name" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "larksuite"."instances" (
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
CREATE TABLE "larksuite"."lark_line_items_payment" (
    "lark_record_id" VARCHAR(255) NOT NULL,
    "order_id" VARCHAR(50) NOT NULL,
    "variant_id" VARCHAR NOT NULL,

    CONSTRAINT "lark_line_items_payment_pkey" PRIMARY KEY ("order_id","variant_id")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_order_qr_generator" (
    "haravan_order_id" BIGINT NOT NULL,
    "lark_record_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "lark_order_qr_generator_pkey" PRIMARY KEY ("haravan_order_id")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_variants" (
    "variant_id" BIGINT NOT NULL,
    "lark_record_id" VARCHAR(255),

    CONSTRAINT "lark_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_warehouse_inventories" (
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
CREATE TABLE "larksuite"."promotion_approval" (
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
CREATE TABLE "larksuite"."shifts" (
    "shift_id" TEXT NOT NULL,
    "shift_name" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE "larksuite"."user_daily_shifts" (
    "day_no" INTEGER NOT NULL,
    "group_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "shift_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_shifts_pkey" PRIMARY KEY ("day_no","group_id","month","user_id")
);

-- CreateTable
CREATE TABLE "larksuite"."users" (
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
CREATE TABLE "larksuite"."tech_tickets" (
    "record_id" TEXT NOT NULL,
    "ticket_id" TEXT,
    "ticket_name" TEXT,
    "ticket_type" TEXT,
    "ticket_priority" TEXT,
    "ticket_status" TEXT,
    "description" TEXT,
    "solution_update" TEXT,
    "created_time" TIMESTAMP(3),
    "updated_time" TIMESTAMP(3),
    "manual_updated_time" TIMESTAMP(3),
    "completed_time" TIMESTAMP(3),
    "expected_completion_time" TIMESTAMP(3),
    "ticket_no_in_month" TEXT,
    "current_number_in_month" INTEGER,
    "new_deadline" TIMESTAMP(3),
    "sla_50_percent" TIMESTAMP(3),
    "reminder_time" TIMESTAMP(3),
    "manager" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(3),
    "processed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tech_tickets_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "larksuite"."appointments" (
    "record_id" TEXT NOT NULL,
    "store" TEXT,
    "name" TEXT,
    "phone_number" TEXT,
    "gender" TEXT,
    "product_images" JSONB,
    "note" TEXT,
    "date_time" TIMESTAMP(3),
    "conversation_greeting" TEXT,
    "customer_response" TEXT,
    "main_sales" JSONB,
    "offline_sales" JSONB,
    "status" TEXT,
    "policy" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("record_id")
);

-- CreateTable
CREATE TABLE "misa"."users" (
    "uuid" UUID NOT NULL,
    "employee_code" VARCHAR(255),
    "haravan_id" BIGINT NOT NULL,
    "email" VARCHAR(255),
    "database_created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."inventory_items" (
    "uuid" VARCHAR NOT NULL,
    "sku" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."items" (
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
CREATE TABLE "misa"."purchase_voucher_details" (
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
CREATE TABLE "misa"."purchase_vouchers" (
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
CREATE TABLE "misa"."warehouse_inventories" (
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
CREATE TABLE "misa"."customers" (
    "uuid" VARCHAR(36) NOT NULL,
    "haravan_id" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "haravan_created_at" TIMESTAMP(6),
    "last_synced_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."balance_sheet_monthly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "item_index" INTEGER,
    "description" TEXT,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "category" INTEGER,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "balance_sheet_monthly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."income_statement_monthly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_statement_monthly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."cash_flow_monthly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR,
    "item_name" VARCHAR NOT NULL,
    "item_index" INTEGER,
    "description" TEXT,
    "category" INTEGER,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "formula" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "hidden" BOOLEAN,
    "is_bold" BOOLEAN,
    "is_italic" BOOLEAN,
    "sort_order" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "cash_flow_monthly_fact_pkey" PRIMARY KEY ("time_id","item_name")
);

-- CreateTable
CREATE TABLE "misa"."journal_entries" (
    "id" SERIAL NOT NULL,
    "refno" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "page_index" INTEGER NOT NULL,
    "session_id" UUID NOT NULL,
    "data_details" JSONB NOT NULL,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "misa"."inventory_detail_log" (
    "id" SERIAL NOT NULL,
    "session_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "page_index" INTEGER NOT NULL,
    "stock_id" UUID NOT NULL,
    "inventory_item_id" UUID NOT NULL,
    "history_details" JSONB NOT NULL,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_detail_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "misa"."loan_agreements" (
    "refid" UUID NOT NULL,
    "refno" VARCHAR(50),
    "credit_agreement_refid" UUID,
    "credit_agreement_refno" VARCHAR(100),
    "reftype" INTEGER,
    "account_object_id" UUID,
    "account_object_code" VARCHAR(50),
    "account_object_name" TEXT,
    "branch_id" UUID,
    "branch_name" TEXT,
    "disbursement_date" TIMESTAMPTZ(6),
    "due_date" TIMESTAMPTZ(6),
    "next_interest_payment_date" TIMESTAMPTZ(6),
    "next_principal_payment_date" TIMESTAMPTZ(6),
    "created_date" TIMESTAMPTZ(6),
    "modified_date" TIMESTAMPTZ(6),
    "currency_id" VARCHAR(10),
    "exchange_rate" DECIMAL(18,4) DEFAULT 1.0,
    "loan_value" DECIMAL(18,4) DEFAULT 0,
    "loan_value_exchange" DECIMAL(18,4) DEFAULT 0,
    "disbursed_value" DECIMAL(18,4) DEFAULT 0,
    "disbursed_value_exchange" DECIMAL(18,4) DEFAULT 0,
    "paid_principal" DECIMAL(18,4) DEFAULT 0,
    "paid_principal_exchange" DECIMAL(18,4) DEFAULT 0,
    "payable_interest" DECIMAL(18,4) DEFAULT 0,
    "paid_interest" DECIMAL(18,4) DEFAULT 0,
    "paid_interest_exchange" DECIMAL(18,4) DEFAULT 0,
    "current_credit_limit" DECIMAL(18,4) DEFAULT 0,
    "current_credit_limit_exchange" DECIMAL(18,4) DEFAULT 0,
    "principal_account" VARCHAR(20),
    "interest_account" VARCHAR(20),
    "beneficiary_account_id" UUID,
    "beneficiary_account" VARCHAR(100),
    "beneficiary_bank_name" TEXT,
    "interest_rate_now" DECIMAL(10,4) DEFAULT 0,
    "daily_interest_rate" DECIMAL(10,6) DEFAULT 0,
    "payment_period" INTEGER,
    "payment_period_unit" INTEGER,
    "payment_period_by_month" INTEGER,
    "payment_period_text" VARCHAR(100),
    "interest_rate_type" INTEGER,
    "adjusting_method" INTEGER,
    "principal_payment_period" INTEGER,
    "interest_payment_period" INTEGER,
    "payment_method" INTEGER,
    "disbursement_method" INTEGER,
    "loan_status" INTEGER,
    "is_facility_contract" BOOLEAN DEFAULT false,
    "facility_contract_type" INTEGER,
    "is_parent" BOOLEAN DEFAULT false,
    "is_bold" BOOLEAN DEFAULT false,
    "is_old" BOOLEAN DEFAULT false,
    "is_valid" BOOLEAN DEFAULT false,
    "state" INTEGER,
    "created_by" TEXT,
    "modified_by" TEXT,
    "edit_version" BIGINT,
    "auto_refno" BOOLEAN,
    "force_update" BOOLEAN,
    "is_created_from_old_db" BOOLEAN,

    CONSTRAINT "loan_agreements_pkey" PRIMARY KEY ("refid")
);

-- CreateTable
CREATE TABLE "misa"."pending_loan_agreements" (
    "refid" UUID NOT NULL,
    "refno" VARCHAR(50),
    "account_object_id" UUID,
    "account_object_code" VARCHAR(50),
    "account_object_name" TEXT,
    "description" TEXT,
    "branch_id" UUID,
    "branch_name" TEXT,
    "disbursement_date" TIMESTAMPTZ(6),
    "due_date" TIMESTAMPTZ(6),
    "next_interest_receiving_date" TIMESTAMPTZ(6),
    "next_principal_receiving_date" TIMESTAMPTZ(6),
    "lending_value" DECIMAL(18,4) DEFAULT 0,
    "exchange_rate" DECIMAL(18,4) DEFAULT 1.0,
    "lending_value_exchange" DECIMAL(18,4) DEFAULT 0,
    "disbursed_value" DECIMAL(18,4) DEFAULT 0,
    "disbursed_value_exchange" DECIMAL(18,4) DEFAULT 0,
    "principal_account" VARCHAR(20),
    "interest_account" VARCHAR(20),
    "disbursement_method" INTEGER,
    "received_principal" DECIMAL(18,4) DEFAULT 0,
    "received_principal_exchange" DECIMAL(18,4) DEFAULT 0,
    "receivable_interest" DECIMAL(18,4) DEFAULT 0,
    "received_interest" DECIMAL(18,4) DEFAULT 0,
    "received_interest_exchange" DECIMAL(18,4) DEFAULT 0,
    "current_credit_limit" DECIMAL(18,4) DEFAULT 0,
    "current_credit_limit_exchange" DECIMAL(18,4) DEFAULT 0,
    "receiving_period" INTEGER,
    "receiving_period_unit" INTEGER,
    "receiving_period_by_month" INTEGER,
    "receiving_period_text" VARCHAR(100),
    "receiving_method" INTEGER,
    "interest_rate_type" INTEGER,
    "daily_interest_rate" DECIMAL(10,6) DEFAULT 0,
    "adjusting_method" INTEGER,
    "principal_receiving_period" INTEGER,
    "interest_receiving_period" INTEGER,
    "currency_id" VARCHAR(10),
    "interest_rate_now" DECIMAL(10,4) DEFAULT 0,
    "is_facility_contract" BOOLEAN DEFAULT false,
    "facility_contract_type" INTEGER,
    "is_parent" BOOLEAN DEFAULT false,
    "is_bold" BOOLEAN DEFAULT false,
    "is_old" BOOLEAN DEFAULT false,
    "is_valid" BOOLEAN DEFAULT false,
    "lending_status" INTEGER,
    "excel_row_index" INTEGER,
    "state" INTEGER,
    "reftype" INTEGER,
    "created_date" TIMESTAMPTZ(6),
    "created_by" TEXT,
    "modified_date" TIMESTAMPTZ(6),
    "modified_by" TEXT,
    "edit_version" BIGINT,
    "auto_refno" BOOLEAN,
    "force_update" BOOLEAN,
    "is_created_from_old_db" BOOLEAN,

    CONSTRAINT "pending_loan_agreements_pkey" PRIMARY KEY ("refid")
);

-- CreateTable
CREATE TABLE "misa"."sales_detail_report" (
    "ref_detail_id" UUID NOT NULL,
    "session_id" UUID,
    "detail_id" INTEGER,
    "refid" UUID,
    "sync_session_id" UUID NOT NULL,
    "posted_date" TIMESTAMPTZ(6),
    "refdate" TIMESTAMPTZ(6),
    "inv_date" TIMESTAMPTZ(6),
    "expiry_date" TIMESTAMPTZ(6),
    "refno" TEXT,
    "inv_no" TEXT,
    "inv_series" TEXT,
    "journal_memo" TEXT,
    "description" TEXT,
    "account_object_id" UUID,
    "account_object_code" TEXT,
    "account_object_name" TEXT,
    "account_object_address" TEXT,
    "account_object_tax_code" TEXT,
    "account_object_group_list_code" TEXT,
    "account_object_group_list_name" TEXT,
    "tel" TEXT,
    "contact_name" TEXT,
    "contact_title" TEXT,
    "contact_mobile" TEXT,
    "contact_email" TEXT,
    "buyer" TEXT,
    "shipping_address" TEXT,
    "inventory_item_id" UUID,
    "inventory_item_code" TEXT,
    "inventory_item_name" TEXT,
    "inventory_item_category_code" TEXT,
    "inventory_item_category_name" TEXT,
    "inventory_item_source" TEXT,
    "inventory_item_description" TEXT,
    "is_promotion" BOOLEAN,
    "stock_code" TEXT,
    "stock_name" TEXT,
    "unit_name" TEXT,
    "main_unit_name" TEXT,
    "main_convert_rate" DECIMAL(19,4),
    "sale_quantity" DECIMAL(19,4),
    "main_quantity" DECIMAL(19,4),
    "promotion_sale_quantity" DECIMAL(19,4),
    "promotion_sale_main_quantity" DECIMAL(19,4),
    "promotion_return_quantity" DECIMAL(19,4),
    "promotion_return_main_quantity" DECIMAL(19,4),
    "not_promotion_sale_quantity" DECIMAL(19,4),
    "not_promotion_sale_main_quantity" DECIMAL(19,4),
    "not_promotion_return_quantity" DECIMAL(19,4),
    "not_promotion_return_main_quantity" DECIMAL(19,4),
    "return_quantity" DECIMAL(19,4),
    "return_main_quantity" DECIMAL(19,4),
    "panel_length_quantity" DECIMAL(19,4),
    "panel_height_quantity" DECIMAL(19,4),
    "panel_width_quantity" DECIMAL(19,4),
    "panel_radius_quantity" DECIMAL(19,4),
    "panel_quantity" DECIMAL(19,4),
    "exchange_rate" DECIMAL(19,4),
    "currency_id" TEXT,
    "unit_price_oc" DECIMAL(19,4),
    "unit_price" DECIMAL(19,4),
    "fixed_sale_unit_price" DECIMAL(19,4),
    "main_unit_price" DECIMAL(19,4),
    "cost_unit_price" DECIMAL(19,4),
    "sale_amount_oc" DECIMAL(19,4),
    "return_amount_oc" DECIMAL(19,4),
    "reduce_amount_oc" DECIMAL(19,4),
    "discount_amount_oc" DECIMAL(19,4),
    "item_discount_amount_oc" DECIMAL(19,4),
    "invoice_discount_amount_oc" DECIMAL(19,4),
    "vat_amount_oc" DECIMAL(19,4),
    "receipt_amount_oc" DECIMAL(19,4),
    "sale_amount" DECIMAL(19,4),
    "return_amount" DECIMAL(19,4),
    "reduce_amount" DECIMAL(19,4),
    "discount_amount" DECIMAL(19,4),
    "item_discount_amount" DECIMAL(19,4),
    "invoice_discount_amount" DECIMAL(19,4),
    "vat_amount" DECIMAL(19,4),
    "receipt_amount" DECIMAL(19,4),
    "cost_amount" DECIMAL(19,4),
    "export_tax_amount" DECIMAL(19,4),
    "item_discount_rate" DECIMAL(19,4),
    "invoice_discount_rate" DECIMAL(19,4),
    "debit_account" TEXT,
    "credit_account" TEXT,
    "cost_account" TEXT,
    "stock_account" TEXT,
    "discount_account" TEXT,
    "vat_account" TEXT,
    "export_tax_account" TEXT,
    "employee_code" TEXT,
    "employee_name" TEXT,
    "organization_unit_code" TEXT,
    "department_name" TEXT,
    "province_or_city" TEXT,
    "district" TEXT,
    "ward_or_commune" TEXT,
    "order_refno" TEXT,
    "contract_code" TEXT,
    "in_out_refno" TEXT,
    "other_sys_order_code" TEXT,
    "reftype" INTEGER,
    "reftype_name" TEXT,
    "branch_id" UUID,
    "branch_name" TEXT,
    "list_item_code" TEXT,
    "list_item_name" TEXT,
    "master_custom_field1" TEXT,
    "master_custom_field2" TEXT,
    "master_custom_field3" TEXT,
    "master_custom_field4" TEXT,
    "master_custom_field5" TEXT,
    "master_custom_field6" TEXT,
    "master_custom_field7" TEXT,
    "master_custom_field8" TEXT,
    "master_custom_field9" TEXT,
    "master_custom_field10" TEXT,
    "custom_field1" TEXT,
    "custom_field2" TEXT,
    "custom_field3" TEXT,
    "custom_field4" TEXT,
    "custom_field5" TEXT,
    "custom_field6" TEXT,
    "custom_field7" TEXT,
    "custom_field8" TEXT,
    "custom_field9" TEXT,
    "custom_field10" TEXT,
    "expand_field_customer1" TEXT,
    "expand_field_customer2" TEXT,
    "expand_field_customer3" TEXT,
    "expand_field_customer4" TEXT,
    "expand_field_customer5" TEXT,
    "expand_field1" TEXT,
    "expand_field2" TEXT,
    "expand_field3" TEXT,
    "expand_field4" TEXT,
    "expand_field5" TEXT,
    "channel" TEXT,
    "shop_name" TEXT,
    "shop_id" TEXT,
    "store_code" TEXT,
    "store_name" TEXT,
    "project_work_code" TEXT,
    "project_work_name" TEXT,
    "lot_no" TEXT,
    "license_plate" TEXT,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_detail_report_pkey" PRIMARY KEY ("ref_detail_id")
);

-- CreateTable
CREATE TABLE "misa"."accounts_payable_details" (
    "id" SERIAL NOT NULL,
    "account_object_code" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "page_index" INTEGER NOT NULL,
    "session_id" UUID NOT NULL,
    "data_details" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_payable_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "misa"."balance_sheet_quarterly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "item_index" INTEGER,
    "description" TEXT,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "category" INTEGER,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "quarter" INTEGER,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "balance_sheet_quarterly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."balance_sheet_yearly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "item_index" INTEGER,
    "description" TEXT,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "category" INTEGER,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "balance_sheet_yearly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."income_statement_quarterly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "quarter" INTEGER,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_statement_quarterly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."income_statement_yearly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_statement_yearly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."cash_flow_quarterly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR,
    "item_name" VARCHAR NOT NULL,
    "item_index" INTEGER,
    "description" TEXT,
    "category" INTEGER,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "formula" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "quarter" INTEGER,
    "year" INTEGER,
    "hidden" BOOLEAN,
    "is_bold" BOOLEAN,
    "is_italic" BOOLEAN,
    "sort_order" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "cash_flow_quarterly_fact_pkey" PRIMARY KEY ("time_id","item_name")
);

-- CreateTable
CREATE TABLE "misa"."cash_flow_yearly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR,
    "item_name" VARCHAR NOT NULL,
    "item_index" INTEGER,
    "description" TEXT,
    "category" INTEGER,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "formula" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "year" INTEGER,
    "hidden" BOOLEAN,
    "is_bold" BOOLEAN,
    "is_italic" BOOLEAN,
    "sort_order" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "cash_flow_yearly_fact_pkey" PRIMARY KEY ("time_id","item_name")
);

-- CreateTable
CREATE TABLE "misa"."budget_plan" (
    "session_id" UUID,
    "detail_id" INTEGER,
    "item_id" UUID,
    "item_code" VARCHAR(50) NOT NULL,
    "item_type" INTEGER,
    "item_name" VARCHAR(255),
    "item_name_english" VARCHAR(255),
    "item_name_chinese" VARCHAR(255),
    "item_name_korean" VARCHAR(255),
    "is_bold" BOOLEAN,
    "grade" INTEGER,
    "year" INTEGER NOT NULL,
    "total_plan_amount" DECIMAL(36,8),
    "m01_plan_amount" DECIMAL(36,8),
    "m02_plan_amount" DECIMAL(36,8),
    "m03_plan_amount" DECIMAL(36,8),
    "m04_plan_amount" DECIMAL(36,8),
    "m05_plan_amount" DECIMAL(36,8),
    "m06_plan_amount" DECIMAL(36,8),
    "m07_plan_amount" DECIMAL(36,8),
    "m08_plan_amount" DECIMAL(36,8),
    "m09_plan_amount" DECIMAL(36,8),
    "m10_plan_amount" DECIMAL(36,8),
    "m11_plan_amount" DECIMAL(36,8),
    "m12_plan_amount" DECIMAL(36,8),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_plan_pkey" PRIMARY KEY ("item_code","year")
);

-- CreateTable
CREATE TABLE "pancake"."conversation" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "customer_id" VARCHAR,
    "type" VARCHAR,
    "inserted_at" TIMESTAMP(6),
    "page_id" VARCHAR,
    "has_phone" BOOLEAN,
    "post_id" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assignee_histories" JSONB,
    "added_users" JSONB,
    "added_user_id" VARCHAR,
    "added_user_name" VARCHAR,
    "added_user_email" VARCHAR,
    "added_user_fb_id" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "last_sent_at" TIMESTAMP(6),
    "avatar_url" VARCHAR,
    "ad_ids" JSONB,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pancake"."conversation_page_customer" (
    "uuid" VARCHAR,
    "customer_id" VARCHAR NOT NULL,
    "conversation_id" VARCHAR NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_page_customer_pkey" PRIMARY KEY ("customer_id","conversation_id")
);

-- CreateTable
CREATE TABLE "pancake"."conversation_tag" (
    "uuid" VARCHAR,
    "conversation_id" VARCHAR NOT NULL,
    "page_id" VARCHAR,
    "customer_id" VARCHAR,
    "inserted_at" TIMESTAMP(6) NOT NULL,
    "post_id" VARCHAR,
    "has_phone" BOOLEAN,
    "tag_page_id" INTEGER NOT NULL,
    "tag_label" VARCHAR,
    "tag_description" VARCHAR,
    "action" VARCHAR NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_tag_pkey" PRIMARY KEY ("conversation_id","inserted_at","tag_page_id","action")
);

-- CreateTable
CREATE TABLE "pancake"."frappe_lead_conversation" (
    "conversation_id" VARCHAR NOT NULL,
    "frappe_name_id" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "frappe_lead_conversation_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "pancake"."frappe_lead_conversation_stag" (
    "conversation_id" VARCHAR NOT NULL,
    "frappe_name_id" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "frappe_lead_conversation_stag_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "pancake"."messages" (
    "id" VARCHAR NOT NULL,
    "message" VARCHAR,
    "type" VARCHAR,
    "seen" BOOLEAN,
    "show_info" BOOLEAN,
    "from_id" VARCHAR,
    "from_name" VARCHAR,
    "attachments" JSON,
    "inserted_at" TIMESTAMP(6),
    "page_id" VARCHAR,
    "conversation_id" VARCHAR,
    "has_phone" BOOLEAN,
    "is_removed" BOOLEAN,
    "can_hide" BOOLEAN,
    "comment_count" INTEGER,
    "like_count" INTEGER,
    "parent_id" VARCHAR,
    "is_hidden" BOOLEAN,
    "rich_message" VARCHAR,
    "edit_history" VARCHAR,
    "message_tags" JSON,
    "is_parent_hidden" BOOLEAN,
    "can_comment" BOOLEAN,
    "can_like" BOOLEAN,
    "can_remove" BOOLEAN,
    "can_reply_privately" BOOLEAN,
    "is_livestream_order" BOOLEAN,
    "is_parent" BOOLEAN,
    "phone_info" JSON,
    "original_message" VARCHAR,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pancake"."page" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "inserted_at" TIMESTAMP(6),
    "connected" BOOLEAN,
    "is_activated" BOOLEAN,
    "name" VARCHAR,
    "platform" VARCHAR,
    "timezone" VARCHAR,
    "settings" JSONB,
    "platform_extra_info" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "page_access_token" VARCHAR(255),
    "pos_shop_id" INTEGER,

    CONSTRAINT "page_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pancake"."page_customer" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "birthday" VARCHAR,
    "can_inbox" BOOLEAN,
    "customer_id" VARCHAR,
    "gender" VARCHAR,
    "inserted_at" TIMESTAMP(6),
    "lives_in" VARCHAR,
    "name" VARCHAR,
    "page_id" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "phone_numbers" JSONB,
    "normalized_phone_numbers" JSONB,
    "notes" JSONB,
    "phone" VARCHAR(255),
    "normalized_phone" VARCHAR(255),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "page_customer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pancake"."pancake_user" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR,
    "status" VARCHAR,
    "fb_id" VARCHAR,
    "page_permissions" JSONB,
    "status_round_robin" VARCHAR,
    "status_in_page" VARCHAR,
    "is_online" BOOLEAN,
    "database_updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6),

    CONSTRAINT "pancake_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pancake"."tag_page" (
    "page_id" VARCHAR NOT NULL,
    "id" INTEGER NOT NULL,
    "tag_label" VARCHAR,
    "description" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_page_pkey" PRIMARY KEY ("page_id","id")
);

-- CreateTable
CREATE TABLE "pancake"."users" (
    "id" TEXT NOT NULL,
    "enterprise_email" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pancake"."pancake_pos_order_syncs" (
    "haravan_order_id" BIGINT NOT NULL,
    "pancake_order_id" INTEGER,
    "shop_id" INTEGER,
    "ads_id" VARCHAR,
    "status" INTEGER,
    "synced_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pancake_pos_order_syncs_pkey" PRIMARY KEY ("haravan_order_id")
);

-- CreateTable
CREATE TABLE "payment"."manual_payments" (
    "uuid" UUID NOT NULL,
    "payment_type" VARCHAR(255),
    "branch" VARCHAR(255),
    "shipping_code" VARCHAR(255),
    "send_date" TIMESTAMP(6),
    "receive_date" TIMESTAMP(6),
    "created_date" TIMESTAMP(6),
    "updated_date" TIMESTAMP(6),
    "bank_account" VARCHAR(255),
    "bank_name" VARCHAR(255),
    "transfer_amount" DECIMAL(18,6),
    "transfer_note" TEXT,
    "haravan_order_id" INTEGER,
    "haravan_order_name" VARCHAR(255),
    "transfer_status" VARCHAR(255),
    "lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,
    "misa_synced_at" TIMESTAMP(6),
    "payment_entry_name" VARCHAR(255),
    "gateway" VARCHAR(255),
    "payment_references" JSONB,
    "refund_amount" DECIMAL(12,2),

    CONSTRAINT "manual_payments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "payment"."sepay_transaction" (
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
    "bank_transaction_name" VARCHAR(255),
    "app_id" INTEGER,
    "app_time" BIGINT,
    "app_user" VARCHAR(255),
    "embed_data" JSONB,
    "item" JSONB,
    "zp_trans_id" BIGINT,
    "server_time" BIGINT,
    "channel" INTEGER,
    "merchant_user_id" VARCHAR(255),
    "user_fee_amount" BIGINT,
    "discount_amount" BIGINT,
    "description" TEXT,

    CONSTRAINT "sepay_transaction_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "leads_custom_uuid_key" ON "ecom"."leads"("custom_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "products_unique_haravan_id" ON "ecom"."products"("haravan_product_id");

-- CreateIndex
CREATE INDEX "ix_ecom_qr_generator_id" ON "ecom"."qr_generator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_haravan_variant_id" ON "ecom"."variants"("haravan_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "wedding_rings_id_key" ON "ecom"."wedding_rings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_collection_product_id" ON "haravan"."collection_product"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_collection_product_uuid" ON "haravan"."collection_product"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_custom_collections_id" ON "haravan"."custom_collections"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_custom_collections_uuid" ON "haravan"."custom_collections"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_customers_id" ON "haravan"."customers"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_customers_uuid" ON "haravan"."customers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_fulfillments_id" ON "haravan"."fulfillments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_id" ON "haravan"."images"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_line_items_id" ON "haravan"."line_items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_orders_id" ON "haravan"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_products_id" ON "haravan"."products"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_products_uuid" ON "haravan"."products"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_id" ON "haravan"."purchase_receives"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_uuid" ON "haravan"."purchase_receives"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_items_id" ON "haravan"."purchase_receives_items"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_items_product_id" ON "haravan"."purchase_receives_items"("product_id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_items_purchase_receive_id" ON "haravan"."purchase_receives_items"("purchase_receive_id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_items_uuid" ON "haravan"."purchase_receives_items"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_refunds_id" ON "haravan"."refunds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_transactions_id" ON "haravan"."transactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_users_id" ON "haravan"."users"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_users_uuid" ON "haravan"."users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_variants_id" ON "haravan"."variants"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_variants_product_id" ON "haravan"."variants"("product_id");

-- CreateIndex
CREATE INDEX "ix_haravan_variants_uuid" ON "haravan"."variants"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_warehouse_inventories_id" ON "haravan"."warehouse_inventories"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_warehouse_inventories_uuid" ON "haravan"."warehouse_inventories"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "records_record_id_key" ON "larksuite"."records"("record_id");

-- CreateIndex
CREATE UNIQUE INDEX "buyback_exchange_approval_instances_instance_code_key" ON "larksuite"."buyback_exchange_approval_instances"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX "ix_larksuite_customer_appointments_id" ON "larksuite"."customer_appointments"("id");

-- CreateIndex
CREATE INDEX "ix_larksuite_customer_appointments_uuid" ON "larksuite"."customer_appointments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "departments_open_department_id_key" ON "larksuite"."departments"("open_department_id");

-- CreateIndex
CREATE UNIQUE INDEX "instances_serial_number_key" ON "larksuite"."instances"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "instances_instance_code_key" ON "larksuite"."instances"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX "ix_larksuite_warehouse_inventories_lark_id" ON "larksuite"."lark_warehouse_inventories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "instance_code_unique" ON "larksuite"."promotion_approval"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_open_id_key" ON "larksuite"."users"("open_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_union_id_key" ON "larksuite"."users"("union_id");

-- CreateIndex
CREATE INDEX "tech_tickets_ticket_id_idx" ON "larksuite"."tech_tickets"("ticket_id");

-- CreateIndex
CREATE INDEX "tech_tickets_ticket_priority_idx" ON "larksuite"."tech_tickets"("ticket_priority");

-- CreateIndex
CREATE INDEX "tech_tickets_ticket_status_idx" ON "larksuite"."tech_tickets"("ticket_status");

-- CreateIndex
CREATE INDEX "tech_tickets_created_time_idx" ON "larksuite"."tech_tickets"("created_time");

-- CreateIndex
CREATE INDEX "tech_tickets_updated_time_idx" ON "larksuite"."tech_tickets"("updated_time");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "misa"."users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_haravan_id_key" ON "misa"."users"("haravan_id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_inventory_items_sku" ON "misa"."inventory_items"("sku");

-- CreateIndex
CREATE INDEX "ix_misa_inventory_items_uuid" ON "misa"."inventory_items"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_items_id" ON "misa"."items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_voucher_details_ref_detail_id_key" ON "misa"."purchase_voucher_details"("ref_detail_id");

-- CreateIndex
CREATE INDEX "ix_misa_purchase_voucher_details_refid" ON "misa"."purchase_voucher_details"("refid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_purchase_vouchers_refid" ON "misa"."purchase_vouchers"("refid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_customers_haravan_id" ON "misa"."customers"("haravan_id");

-- CreateIndex
CREATE INDEX "ix_misa_customers_phone" ON "misa"."customers"("phone");

-- CreateIndex
CREATE INDEX "ix_misa_customers_email" ON "misa"."customers"("email");

-- CreateIndex
CREATE INDEX "journal_entries_year_idx" ON "misa"."journal_entries"("year");

-- CreateIndex
CREATE INDEX "journal_entries_data_details_idx" ON "misa"."journal_entries" USING GIN ("data_details");

-- CreateIndex
CREATE UNIQUE INDEX "unique_year_journal_entry" ON "misa"."journal_entries"("year", "page_index", "refno");

-- CreateIndex
CREATE INDEX "inventory_detail_log_year_stock_id_idx" ON "misa"."inventory_detail_log"("year", "stock_id");

-- CreateIndex
CREATE INDEX "inventory_detail_log_year_inventory_item_id_idx" ON "misa"."inventory_detail_log"("year", "inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_year_stock_item_log" ON "misa"."inventory_detail_log"("year", "page_index", "stock_id", "inventory_item_id");

-- CreateIndex
CREATE INDEX "idx_loan_refno" ON "misa"."loan_agreements"("refno");

-- CreateIndex
CREATE INDEX "idx_pending_loan_refno" ON "misa"."pending_loan_agreements"("refno");

-- CreateIndex
CREATE INDEX "idx_sales_posted_date" ON "misa"."sales_detail_report"("posted_date");

-- CreateIndex
CREATE INDEX "idx_sales_refdate" ON "misa"."sales_detail_report"("refdate");

-- CreateIndex
CREATE INDEX "idx_sales_employee_code" ON "misa"."sales_detail_report"("employee_code");

-- CreateIndex
CREATE INDEX "idx_sales_inventory_item_code" ON "misa"."sales_detail_report"("inventory_item_code");

-- CreateIndex
CREATE INDEX "idx_sales_account_object_code" ON "misa"."sales_detail_report"("account_object_code");

-- CreateIndex
CREATE INDEX "accounts_payable_details_year_idx" ON "misa"."accounts_payable_details"("year");

-- CreateIndex
CREATE INDEX "accounts_payable_details_data_details_idx" ON "misa"."accounts_payable_details" USING GIN ("data_details");

-- CreateIndex
CREATE UNIQUE INDEX "unique_year_payable_account_page" ON "misa"."accounts_payable_details"("year", "account_object_code", "page_index");

-- CreateIndex
CREATE INDEX "budget_plan_session_id_idx" ON "misa"."budget_plan"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pancake_conversation_id" ON "pancake"."conversation"("id");

-- CreateIndex
CREATE INDEX "idx_conv_sync_filter" ON "pancake"."conversation"("type", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_conversation_page_id" ON "pancake"."conversation"("page_id");

-- CreateIndex
CREATE INDEX "idx_id" ON "pancake"."conversation"("id");

-- CreateIndex
CREATE INDEX "ix_pancake_conversation_uuid" ON "pancake"."conversation"("uuid");

-- CreateIndex
CREATE INDEX "conversation_ad_ids_idx" ON "pancake"."conversation" USING GIN ("ad_ids");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_id_page_idx" ON "pancake"."conversation"("id", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_page_customer_uuid_key" ON "pancake"."conversation_page_customer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_tag_uuid_key" ON "pancake"."conversation_tag"("uuid");

-- CreateIndex
CREATE INDEX "idx_tag_sync_window" ON "pancake"."conversation_tag"("conversation_id", "tag_page_id", "database_updated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ix_pancake_page_id" ON "pancake"."page"("id");

-- CreateIndex
CREATE INDEX "idx_page_id" ON "pancake"."page"("id");

-- CreateIndex
CREATE INDEX "ix_pancake_page_uuid" ON "pancake"."page"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pancake_page_customer_id" ON "pancake"."page_customer"("id");

-- CreateIndex
CREATE INDEX "idx_customer_sync_lookup" ON "pancake"."page_customer"("customer_id", "updated_at");

-- CreateIndex
CREATE INDEX "ix_pancake_page_customer_uuid" ON "pancake"."page_customer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_enterprise_email_key" ON "pancake"."users"("enterprise_email");

-- CreateIndex
CREATE UNIQUE INDEX "manual_payments_lark_record_id_key" ON "payment"."manual_payments"("lark_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "manual_payments_payment_entry_name_key" ON "payment"."manual_payments"("payment_entry_name");

-- CreateIndex
CREATE INDEX "manual_payments_uuid_idx" ON "payment"."manual_payments"("uuid");

-- AddForeignKey
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_haravan_user_fkey" FOREIGN KEY ("user_id") REFERENCES "haravan"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "misa"."users" ADD CONSTRAINT "misa_user_user_fkey" FOREIGN KEY ("haravan_id") REFERENCES "haravan"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment"."manual_payments" ADD CONSTRAINT "manual_payments_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

