-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecom";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "haravan";

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
    "haravan_order_id" BIGINT,
    "haravan_order_total_price" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "is_deleted" BOOLEAN,
    "qr_url" TEXT,
    "lark_record_id" VARCHAR(255),
    "all_lark_record_id" VARCHAR(255),

    CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "haravan"."orders" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
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

-- CreateIndex
CREATE UNIQUE INDEX "qr_generator_haravan_order_id_key" ON "ecom"."qr_generator"("haravan_order_id");

-- CreateIndex
CREATE INDEX "ix_ecom_qr_generator_id" ON "ecom"."qr_generator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_customers_id" ON "haravan"."customers"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_customers_uuid" ON "haravan"."customers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_orders_id" ON "haravan"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_users_id" ON "haravan"."users"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_users_uuid" ON "haravan"."users"("uuid");

-- AddForeignKey
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_misa_user_fkey" FOREIGN KEY ("user_id") REFERENCES "misa"."users"("haravan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_haravan_user_fkey" FOREIGN KEY ("user_id") REFERENCES "haravan"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
