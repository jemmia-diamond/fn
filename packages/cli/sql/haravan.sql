/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : haravan

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:48
*/

CREATE SCHEMA IF NOT EXISTS "haravan";

-- ----------------------------
-- Sequence structure for test_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "haravan"."test_id_seq";
CREATE SEQUENCE "haravan"."test_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "haravan"."test_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for tests_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "haravan"."tests_id_seq";
CREATE SEQUENCE "haravan"."tests_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "haravan"."tests_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for collection_product
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."collection_product";
CREATE TABLE "haravan"."collection_product" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "collection_id" int8,
  "created_at" timestamp(6),
  "featured" bool,
  "position" int4,
  "product_id" int8,
  "sort_value" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."collection_product" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for custom_collections
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."custom_collections";
CREATE TABLE "haravan"."custom_collections" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "body_html" text COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "image" jsonb,
  "published" bool,
  "published_at" timestamp(6),
  "published_scope" varchar COLLATE "pg_catalog"."default",
  "sort_order" varchar COLLATE "pg_catalog"."default",
  "template_suffix" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "products_count" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."custom_collections" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."customers";
CREATE TABLE "haravan"."customers" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "accepts_marketing" bool,
  "default_address" jsonb,
  "addresses" jsonb,
  "address_address1" varchar COLLATE "pg_catalog"."default",
  "address_address2" varchar COLLATE "pg_catalog"."default",
  "address_city" varchar COLLATE "pg_catalog"."default",
  "address_company" varchar COLLATE "pg_catalog"."default",
  "address_country" varchar COLLATE "pg_catalog"."default",
  "address_country_code" varchar COLLATE "pg_catalog"."default",
  "address_id" int8,
  "address_first_name" varchar COLLATE "pg_catalog"."default",
  "address_last_name" varchar COLLATE "pg_catalog"."default",
  "address_phone" varchar COLLATE "pg_catalog"."default",
  "address_province" varchar COLLATE "pg_catalog"."default",
  "address_province_code" varchar COLLATE "pg_catalog"."default",
  "address_zip" varchar COLLATE "pg_catalog"."default",
  "address_name" varchar COLLATE "pg_catalog"."default",
  "address_default" bool,
  "address_district" varchar COLLATE "pg_catalog"."default",
  "address_district_code" varchar COLLATE "pg_catalog"."default",
  "address_ward" varchar COLLATE "pg_catalog"."default",
  "address_ward_code" varchar COLLATE "pg_catalog"."default",
  "email" varchar COLLATE "pg_catalog"."default",
  "phone" varchar COLLATE "pg_catalog"."default",
  "first_name" varchar COLLATE "pg_catalog"."default",
  "last_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "multipass_identifier" bool,
  "last_order_id" int8,
  "last_order_name" varchar COLLATE "pg_catalog"."default",
  "published" bool,
  "note" varchar COLLATE "pg_catalog"."default",
  "orders_count" int4,
  "state" varchar COLLATE "pg_catalog"."default",
  "tags" varchar COLLATE "pg_catalog"."default",
  "total_spent" numeric(36,8),
  "total_paid" numeric(36,8),
  "verified_email" bool,
  "group_name" varchar COLLATE "pg_catalog"."default",
  "birthday" timestamp(6),
  "gender" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."customers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for fulfillments
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."fulfillments";
CREATE TABLE "haravan"."fulfillments" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "order_id" int8,
  "status" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "tracking_company" varchar COLLATE "pg_catalog"."default",
  "tracking_company_code" varchar COLLATE "pg_catalog"."default",
  "tracking_numbers" jsonb,
  "tracking_number" varchar COLLATE "pg_catalog"."default",
  "tracking_url" varchar COLLATE "pg_catalog"."default",
  "tracking_urls" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."fulfillments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for images
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."images";
CREATE TABLE "haravan"."images" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8 NOT NULL,
  "product_id" int4 NOT NULL,
  "src" varchar COLLATE "pg_catalog"."default",
  "position" int4,
  "filename" varchar COLLATE "pg_catalog"."default",
  "variant_ids" jsonb,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."images" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for inventory_logs
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."inventory_logs";
CREATE TABLE "haravan"."inventory_logs" (
  "id" int8 NOT NULL,
  "storeid" int8,
  "typeid" int8,
  "locid" int8,
  "refid" int8,
  "reflineid" int8,
  "refnumber" varchar COLLATE "pg_catalog"."default",
  "productid" int8,
  "variantid" int8,
  "qty_onhand" numeric,
  "qty_commited" numeric,
  "qty_incoming" numeric,
  "last_qty_onhand" numeric,
  "last_qty_onhand_loc" numeric,
  "last_qty_onhand_lot" numeric,
  "last_qty_commited" numeric,
  "last_qty_commited_loc" numeric,
  "last_macostamount" numeric,
  "costamount" numeric,
  "trandate" timestamp(6),
  "createddate" timestamp(6),
  "createduser" int8,
  "createdusername" varchar COLLATE "pg_catalog"."default",
  "locationname" varchar COLLATE "pg_catalog"."default",
  "trannumber" varchar COLLATE "pg_catalog"."default",
  "lotno" varchar COLLATE "pg_catalog"."default",
  "lotexpiredate" timestamp(6),
  "sku" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "producttypename" varchar COLLATE "pg_catalog"."default",
  "productvendorname" varchar COLLATE "pg_catalog"."default",
  "productname" varchar COLLATE "pg_catalog"."default",
  "optionvalue" varchar COLLATE "pg_catalog"."default",
  "reasonid" int8,
  "varianttitle" varchar COLLATE "pg_catalog"."default",
  "typename" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "haravan"."inventory_logs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for line_items
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."line_items";
CREATE TABLE "haravan"."line_items" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "order_id" int4,
  "fulfillable_quantity" int4,
  "fulfillment_service" varchar COLLATE "pg_catalog"."default",
  "fulfillment_status" varchar COLLATE "pg_catalog"."default",
  "grams" float8,
  "price" numeric(36,8),
  "price_original" numeric(36,8),
  "price_promotion" numeric(36,8),
  "product_id" int8,
  "quantity" int4,
  "requires_shipping" bool,
  "sku" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "variant_id" int8,
  "variant_title" varchar COLLATE "pg_catalog"."default",
  "vendor" varchar COLLATE "pg_catalog"."default",
  "type" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "gift_card" bool,
  "taxable" bool,
  "tax_lines" jsonb,
  "product_exists" bool,
  "barcode" varchar COLLATE "pg_catalog"."default",
  "properties" jsonb,
  "total_discount" numeric(36,8),
  "applied_discounts" jsonb,
  "image" jsonb,
  "not_allow_promotion" bool,
  "ma_cost_amount" float8,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."line_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."orders";
CREATE TABLE "haravan"."orders" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "billing_address_id" int8,
  "billing_address_address1" varchar COLLATE "pg_catalog"."default",
  "billing_address_address2" varchar COLLATE "pg_catalog"."default",
  "billing_address_city" varchar COLLATE "pg_catalog"."default",
  "billing_address_company" varchar COLLATE "pg_catalog"."default",
  "billing_address_country" varchar COLLATE "pg_catalog"."default",
  "billing_address_first_name" varchar COLLATE "pg_catalog"."default",
  "billing_address_last_name" varchar COLLATE "pg_catalog"."default",
  "billing_address_phone" varchar COLLATE "pg_catalog"."default",
  "billing_address_province" varchar COLLATE "pg_catalog"."default",
  "billing_address_zip" varchar COLLATE "pg_catalog"."default",
  "billing_address_name" varchar COLLATE "pg_catalog"."default",
  "billing_address_province_code" varchar COLLATE "pg_catalog"."default",
  "billing_address_country_code" varchar COLLATE "pg_catalog"."default",
  "billing_address_default" bool,
  "billing_address_district" varchar COLLATE "pg_catalog"."default",
  "billing_address_district_code" varchar COLLATE "pg_catalog"."default",
  "billing_address_ward" varchar COLLATE "pg_catalog"."default",
  "billing_address_ward_code" varchar COLLATE "pg_catalog"."default",
  "browser_ip" varchar COLLATE "pg_catalog"."default",
  "buyer_accepts_marketing" bool,
  "cancel_reason" varchar COLLATE "pg_catalog"."default",
  "cancelled_at" timestamp(6),
  "cart_token" varchar COLLATE "pg_catalog"."default",
  "checkout_token" varchar COLLATE "pg_catalog"."default",
  "client_details_accept_language" varchar COLLATE "pg_catalog"."default",
  "client_details_browser_height" int8,
  "client_details_browser_width" int8,
  "client_details_session_hash" varchar COLLATE "pg_catalog"."default",
  "client_details_user_agent" varchar COLLATE "pg_catalog"."default",
  "client_details_browser_ip" varchar COLLATE "pg_catalog"."default",
  "closed_at" timestamp(6),
  "created_at" timestamp(6),
  "currency" varchar COLLATE "pg_catalog"."default",
  "customer_id" int8,
  "customer_email" varchar COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "customer_first_name" varchar COLLATE "pg_catalog"."default",
  "customer_last_name" varchar COLLATE "pg_catalog"."default",
  "customer_multipass_identifier" varchar COLLATE "pg_catalog"."default",
  "customer_last_order_id" int8,
  "customer_last_order_name" varchar COLLATE "pg_catalog"."default",
  "customer_note" text COLLATE "pg_catalog"."default",
  "customer_order_count" int4,
  "customer_state" varchar COLLATE "pg_catalog"."default",
  "customer_tags" varchar COLLATE "pg_catalog"."default",
  "customer_total_spent" numeric(36,8),
  "customer_updated_at" timestamp(6),
  "customer_verified_email" bool,
  "customer_send_email_invite" bool,
  "customer_send_email_welcome" bool,
  "customer_password" varchar COLLATE "pg_catalog"."default",
  "customer_password_confirmation" varchar COLLATE "pg_catalog"."default",
  "customer_group_name" varchar COLLATE "pg_catalog"."default",
  "customer_birthday" varchar COLLATE "pg_catalog"."default",
  "customer_gender" varchar COLLATE "pg_catalog"."default",
  "customer_last_order_date" timestamp(6),
  "customer_default_address_id" int8,
  "customer_default_address_address1" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_address2" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_city" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_company" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_country" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_province" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_first_name" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_last_name" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_phone" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_province_code" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_country_code" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_default" bool,
  "customer_default_address_district" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_district_code" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_ward" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_ward_code" varchar COLLATE "pg_catalog"."default",
  "discount_codes" jsonb,
  "email" varchar COLLATE "pg_catalog"."default",
  "financial_status" varchar COLLATE "pg_catalog"."default",
  "fulfillment_status" varchar COLLATE "pg_catalog"."default",
  "tags" varchar COLLATE "pg_catalog"."default",
  "gateway" varchar COLLATE "pg_catalog"."default",
  "gateway_code" varchar COLLATE "pg_catalog"."default",
  "landing_site" varchar COLLATE "pg_catalog"."default",
  "landing_site_ref" varchar COLLATE "pg_catalog"."default",
  "source" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "number" int4,
  "order_number" varchar COLLATE "pg_catalog"."default",
  "processing_method" varchar COLLATE "pg_catalog"."default",
  "shipping_address_address1" varchar COLLATE "pg_catalog"."default",
  "shipping_address_address2" varchar COLLATE "pg_catalog"."default",
  "shipping_address_city" varchar COLLATE "pg_catalog"."default",
  "shipping_address_company" varchar COLLATE "pg_catalog"."default",
  "shipping_address_country" varchar COLLATE "pg_catalog"."default",
  "shipping_address_first_name" varchar COLLATE "pg_catalog"."default",
  "shipping_address_last_name" varchar COLLATE "pg_catalog"."default",
  "shipping_address_latitude" float8,
  "shipping_address_longitude" float8,
  "shipping_address_phone" varchar COLLATE "pg_catalog"."default",
  "shipping_address_province" varchar COLLATE "pg_catalog"."default",
  "shipping_address_zip" varchar COLLATE "pg_catalog"."default",
  "shipping_address_name" varchar COLLATE "pg_catalog"."default",
  "shipping_address_province_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_country_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_district_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_district" varchar COLLATE "pg_catalog"."default",
  "shipping_address_ward_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_ward" varchar COLLATE "pg_catalog"."default",
  "shipping_lines" jsonb,
  "source_name" varchar COLLATE "pg_catalog"."default",
  "subtotal_price" numeric(36,8),
  "tax_lines" varchar COLLATE "pg_catalog"."default",
  "taxes_included" bool,
  "token" varchar COLLATE "pg_catalog"."default",
  "total_discounts" numeric(36,8),
  "total_line_items_price" numeric(36,8),
  "total_price" numeric(36,8),
  "total_tax" numeric(36,8),
  "total_weight" float8,
  "updated_at" timestamp(6),
  "note_attributes" jsonb,
  "confirmed_at" timestamp(6),
  "closed_status" varchar COLLATE "pg_catalog"."default",
  "cancelled_status" varchar COLLATE "pg_catalog"."default",
  "confirmed_status" varchar COLLATE "pg_catalog"."default",
  "assigned_location_id" int8,
  "assigned_location_name" varchar COLLATE "pg_catalog"."default",
  "assigned_location_at" timestamp(6),
  "exported_confirm_at" timestamp(6),
  "user_id" int8,
  "device_id" int8,
  "location_id" int8,
  "location_name" varchar COLLATE "pg_catalog"."default",
  "ref_order_id" int8,
  "ref_order_date" timestamp(6),
  "ref_order_number" varchar COLLATE "pg_catalog"."default",
  "utm_source" varchar COLLATE "pg_catalog"."default",
  "utm_medium" varchar COLLATE "pg_catalog"."default",
  "utm_campaign" varchar COLLATE "pg_catalog"."default",
  "utm_term" varchar COLLATE "pg_catalog"."default",
  "utm_content" varchar COLLATE "pg_catalog"."default",
  "payment_url" varchar COLLATE "pg_catalog"."default",
  "contact_email" varchar COLLATE "pg_catalog"."default",
  "order_processing_status" varchar COLLATE "pg_catalog"."default",
  "prev_order_id" int8,
  "prev_order_number" varchar COLLATE "pg_catalog"."default",
  "prev_order_date" timestamp(6),
  "redeem_model" varchar COLLATE "pg_catalog"."default",
  "confirm_user" int8,
  "risk_level" varchar COLLATE "pg_catalog"."default",
  "discount_applications" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."orders" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."products";
CREATE TABLE "haravan"."products" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "published_at" timestamp(6),
  "published_scope" varchar COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "product_type" varchar COLLATE "pg_catalog"."default",
  "images" jsonb,
  "tags" varchar COLLATE "pg_catalog"."default",
  "template_suffix" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "variants" jsonb,
  "only_hide_from_list" bool,
  "not_allow_promotion" bool,
  "options" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_receives
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."purchase_receives";
CREATE TABLE "haravan"."purchase_receives" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "receive_number" varchar COLLATE "pg_catalog"."default",
  "supplier" jsonb,
  "supplier_id" int8,
  "supplier_name" varchar COLLATE "pg_catalog"."default",
  "location" jsonb,
  "location_id" int8,
  "location_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "received_at" timestamp(6),
  "notes" text COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "total" numeric(36,8),
  "total_cost" numeric(36,8),
  "tags" varchar COLLATE "pg_catalog"."default",
  "ref_purchase_order_id" varchar COLLATE "pg_catalog"."default",
  "ref_number" varchar COLLATE "pg_catalog"."default",
  "line_items" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."purchase_receives" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_receives_items
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."purchase_receives_items";
CREATE TABLE "haravan"."purchase_receives_items" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "purchase_receive_id" int8,
  "purchase_receive_number" varchar COLLATE "pg_catalog"."default",
  "product_id" int8,
  "product_name" varchar COLLATE "pg_catalog"."default",
  "product_variant_id" int8,
  "variant_title" varchar COLLATE "pg_catalog"."default",
  "sku" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "original_cost" numeric(36,8),
  "discount_amount" numeric(36,8),
  "cost" numeric(36,8),
  "product_quantity" int4,
  "total_cost" numeric(36,8),
  "variant_unit" jsonb,
  "lots" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."purchase_receives_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for refunds
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."refunds";
CREATE TABLE "haravan"."refunds" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "order_id" int8,
  "created_at" timestamp(6),
  "note" varchar COLLATE "pg_catalog"."default",
  "refund_line_items" jsonb,
  "restock" bool,
  "user_id" int8,
  "location_id" int8,
  "transactions" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."refunds" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."transactions";
CREATE TABLE "haravan"."transactions" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "order_id" int8,
  "amount" numeric(36,8),
  "authorization" varchar(50) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "device_id" int8,
  "gateway" varchar(100) COLLATE "pg_catalog"."default",
  "kind" varchar(10) COLLATE "pg_catalog"."default",
  "receipt" varchar(255) COLLATE "pg_catalog"."default",
  "status" varchar(10) COLLATE "pg_catalog"."default",
  "test" bool,
  "user_id" int8,
  "location_id" int8,
  "currency" varchar COLLATE "pg_catalog"."default",
  "is_cod_gateway" bool,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."transactions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."users";
CREATE TABLE "haravan"."users" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "email" varchar COLLATE "pg_catalog"."default",
  "first_name" varchar COLLATE "pg_catalog"."default",
  "last_name" varchar COLLATE "pg_catalog"."default",
  "phone" varchar COLLATE "pg_catalog"."default",
  "account_owner" bool,
  "bio" text COLLATE "pg_catalog"."default",
  "im" text COLLATE "pg_catalog"."default",
  "receive_announcements" int4,
  "url" text COLLATE "pg_catalog"."default",
  "user_type" varchar COLLATE "pg_catalog"."default",
  "permissions" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variants
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."variants";
CREATE TABLE "haravan"."variants" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "product_id" int8,
  "published_scope" varchar COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "product_type" varchar COLLATE "pg_catalog"."default",
  "template_suffix" varchar COLLATE "pg_catalog"."default",
  "product_title" varchar COLLATE "pg_catalog"."default",
  "product_vendor" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "compare_at_price" numeric(36,8),
  "created_at" timestamp(6),
  "fulfillment_service" varchar COLLATE "pg_catalog"."default",
  "grams" int4,
  "inventory_management" varchar COLLATE "pg_catalog"."default",
  "inventory_policy" varchar COLLATE "pg_catalog"."default",
  "inventory_quantity" int4,
  "position" int4,
  "price" numeric(36,8),
  "requires_shipping" bool,
  "sku" varchar COLLATE "pg_catalog"."default",
  "taxable" bool,
  "title" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "image_id" int8,
  "option1" varchar COLLATE "pg_catalog"."default",
  "option2" varchar COLLATE "pg_catalog"."default",
  "option3" varchar COLLATE "pg_catalog"."default",
  "qty_onhand" int4,
  "qty_commited" int4,
  "qty_available" int4,
  "qty_incoming" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for warehouse_inventories
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."warehouse_inventories";
CREATE TABLE "haravan"."warehouse_inventories" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "loc_id" int8,
  "product_id" int8,
  "variant_id" int8,
  "qty_onhand" int8,
  "qty_committed" int8,
  "qty_available" int8,
  "qty_incoming" int8,
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."warehouse_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for warehouses
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."warehouses";
CREATE TABLE "haravan"."warehouses" (
  "id" int4 NOT NULL,
  "name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "haravan"."warehouses" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for get_real_created_at
-- ----------------------------
DROP FUNCTION IF EXISTS "haravan"."get_real_created_at"("order_id_input" int4);
CREATE FUNCTION "haravan"."get_real_created_at"("order_id_input" int4)
  RETURNS "pg_catalog"."timestamp" AS $BODY$
DECLARE
    current_order_id INT := order_id_input;
    current_created_at TIMESTAMP;
    ref_order_id INT;
BEGIN
    -- Lấy thông tin của đơn hàng hiện tại
    SELECT ho.created_at, ho.ref_order_id INTO current_created_at, ref_order_id
    FROM haravan.orders as ho 
    WHERE ho.id = current_order_id;

    -- Vòng lặp: tiếp tục truy ngược khi có ref_order_id
    WHILE ref_order_id != 0  LOOP
        -- Cập nhật current_order_id để kiểm tra bản ghi trước đó
        current_order_id := ref_order_id;

        -- Lấy thông tin của bản ghi trước đó (cha)
        SELECT ho.created_at, ho.ref_order_id INTO current_created_at, ref_order_id
        FROM haravan.orders as ho
        WHERE ho.id = current_order_id;  -- Chỉnh sửa ở đây để lấy bản ghi trước đó
    END LOOP;

    -- Trả về created_at của bản ghi gốc
    RETURN current_created_at;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "haravan"."get_real_created_at"("order_id_input" int4) OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"haravan"."test_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"haravan"."tests_id_seq"', 1, false);

-- ----------------------------
-- Indexes structure for table collection_product
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_collection_product_id" ON "haravan"."collection_product" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_collection_product_uuid" ON "haravan"."collection_product" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table collection_product
-- ----------------------------
ALTER TABLE "haravan"."collection_product" ADD CONSTRAINT "collection_product_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table custom_collections
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_custom_collections_id" ON "haravan"."custom_collections" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_custom_collections_uuid" ON "haravan"."custom_collections" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table custom_collections
-- ----------------------------
ALTER TABLE "haravan"."custom_collections" ADD CONSTRAINT "custom_collections_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table customers
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_customers_id" ON "haravan"."customers" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_customers_uuid" ON "haravan"."customers" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table customers
-- ----------------------------
ALTER TABLE "haravan"."customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table fulfillments
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_fulfillments_id" ON "haravan"."fulfillments" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table fulfillments
-- ----------------------------
ALTER TABLE "haravan"."fulfillments" ADD CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Uniques structure for table images
-- ----------------------------
ALTER TABLE "haravan"."images" ADD CONSTRAINT "unique_id" UNIQUE ("id");

-- ----------------------------
-- Primary Key structure for table images
-- ----------------------------
ALTER TABLE "haravan"."images" ADD CONSTRAINT "images_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table inventory_logs
-- ----------------------------
ALTER TABLE "haravan"."inventory_logs" ADD CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table line_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_line_items_id" ON "haravan"."line_items" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table line_items
-- ----------------------------
ALTER TABLE "haravan"."line_items" ADD CONSTRAINT "line_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table orders
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_orders_id" ON "haravan"."orders" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table orders
-- ----------------------------
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table products
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_products_id" ON "haravan"."products" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_products_uuid" ON "haravan"."products" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table products
-- ----------------------------
ALTER TABLE "haravan"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_receives
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_id" ON "haravan"."purchase_receives" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_uuid" ON "haravan"."purchase_receives" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_receives
-- ----------------------------
ALTER TABLE "haravan"."purchase_receives" ADD CONSTRAINT "purchase_receives_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_receives_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_items_id" ON "haravan"."purchase_receives_items" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_items_product_id" ON "haravan"."purchase_receives_items" USING btree (
  "product_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_items_purchase_receive_id" ON "haravan"."purchase_receives_items" USING btree (
  "purchase_receive_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_items_uuid" ON "haravan"."purchase_receives_items" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_receives_items
-- ----------------------------
ALTER TABLE "haravan"."purchase_receives_items" ADD CONSTRAINT "purchase_receives_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table refunds
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_refunds_id" ON "haravan"."refunds" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table refunds
-- ----------------------------
ALTER TABLE "haravan"."refunds" ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table transactions
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_transactions_id" ON "haravan"."transactions" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table transactions
-- ----------------------------
ALTER TABLE "haravan"."transactions" ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_users_id" ON "haravan"."users" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_users_uuid" ON "haravan"."users" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "haravan"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table variants
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_variants_id" ON "haravan"."variants" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_variants_product_id" ON "haravan"."variants" USING btree (
  "product_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_variants_uuid" ON "haravan"."variants" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table variants
-- ----------------------------
ALTER TABLE "haravan"."variants" ADD CONSTRAINT "variants_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table warehouse_inventories
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_warehouse_inventories_id" ON "haravan"."warehouse_inventories" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_warehouse_inventories_uuid" ON "haravan"."warehouse_inventories" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table warehouse_inventories
-- ----------------------------
ALTER TABLE "haravan"."warehouse_inventories" ADD CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table warehouses
-- ----------------------------
ALTER TABLE "haravan"."warehouses" ADD CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id");
