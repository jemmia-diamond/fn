/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : supplychain

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:24:01
*/

CREATE SCHEMA IF NOT EXISTS "supplychain";

-- ----------------------------
-- Sequence structure for design_melee_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "supplychain"."design_melee_id_seq";
CREATE SEQUENCE "supplychain"."design_melee_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "supplychain"."design_melee_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for buyback_exchange_approval_instances_detail
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."buyback_exchange_approval_instances_detail";
CREATE TABLE "supplychain"."buyback_exchange_approval_instances_detail" (
  "request_no" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "approval_process" text COLLATE "pg_catalog"."default",
  "completed_at" timestamp(6),
  "initiator_department" text COLLATE "pg_catalog"."default",
  "current_assignee" text COLLATE "pg_catalog"."default",
  "approval_steps" text COLLATE "pg_catalog"."default",
  "request_type" text COLLATE "pg_catalog"."default",
  "customer_code" text COLLATE "pg_catalog"."default",
  "receiving_processing_location" text COLLATE "pg_catalog"."default",
  "customer_handover_datetime" timestamp(6),
  "source_id" text COLLATE "pg_catalog"."default",
  "total_transfer_amount" numeric(18,2),
  "transfer_information" text COLLATE "pg_catalog"."default",
  "non_invoice_purchase_list" text COLLATE "pg_catalog"."default",
  "goods_inspection_certificate" text COLLATE "pg_catalog"."default",
  "other_attachments" text COLLATE "pg_catalog"."default",
  "other_information" text COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "requester_email" text COLLATE "pg_catalog"."default",
  "requester_en_name" text COLLATE "pg_catalog"."default",
  "requester_id" text COLLATE "pg_catalog"."default",
  "requester_name" text COLLATE "pg_catalog"."default",
  "record_id" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."buyback_exchange_approval_instances_detail" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for capture_variants
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."capture_variants";
CREATE TABLE "supplychain"."capture_variants" (
  "nocodb_variant_id" int4 NOT NULL,
  "nocodb_product_id" int4,
  "barcode" text COLLATE "pg_catalog"."default",
  "published_scope" text COLLATE "pg_catalog"."default",
  "price" numeric,
  "capture_date" timestamp(6) DEFAULT now()
)
;
ALTER TABLE "supplychain"."capture_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_melee
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."design_melee";
CREATE TABLE "supplychain"."design_melee" (
  "id" int4 NOT NULL DEFAULT nextval('"supplychain".design_melee_id_seq'::regclass),
  "design_id" int4 NOT NULL,
  "shape" text COLLATE "pg_catalog"."default",
  "length" numeric,
  "width" numeric,
  "melee_number" int4,
  "database_created_at" timestamp(6) DEFAULT now(),
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."design_melee" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for designs
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."designs";
CREATE TABLE "supplychain"."designs" (
  "id" int4 NOT NULL,
  "code" text COLLATE "pg_catalog"."default",
  "erp_code" text COLLATE "pg_catalog"."default",
  "backup_code" text COLLATE "pg_catalog"."default",
  "design_type" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "design_year" text COLLATE "pg_catalog"."default",
  "design_seq" int8,
  "usage_status" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "folder_summary" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "link_render" text COLLATE "pg_catalog"."default",
  "link_retouch" text COLLATE "pg_catalog"."default",
  "ring_band_type" text COLLATE "pg_catalog"."default",
  "ring_band_style" text COLLATE "pg_catalog"."default",
  "ring_head_style" text COLLATE "pg_catalog"."default",
  "jewelry_rd_style" text COLLATE "pg_catalog"."default",
  "shape_of_main_stone" text COLLATE "pg_catalog"."default",
  "product_line" text COLLATE "pg_catalog"."default",
  "social_post" bool,
  "website" bool,
  "RENDER" bool,
  "RETOUCH" bool,
  "gold_weight" numeric,
  "main_stone" text COLLATE "pg_catalog"."default",
  "stone_quantity" text COLLATE "pg_catalog"."default",
  "stone_weight" text COLLATE "pg_catalog"."default",
  "diamond_holder" text COLLATE "pg_catalog"."default",
  "source" text COLLATE "pg_catalog"."default",
  "variant_number" int8,
  "collections_id" int4,
  "image_4view" text COLLATE "pg_catalog"."default",
  "image_render" text COLLATE "pg_catalog"."default",
  "image_retouch" text COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6),
  "collection_name" text COLLATE "pg_catalog"."default",
  "auto_create_folder" bool,
  "design_code" text COLLATE "pg_catalog"."default",
  "ecom_showed" bool,
  "tag" text COLLATE "pg_catalog"."default",
  "stock_locations" text COLLATE "pg_catalog"."default",
  "wedding_ring_id" int4,
  "reference_code" text COLLATE "pg_catalog"."default",
  "design_status" text COLLATE "pg_catalog"."default",
  "erp_code_duplicated" bool,
  "max_seq" int4,
  "last_synced_render" text COLLATE "pg_catalog"."default",
  "last_synced_4view" text COLLATE "pg_catalog"."default",
  "melee_type" text COLLATE "pg_catalog"."default",
  "database_updated_link_4view_at" timestamp(6),
  "get_melee_status" text COLLATE "pg_catalog"."default" DEFAULT 'Pending'::text,
  "four_view_status" bool,
  "melee_type_update_at" timestamp(6),
  "is_create_auto_variant" bool DEFAULT false
)
;
ALTER TABLE "supplychain"."designs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_attribute
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_attribute";
CREATE TABLE "supplychain"."diamond_attribute" (
  "report_no" text COLLATE "pg_catalog"."default" NOT NULL,
  "report_type" text COLLATE "pg_catalog"."default",
  "report_date" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default",
  "measurements" text COLLATE "pg_catalog"."default",
  "weight" text COLLATE "pg_catalog"."default",
  "color_grade" text COLLATE "pg_catalog"."default",
  "clarity_grade" text COLLATE "pg_catalog"."default",
  "cut_grade" text COLLATE "pg_catalog"."default",
  "depth" text COLLATE "pg_catalog"."default",
  "table" text COLLATE "pg_catalog"."default",
  "crown_angle" text COLLATE "pg_catalog"."default",
  "crown_height" text COLLATE "pg_catalog"."default",
  "pavilion_angle" text COLLATE "pg_catalog"."default",
  "pavilion_depth" text COLLATE "pg_catalog"."default",
  "star_length" text COLLATE "pg_catalog"."default",
  "lower_half" text COLLATE "pg_catalog"."default",
  "girdle" text COLLATE "pg_catalog"."default",
  "culet" text COLLATE "pg_catalog"."default",
  "polish" text COLLATE "pg_catalog"."default",
  "symmetry" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "clarity_characteristics" text COLLATE "pg_catalog"."default",
  "inscription" text COLLATE "pg_catalog"."default",
  "encrypted_report_no" text COLLATE "pg_catalog"."default",
  "simple_encrypted_report_no" text COLLATE "pg_catalog"."default",
  "is_pdf_available" bool,
  "pdf_url" text COLLATE "pg_catalog"."default",
  "propimg" text COLLATE "pg_catalog"."default",
  "digital_card" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."diamond_attribute" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_purchase
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_purchase";
CREATE TABLE "supplychain"."diamond_purchase" (
  "report_no" text COLLATE "pg_catalog"."default" NOT NULL,
  "rapnet_price_usd" numeric,
  "rapnet_price_usd_source" text COLLATE "pg_catalog"."default",
  "original_diamond_vnd_cost" numeric,
  "tax_cost_vnd" numeric,
  "delivery_cost_vnd" numeric
)
;
ALTER TABLE "supplychain"."diamond_purchase" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_quotation
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_quotation";
CREATE TABLE "supplychain"."diamond_quotation" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "ticket_sent_time" timestamp(6),
  "sender_system" text COLLATE "pg_catalog"."default",
  "stage" text COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "attachment" jsonb,
  "gia_code" text COLLATE "pg_catalog"."default",
  "gia_issue_date" date,
  "cut" text COLLATE "pg_catalog"."default",
  "stone_size" text COLLATE "pg_catalog"."default",
  "weight" numeric,
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "cut_quality" text COLLATE "pg_catalog"."default",
  "polish_level" text COLLATE "pg_catalog"."default",
  "symmetry" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "clarity_characteristics" text COLLATE "pg_catalog"."default",
  "engraving_code" text COLLATE "pg_catalog"."default",
  "rapnet_price_per_carat" numeric,
  "rapnet_price" numeric,
  "rapnet_discount_price" numeric,
  "purchase_exchange_policy" text COLLATE "pg_catalog"."default",
  "bonus" numeric,
  "final_price_for_sale" numeric,
  "quote_status" text COLLATE "pg_catalog"."default",
  "diamond_specs" text COLLATE "pg_catalog"."default",
  "quote_time" timestamp(6),
  "priority_level" text COLLATE "pg_catalog"."default",
  "customer_phone_hidden" text COLLATE "pg_catalog"."default",
  "customer_name_hidden" text COLLATE "pg_catalog"."default",
  "customer_code" text COLLATE "pg_catalog"."default",
  "customer_phone" text COLLATE "pg_catalog"."default",
  "exchange_rate" numeric,
  "expected_bln" numeric,
  "base_discount" numeric,
  "followers" text COLLATE "pg_catalog"."default",
  "text_status" text COLLATE "pg_catalog"."default",
  "handler" text COLLATE "pg_catalog"."default",
  "ticket_status" text COLLATE "pg_catalog"."default",
  "sender" text COLLATE "pg_catalog"."default",
  "ticket_type" text COLLATE "pg_catalog"."default",
  "customer_description" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "customer_name" text COLLATE "pg_catalog"."default",
  "sender_direct_manager" text COLLATE "pg_catalog"."default",
  "expected_arrival_date" date,
  "order_code" text COLLATE "pg_catalog"."default",
  "customer_name_update" text COLLATE "pg_catalog"."default",
  "customer_phone_update" text COLLATE "pg_catalog"."default",
  "desired_delivery_date" date,
  "customer_appointment_date" date,
  "accountant" text COLLATE "pg_catalog"."default",
  "supplier_confirm_date" date,
  "sale_note" text COLLATE "pg_catalog"."default",
  "expected_delivery_date" date,
  "main_sale" text COLLATE "pg_catalog"."default",
  "order_status" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."diamond_quotation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_ticket_quotation
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_ticket_quotation";
CREATE TABLE "supplychain"."diamond_ticket_quotation" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "customer_name_hidden" text COLLATE "pg_catalog"."default",
  "accountant" text COLLATE "pg_catalog"."default",
  "customer_code" text COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "priority_level" text COLLATE "pg_catalog"."default",
  "quotation_date" timestamp(6),
  "ticket_sent_at" timestamp(6),
  "sender" text COLLATE "pg_catalog"."default",
  "sender_manager" text COLLATE "pg_catalog"."default",
  "sender_system" text COLLATE "pg_catalog"."default",
  "followers" text COLLATE "pg_catalog"."default",
  "handler" text COLLATE "pg_catalog"."default",
  "ticket_status" text COLLATE "pg_catalog"."default",
  "exchange_rate" numeric,
  "attachment" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "rapnet_price" numeric,
  "rapnet_discount" numeric,
  "rapnet_price_per_carat" numeric,
  "text_status" text COLLATE "pg_catalog"."default",
  "weight" numeric,
  "expected_profit_margin" numeric,
  "base_discount" numeric,
  "purchase_exchange_policy" text COLLATE "pg_catalog"."default",
  "cut_quality" text COLLATE "pg_catalog"."default",
  "final_price_for_sale" numeric,
  "cut" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "stone_size" text COLLATE "pg_catalog"."default",
  "gia_code" text COLLATE "pg_catalog"."default",
  "engraving_code" text COLLATE "pg_catalog"."default",
  "polish_level" text COLLATE "pg_catalog"."default",
  "gia_cert_issued_at" date,
  "color" text COLLATE "pg_catalog"."default",
  "bonus" text COLLATE "pg_catalog"."default",
  "clarity_characteristics" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "symmetry" text COLLATE "pg_catalog"."default",
  "ticket_type" text COLLATE "pg_catalog"."default",
  "expected_arrival_date" timestamp(6),
  "customer_phone_hidden" text COLLATE "pg_catalog"."default",
  "order_code" text COLLATE "pg_catalog"."default",
  "supplier_confirm_date" timestamp(6),
  "customer_appointment_date" timestamp(6),
  "expected_delivery_date" timestamp(6),
  "customer_phone_update" text COLLATE "pg_catalog"."default",
  "customer_name_update" text COLLATE "pg_catalog"."default",
  "desired_delivery_date" timestamp(6),
  "sale_note" text COLLATE "pg_catalog"."default",
  "main_sale" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."diamond_ticket_quotation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for gold_prices
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."gold_prices";
CREATE TABLE "supplychain"."gold_prices" (
  "timestamp" numeric NOT NULL,
  "metal" text COLLATE "pg_catalog"."default",
  "currency" text COLLATE "pg_catalog"."default",
  "exchange" text COLLATE "pg_catalog"."default",
  "symbol" text COLLATE "pg_catalog"."default",
  "prev_close_price" float8,
  "open_price" float8,
  "low_price" float8,
  "high_price" float8,
  "open_time" int4,
  "price" float8,
  "ch" float8,
  "chp" float8,
  "ask" float8,
  "bid" float8,
  "price_gram_24k" float8,
  "price_gram_22k" float8,
  "price_gram_21k" float8,
  "price_gram_20k" float8,
  "price_gram_18k" float8,
  "price_gram_16k" float8,
  "price_gram_14k" float8,
  "price_gram_10k" float8
)
;
ALTER TABLE "supplychain"."gold_prices" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for history_price_ticket
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."history_price_ticket";
CREATE TABLE "supplychain"."history_price_ticket" (
  "ticketname" float8,
  "status" text COLLATE "pg_catalog"."default",
  "date" timestamp(6),
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6),
  "larkrecordid" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."history_price_ticket" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_design_items
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_design_items";
CREATE TABLE "supplychain"."jewelry_design_items" (
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "design_code" text COLLATE "pg_catalog"."default",
  "sku" text COLLATE "pg_catalog"."default",
  "descriptive_attribute" text COLLATE "pg_catalog"."default",
  "material" text COLLATE "pg_catalog"."default",
  "material_applique" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default",
  "color" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "ring_size_type" text COLLATE "pg_catalog"."default",
  "edge_size_1" text COLLATE "pg_catalog"."default",
  "edge_size_2" text COLLATE "pg_catalog"."default",
  "storage_size_type" text COLLATE "pg_catalog"."default",
  "serial_quantity" int4,
  "link_3dm" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "folder_link" text COLLATE "pg_catalog"."default",
  "status_checked_3dm_4view" bool,
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "record_id_hash" text COLLATE "pg_catalog"."default" GENERATED ALWAYS AS (
md5(record_id)
) STORED
)
;
ALTER TABLE "supplychain"."jewelry_design_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_price
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_price";
CREATE TABLE "supplychain"."jewelry_price" (
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "design_id" int8,
  "design_code" text COLLATE "pg_catalog"."default",
  "is_check_gold_melee" bool,
  "is_price_confirm" bool,
  "material" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric(12,3),
  "melee_number" int4,
  "diamond_cost" numeric(14,0),
  "gold_cost" numeric(14,0),
  "labour_cost" numeric(14,0),
  "bracklet_cost" numeric(14,0),
  "cogs_percent" numeric(5,4),
  "discount" numeric(5,4),
  "proposal_price" numeric(14,0),
  "final_price" numeric(14,0),
  "tag" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."jewelry_price" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_purchase_order_line_items
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_purchase_order_line_items";
CREATE TABLE "supplychain"."jewelry_purchase_order_line_items" (
  "order_product_id" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "sku_id" text COLLATE "pg_catalog"."default",
  "expected_factory_delivery_date" timestamp(6),
  "expected_customer_delivery_date" timestamp(6),
  "order_quantity" int4,
  "cogs" float8,
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "stage" text COLLATE "pg_catalog"."default",
  "supplier_gold_cost_per_unit" int8,
  "total_melee_cost" float8,
  "melee_description" text COLLATE "pg_catalog"."default",
  "serial_number" text COLLATE "pg_catalog"."default",
  "supplier_melee_description" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric,
  "labour_cost" float8,
  "melee_weight" numeric,
  "gold_cost" float8,
  "hash_sku_id" text COLLATE "pg_catalog"."default",
  "hash_order_product_id" text COLLATE "pg_catalog"."default",
  "received_date" timestamp(6),
  "product_error" bool,
  "db_update_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."jewelry_purchase_order_line_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_purchase_orders
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_purchase_orders";
CREATE TABLE "supplychain"."jewelry_purchase_orders" (
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "order_product_id" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "ticket_name" text COLLATE "pg_catalog"."default",
  "linked_descriptive_id" text COLLATE "pg_catalog"."default",
  "order_type" text COLLATE "pg_catalog"."default",
  "order_date" timestamptz(6),
  "expected_factory_delivery_date" timestamptz(6),
  "expected_customer_delivery_date" timestamptz(6),
  "order_file_url" text COLLATE "pg_catalog"."default",
  "customer_name" text COLLATE "pg_catalog"."default",
  "order_quantity" int4,
  "supplier_name" text COLLATE "pg_catalog"."default",
  "cogs" numeric,
  "status" text COLLATE "pg_catalog"."default",
  "linked_descriptive_id_hash" text COLLATE "pg_catalog"."default" GENERATED ALWAYS AS (
md5(linked_descriptive_id)
) STORED,
  "record_id_hash" text COLLATE "pg_catalog"."default" GENERATED ALWAYS AS (
md5(record_id)
) STORED,
  "urgent_level" text COLLATE "pg_catalog"."default",
  "haravan_order_code" text COLLATE "pg_catalog"."default",
  "db_update_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."jewelry_purchase_orders" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for mapping_cogs
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."mapping_cogs";
CREATE TABLE "supplychain"."mapping_cogs" (
  "haravan_product_id" int8,
  "haravan_variant_id" float8,
  "sku" text COLLATE "pg_catalog"."default",
  "avg_cogs" float8
)
;
ALTER TABLE "supplychain"."mapping_cogs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for pnj_products
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."pnj_products";
CREATE TABLE "supplychain"."pnj_products" (
  "id" int8 NOT NULL,
  "product_link" text COLLATE "pg_catalog"."default" NOT NULL,
  "category_current" text COLLATE "pg_catalog"."default",
  "sku" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default",
  "brand" text COLLATE "pg_catalog"."default",
  "price" int8,
  "title" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."pnj_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for ticket_price
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."ticket_price";
CREATE TABLE "supplychain"."ticket_price" (
  "recordid" text COLLATE "pg_catalog"."default" NOT NULL,
  "ticketname" float8,
  "sender" text COLLATE "pg_catalog"."default",
  "customername" text COLLATE "pg_catalog"."default",
  "phonenumber" text COLLATE "pg_catalog"."default",
  "producttype" text COLLATE "pg_catalog"."default",
  "material" text COLLATE "pg_catalog"."default",
  "color" text COLLATE "pg_catalog"."default",
  "ringsizetype" text COLLATE "pg_catalog"."default",
  "ringsize" text COLLATE "pg_catalog"."default",
  "productgroup" text COLLATE "pg_catalog"."default",
  "tickettype" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default",
  "followers" text COLLATE "pg_catalog"."default",
  "actor" text COLLATE "pg_catalog"."default",
  "image" text COLLATE "pg_catalog"."default",
  "storagesize" text COLLATE "pg_catalog"."default",
  "prioritylevel" text COLLATE "pg_catalog"."default",
  "deadline" timestamp(6),
  "priorityreason" text COLLATE "pg_catalog"."default",
  "policy" text COLLATE "pg_catalog"."default",
  "descriptive" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6),
  "estimateprice" float8,
  "larkbasecreateat" timestamp(6),
  "typeofdesigncode" text COLLATE "pg_catalog"."default",
  "recordlink" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."ticket_price" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for classify_melee_type
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."classify_melee_type"();
CREATE FUNCTION "supplychain"."classify_melee_type"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
  total_qty INTEGER;
  non_melee_qty INTEGER;
  real_melee_qty INTEGER;
BEGIN
  IF NEW.get_melee_status = 'Success' THEN

    -- 1. Tổng số lượng tất cả melee (mọi hình, kích thước)
    SELECT COALESCE(SUM(melee_number), 0)
    INTO total_qty
    FROM supplychain.design_melee
    WHERE design_id = NEW.id;

    -- 2. Số lượng kim cương "lớn" (Round và length >= 3.6)
    SELECT COALESCE(SUM(melee_number), 0)
    INTO non_melee_qty
    FROM supplychain.design_melee
    WHERE design_id = NEW.id
      AND shape = 'Round'
      AND length >= 3.6;

    -- 3. Tính số viên tấm thực sự
    real_melee_qty := total_qty - non_melee_qty;

    -- 4. Phân loại melee_type
    UPDATE supplychain.designs
    SET melee_type = CASE
                      WHEN real_melee_qty = 0 THEN 'No melee'
                      ELSE 'Has melee'
                    END
    WHERE id = NEW.id;

  ELSE
    -- Nếu status không phải 'Success', reset melee_type về NULL
    UPDATE supplychain.designs
    SET melee_type = NULL
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."classify_melee_type"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for generate_md5_hash
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."generate_md5_hash"("input_value" text);
CREATE FUNCTION "supplychain"."generate_md5_hash"("input_value" text)
  RETURNS "pg_catalog"."text" AS $BODY$
BEGIN
    RETURN MD5(input_value);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."generate_md5_hash"("input_value" text) OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_created_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_created_at"();
CREATE FUNCTION "supplychain"."set_created_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.database_created_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_created_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_database_created_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_database_created_at"();
CREATE FUNCTION "supplychain"."set_database_created_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    NEW.database_created_at := NOW();
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_database_created_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_database_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_database_updated_at"();
CREATE FUNCTION "supplychain"."set_database_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    NEW.database_updated_at := NOW();
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_database_updated_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_updated_at"();
CREATE FUNCTION "supplychain"."set_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Cập nhật theo múi giờ UTC+7 (Asia/Ho_Chi_Minh)
    NEW.db_update_at := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '7 hours');
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_updated_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for sync_designs_from_workplace
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."sync_designs_from_workplace"();
CREATE FUNCTION "supplychain"."sync_designs_from_workplace"()
  RETURNS "pg_catalog"."text" AS $BODY$
DECLARE
    row_count INTEGER;
BEGIN
    WITH upsert AS (
        INSERT INTO supplychain.designs (
            id, code, erp_code, backup_code, design_type, gender, design_year, design_seq,
            usage_status, link_4view, folder_summary, link_3d, link_render, link_retouch,
            ring_band_type, ring_band_style, ring_head_style, jewelry_rd_style,
            shape_of_main_stone, product_line, social_post, website, "RENDER", "RETOUCH",
            gold_weight, main_stone, stone_quantity, stone_weight, diamond_holder, source,
            variant_number, collections_id, image_4view, image_render, image_retouch,
            created_by, updated_by, database_created_at, database_updated_at,
            collection_name, auto_create_folder, design_code, ecom_showed, tag,
            stock_locations, wedding_ring_id, reference_code, design_status,
            erp_code_duplicated, max_seq, last_synced_render, last_synced_4view
        )
        SELECT
            id, code, erp_code, backup_code, design_type, gender, design_year, design_seq,
            usage_status, link_4view, folder_summary, link_3d, link_render, link_retouch,
            ring_band_type, ring_band_style, ring_head_style, jewelry_rd_style,
            shape_of_main_stone, product_line, social_post, website, "RENDER", "RETOUCH",
            gold_weight, main_stone, stone_quantity, stone_weight, diamond_holder, source,
            variant_number, collections_id, image_4view, image_render, image_retouch,
            created_by, updated_by, database_created_at, database_updated_at,
            collection_name, auto_create_folder, design_code, ecom_showed, tag,
            stock_locations, wedding_ring_id, reference_code, design_status,
            erp_code_duplicated, max_seq, last_synced_render, last_synced_4view
        FROM workplace.designs
        WHERE database_updated_at >= now() - interval '5 hours'
        ON CONFLICT (id) DO UPDATE SET
            code = EXCLUDED.code,
            erp_code = EXCLUDED.erp_code,
            backup_code = EXCLUDED.backup_code,
            design_type = EXCLUDED.design_type,
            gender = EXCLUDED.gender,
            design_year = EXCLUDED.design_year,
            design_seq = EXCLUDED.design_seq,
            usage_status = EXCLUDED.usage_status,
            link_4view = EXCLUDED.link_4view,
            folder_summary = EXCLUDED.folder_summary,
            link_3d = EXCLUDED.link_3d,
            link_render = EXCLUDED.link_render,
            link_retouch = EXCLUDED.link_retouch,
            ring_band_type = EXCLUDED.ring_band_type,
            ring_band_style = EXCLUDED.ring_band_style,
            ring_head_style = EXCLUDED.ring_head_style,
            jewelry_rd_style = EXCLUDED.jewelry_rd_style,
            shape_of_main_stone = EXCLUDED.shape_of_main_stone,
            product_line = EXCLUDED.product_line,
            social_post = EXCLUDED.social_post,
            website = EXCLUDED.website,
            "RENDER" = EXCLUDED."RENDER",
            "RETOUCH" = EXCLUDED."RETOUCH",
            gold_weight = EXCLUDED.gold_weight,
            main_stone = EXCLUDED.main_stone,
            stone_quantity = EXCLUDED.stone_quantity,
            stone_weight = EXCLUDED.stone_weight,
            diamond_holder = EXCLUDED.diamond_holder,
            source = EXCLUDED.source,
            variant_number = EXCLUDED.variant_number,
            collections_id = EXCLUDED.collections_id,
            image_4view = EXCLUDED.image_4view,
            image_render = EXCLUDED.image_render,
            image_retouch = EXCLUDED.image_retouch,
            created_by = EXCLUDED.created_by,
            updated_by = EXCLUDED.updated_by,
            database_created_at = EXCLUDED.database_created_at,
            database_updated_at = EXCLUDED.database_updated_at,
            collection_name = EXCLUDED.collection_name,
            auto_create_folder = EXCLUDED.auto_create_folder,
            design_code = EXCLUDED.design_code,
            ecom_showed = EXCLUDED.ecom_showed,
            tag = EXCLUDED.tag,
            stock_locations = EXCLUDED.stock_locations,
            wedding_ring_id = EXCLUDED.wedding_ring_id,
            reference_code = EXCLUDED.reference_code,
            design_status = EXCLUDED.design_status,
            erp_code_duplicated = EXCLUDED.erp_code_duplicated,
            max_seq = EXCLUDED.max_seq,
            last_synced_render = EXCLUDED.last_synced_render,
            last_synced_4view = EXCLUDED.last_synced_4view
        RETURNING id
    )
    SELECT COUNT(*) INTO row_count FROM upsert;

    -- Trả về chuỗi thông báo
    RETURN format('✅ Đã update được %s dòng dữ liệu.', row_count);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."sync_designs_from_workplace"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for trg_update_melee_type_timestamp
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."trg_update_melee_type_timestamp"();
CREATE FUNCTION "supplychain"."trg_update_melee_type_timestamp"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Kiểm tra nếu melee_type bị thay đổi
    IF NEW.melee_type IS DISTINCT FROM OLD.melee_type THEN
        NEW.melee_type_update_at := NOW();
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."trg_update_melee_type_timestamp"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_hash_order_product_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_hash_order_product_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_hash_order_product_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Kiểm tra nếu cột order_product_id thay đổi
  IF NEW.order_product_id IS DISTINCT FROM OLD.order_product_id THEN
    NEW.hash_order_product_id := generate_md5_hash(NEW.order_product_id);  -- Tính hash cho order_product_id
  END IF;

  -- Trả về dòng đã được thay đổi
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_hash_order_product_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_hash_record_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_hash_record_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_hash_record_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Kiểm tra nếu cột sku_id thay đổi
  IF NEW.record_id IS DISTINCT FROM OLD.record_id THEN
    NEW.hash_record_id := generate_md5_hash(NEW.record_id);  -- Tính hash cho sku_id
  END IF;

  -- Trả về dòng đã được thay đổi
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_hash_record_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_line_items_hash_order_product_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Trường hợp INSERT: OLD là NULL, nên ta chỉ cần check NEW
  IF TG_OP = 'INSERT' THEN
    IF NEW.order_product_id IS NOT NULL THEN
      NEW.hash_order_product_id := supplychain.generate_md5_hash(NEW.order_product_id);
    END IF;

  -- Trường hợp UPDATE: so sánh NEW vs OLD
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.order_product_id IS DISTINCT FROM OLD.order_product_id THEN
      NEW.hash_order_product_id := supplychain.generate_md5_hash(NEW.order_product_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_line_items_hash_sku_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Trường hợp INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.sku_id IS NOT NULL THEN
      NEW.hash_sku_id := supplychain.generate_md5_hash(NEW.sku_id);
    END IF;

  -- Trường hợp UPDATE
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.sku_id IS DISTINCT FROM OLD.sku_id THEN
      NEW.hash_sku_id := supplychain.generate_md5_hash(NEW.sku_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_link_4view_timestamp
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_link_4view_timestamp"();
CREATE FUNCTION "supplychain"."update_link_4view_timestamp"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Chỉ cập nhật khi giá trị link_4view thay đổi từ NULL sang KHÔNG NULL
  IF NEW.link_4view IS NOT NULL AND OLD.link_4view IS NULL THEN
    NEW.database_updated_link_4view_at := now();
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_link_4view_timestamp"() OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for warehouse_scan_status
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."warehouse_scan_status";
CREATE VIEW "supplychain"."warehouse_scan_status" AS  WITH scan_flags AS (
         SELECT i.warehouse_id,
            bool_or(i.created_at::date = CURRENT_DATE) AS has_today,
            bool_or(i.created_at::date = (CURRENT_DATE - '1 day'::interval)) AS has_yesterday
           FROM inventory.inventory_check_sheets i
          WHERE i.created_at::date = ANY (ARRAY[CURRENT_DATE::timestamp without time zone, CURRENT_DATE - '1 day'::interval])
          GROUP BY i.warehouse_id
        ), inventory_sum AS (
         SELECT wi.loc_id AS warehouse_id,
            sum(wi.qty_onhand) AS current_inventory_number
           FROM haravan.warehouse_inventories wi
          GROUP BY wi.loc_id
        ), person_in_charge_map AS (
         SELECT t.warehouse_id,
            t.person_in_charge
           FROM ( VALUES (3421435,'@Nguyễn Thu Trà, @Nguyễn Hữu Phúc'::text), (1110168,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1582708,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1587596,'Quản lý chung'::text), (1590860,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1592770,'@Ngô Thuỵ Kiều Trinh, @Nguyễn Phương Thảo'::text), (1592774,'@Ngô Thuỵ Kiều Trinh, @Nguyễn Phương Thảo'::text), (1592776,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1592778,'@Trần Thị Hoài Thu'::text), (1592780,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1593276,'@Nguyễn Minh Đang'::text), (1594118,'@Trần Thị Hoài Thu'::text), (1599764,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1601006,'@Trần Thị Hoài Thu'::text), (1601632,'Anh @Hoàng Xuân Thọ'::text), (1619562,'@Phan Thị Huế'::text), (1710693,'@Châu Cẩm Tiên'::text), (1710694,'@Nguyễn Minh Đang'::text), (1710695,'@Nguyễn Minh Đang'::text), (1710696,'@Nguyễn Minh Đang'::text), (1715010,'Chưa rõ'::text), (3355305,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1599762,'Chưa rõ'::text)) t(warehouse_id, person_in_charge)
        )
 SELECT w.name AS warehouse_name,
    COALESCE(pic.person_in_charge, 'Chưa rõ'::text) AS person_in_charge,
        CASE
            WHEN COALESCE(sf.has_today, false) THEN 'X'::text
            ELSE ''::text
        END AS scan_today,
        CASE
            WHEN COALESCE(sf.has_yesterday, false) THEN 'X'::text
            ELSE ''::text
        END AS scan_yesterday,
    COALESCE(to_char(inv.current_inventory_number, 'FM999,999,999'::text), '0'::text) AS current_inventory_number
   FROM haravan.warehouses w
     LEFT JOIN scan_flags sf ON sf.warehouse_id = w.id::numeric
     LEFT JOIN inventory_sum inv ON inv.warehouse_id = w.id
     LEFT JOIN person_in_charge_map pic ON pic.warehouse_id = w.id
  ORDER BY w.name;
ALTER TABLE "supplychain"."warehouse_scan_status" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for negative_inventory_variants
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."negative_inventory_variants";
CREATE VIEW "supplychain"."negative_inventory_variants" AS  SELECT w.name AS warehouse_name,
    v.product_type,
    v.title,
    wi.qty_onhand,
    concat('https://jemmiavn.myharavan.com/admin/products/', v.product_id, '/variants/', v.id) AS product_variant_link
   FROM haravan.variants v
     LEFT JOIN haravan.warehouse_inventories wi ON wi.variant_id = v.id
     LEFT JOIN haravan.warehouses w ON w.id = wi.loc_id
  WHERE wi.qty_onhand < 0 AND w.name <> '[ALL] KHO XUẤT'::text
  GROUP BY w.name, v.product_type, v.product_id, v.id, v.title, wi.qty_onhand
  ORDER BY w.name;
ALTER TABLE "supplychain"."negative_inventory_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for jewelry_variants
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."jewelry_variants";
CREATE VIEW "supplychain"."jewelry_variants" AS  SELECT p.id AS nocodb_product_id,
    p.haravan_product_id,
    v.id AS nocodb_variant_id,
    v.haravan_variant_id,
    p.design_id,
    d.design_code,
    wp.haravan_product_type,
    v.fineness,
    v.barcode,
    v.category,
    v.applique_material,
    v.size_type,
    v.ring_size,
    p.published_scope,
    (d.design_code || '_'::text) || v.fineness AS design_code_material,
    v.price AS price_original,
        CASE
            WHEN wp.haravan_product_type ~~* '%Bông Tai%'::text THEN v.price * 2::numeric
            ELSE v.price
        END AS price_adjusted,
    hv.qty_onhand
   FROM workplace.products p
     LEFT JOIN workplace.variants v ON v.product_id = p.id
     LEFT JOIN workplace.designs d ON p.design_id = d.id
     LEFT JOIN workplace.products wp ON wp.id = v.product_id
     LEFT JOIN haravan.variants hv ON v.haravan_variant_id = hv.id
  WHERE p.haravan_product_id IS NOT NULL AND v.haravan_variant_id IS NOT NULL;
ALTER TABLE "supplychain"."jewelry_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for today_rfid_scans
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."today_rfid_scans";
CREATE VIEW "supplychain"."today_rfid_scans" AS  SELECT vs.serial_number,
    vs.last_rfid_scan_time,
    vs.stock_at,
    v.barcode,
    vs.printing_batch,
    p.haravan_product_type,
        CASE
            WHEN v.applique_material = 'Không'::text THEN concat(p.haravan_product_type, ' ', 'Không Đính Á', ' ', v.fineness)
            ELSE concat(p.haravan_product_type, ' ', replace(v.applique_material, 'Trang Sức '::text, ''::text), ' ', v.fineness)
        END AS product_name,
    d.design_code,
    v.fineness,
    v.material_color,
    v.ring_size,
    vs.storage_size_type,
    vs.storage_size_1,
    vs.storage_size_2,
    v.sku,
    vs.gold_weight,
    vs.diamond_weight,
    vs.quantity,
        CASE
            WHEN vs.printing_batch ~~* '%Tem tạm%'::text THEN 0::numeric
            ELSE floor(v.price)
        END AS price,
    vs.encode_barcode,
    vs.final_encoded_barcode,
    ('['::text || vs.old_barcode) || ']'::text AS old_barcode,
    vs.order_on,
        CASE
            WHEN vs.storage_size_type = 'Một Khoảng Giá Trị'::text THEN concat(vs.storage_size_1::text, '-', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Một Giá Trị'::text THEN vs.storage_size_2::text
            WHEN vs.storage_size_type = 'Nhiều Viên Chủ'::text THEN 'Nhiều Viên Chủ'::text
            WHEN vs.storage_size_type = 'Dài x Rộng'::text THEN concat(vs.storage_size_1::text, 'x', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Không Có'::text THEN '0.0'::text
            ELSE NULL::text
        END AS storage_size_final
   FROM workplace.variant_serials vs
     LEFT JOIN workplace.variants v ON vs.variant_id = v.id
     LEFT JOIN workplace.products p ON p.id = v.product_id
     LEFT JOIN workplace.designs d ON d.id = p.design_id
  WHERE vs.last_rfid_scan_time::date >= (CURRENT_DATE - '1 day'::interval)
  ORDER BY vs.last_rfid_scan_time DESC;
ALTER TABLE "supplychain"."today_rfid_scans" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for neckplace_inventory
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."neckplace_inventory";
CREATE VIEW "supplychain"."neckplace_inventory" AS  WITH available_inventory AS (
         SELECT v.id AS variant_id,
            TRIM(BOTH FROM split_part(p.title::text, '-'::text, 2)) AS extracted_title,
            sum(v.qty_available) AS qty_available,
            v.price
           FROM haravan.variants v
             LEFT JOIN haravan.products p ON p.id = v.product_id
          WHERE v.product_type::text = 'Dây Chuyền Trơn'::text
          GROUP BY v.id, v.price, p.title
        ), location_inventory AS (
         SELECT w.name,
            wi.variant_id,
            wi.qty_available
           FROM haravan.warehouse_inventories wi
             LEFT JOIN haravan.warehouses w ON w.id = wi.loc_id
          WHERE wi.qty_available > 0
        )
 SELECT ai.extracted_title AS design_code,
    to_char(ai.price, 'FM999,999,999'::text) AS price,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[CT] Cửa Hàng Cần Thơ'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[CT] Cửa Hàng Cần Thơ'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS can_tho_inventory,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[HCM] Cửa Hàng HCM'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[HCM] Cửa Hàng HCM'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS ho_chi_minh_inventory,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[HN] Cửa Hàng HN'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[HN] Cửa Hàng HN'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS ha_noi_inventory,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[HCM] Kế Toán'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[HCM] Kế Toán'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS accounting_inventory,
        CASE
            WHEN sum(li.qty_available) = 0::numeric THEN '_'::text
            ELSE sum(li.qty_available)::text
        END AS total_available
   FROM available_inventory ai
     LEFT JOIN location_inventory li ON ai.variant_id = li.variant_id
  WHERE ai.qty_available > 0 AND (li.name = ANY (ARRAY['[CT] Cửa Hàng Cần Thơ'::text, '[HCM] Cửa Hàng HCM'::text, '[HN] Cửa Hàng HN'::text, '[HCM] Kế Toán'::text]))
  GROUP BY ai.extracted_title, ai.price
UNION ALL
 SELECT 'Tổng cộng'::text AS design_code,
    ''::text AS price,
    to_char(sum(
        CASE
            WHEN li.name = '[CT] Cửa Hàng Cần Thơ'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS can_tho_inventory,
    to_char(sum(
        CASE
            WHEN li.name = '[HCM] Cửa Hàng HCM'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS ho_chi_minh_inventory,
    to_char(sum(
        CASE
            WHEN li.name = '[HN] Cửa Hàng HN'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS ha_noi_inventory,
    to_char(sum(
        CASE
            WHEN li.name = '[HCM] Kế Toán'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS accounting_inventory,
    to_char(sum(li.qty_available), 'FM999,999,999'::text) AS total_available
   FROM available_inventory ai
     LEFT JOIN location_inventory li ON ai.variant_id = li.variant_id
  WHERE ai.qty_available > 0 AND (li.name = ANY (ARRAY['[CT] Cửa Hàng Cần Thơ'::text, '[HCM] Cửa Hàng HCM'::text, '[HN] Cửa Hàng HN'::text, '[HCM] Kế Toán'::text]));
ALTER TABLE "supplychain"."neckplace_inventory" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for jewelry_variant_serials
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."jewelry_variant_serials";
CREATE VIEW "supplychain"."jewelry_variant_serials" AS  SELECT vs.serial_number,
    vs.last_rfid_scan_time,
    vs.stock_at,
    v.barcode,
    vs.printing_batch,
    p.haravan_product_type,
        CASE
            WHEN v.applique_material = 'Không'::text THEN concat(p.haravan_product_type, ' ', 'Không Đính Á', ' ', v.fineness)
            ELSE concat(p.haravan_product_type, ' ', replace(v.applique_material, 'Trang Sức '::text, ''::text), ' ', v.fineness)
        END AS product_name,
    d.design_code,
    v.fineness,
    v.material_color,
    v.ring_size,
    vs.storage_size_type,
    vs.storage_size_1,
    vs.storage_size_2,
    v.sku,
    vs.gold_weight,
    vs.diamond_weight,
    vs.quantity,
        CASE
            WHEN vs.printing_batch ~~* '%Tem tạm%'::text THEN 0::numeric
            ELSE floor(v.price)
        END AS price,
    vs.encode_barcode,
    vs.final_encoded_barcode,
    ('['::text || vs.old_barcode) || ']'::text AS old_barcode,
    vs.order_on,
        CASE
            WHEN vs.storage_size_type = 'Một Khoảng Giá Trị'::text THEN concat(vs.storage_size_1::text, '-', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Một Giá Trị'::text THEN vs.storage_size_2::text
            WHEN vs.storage_size_type = 'Nhiều Viên Chủ'::text THEN 'Nhiều Viên Chủ'::text
            WHEN vs.storage_size_type = 'Dài x Rộng'::text THEN concat(vs.storage_size_1::text, 'x', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Không Có'::text THEN '0.0'::text
            ELSE NULL::text
        END AS storage_size_final
   FROM workplace.variant_serials vs
     LEFT JOIN workplace.variants v ON vs.variant_id = v.id
     LEFT JOIN workplace.products p ON p.id = v.product_id
     LEFT JOIN workplace.designs d ON d.id = p.design_id
  ORDER BY vs.last_rfid_scan_time DESC;
ALTER TABLE "supplychain"."jewelry_variant_serials" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for jewelry_variant_inventories
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."jewelry_variant_inventories";
CREATE VIEW "supplychain"."jewelry_variant_inventories" AS  SELECT p.id AS nocodb_product_id,
    p.haravan_product_id,
    v.id AS nocodb_variant_id,
    v.haravan_variant_id,
    p.design_id,
    d.design_code,
    wp.haravan_product_type,
    v.fineness,
    v.barcode,
    v.category,
    v.applique_material,
    v.size_type,
    COALESCE(v.ring_size, 0::bigint::numeric) AS ring_size,
    p.published_scope,
    (d.design_code || '_'::text) || v.fineness AS design_code_material,
    v.price AS price_original,
        CASE
            WHEN wp.haravan_product_type ~~* '%Bông Tai%'::text THEN v.price * 2::numeric
            ELSE v.price
        END AS price_adjusted,
    w.name,
    COALESCE(wi.qty_onhand, 0::bigint) AS qty_onhand,
    COALESCE(wi.qty_incoming, 0::bigint) AS qty_incoming,
    COALESCE(wi.qty_committed, 0::bigint) AS qty_committed,
    COALESCE(wi.qty_available, 0::bigint) AS qty_available
   FROM workplace.products p
     LEFT JOIN workplace.variants v ON v.product_id = p.id
     LEFT JOIN workplace.designs d ON p.design_id = d.id
     LEFT JOIN workplace.products wp ON wp.id = v.product_id
     LEFT JOIN haravan.warehouse_inventories wi ON v.haravan_variant_id = wi.variant_id
     LEFT JOIN haravan.warehouses w ON wi.loc_id = w.id
  WHERE p.haravan_product_id IS NOT NULL AND v.haravan_variant_id IS NOT NULL;
ALTER TABLE "supplychain"."jewelry_variant_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for dim_products
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."dim_products";
CREATE VIEW "supplychain"."dim_products" AS  WITH diamonds AS (
         SELECT d.product_id AS haravan_product_id,
            d.variant_id AS haravan_variant_id,
            d.barcode,
            d.report_no AS diamondreportno,
            d.price,
            d.cogs AS diamondcogs,
            d.product_group AS productgroup,
            d.shape AS diamondshape,
            d.cut AS diamondcut,
            COALESCE(NULLIF(d.color, ''::text), 'Khác'::text) AS diamondcolor,
            d.clarity AS diamondclarity,
            d.fluorescence AS diamondfluorescence,
            d.edge_size_1 AS diamondlength,
            d.edge_size_2 AS diamondwidth,
            d.carat AS diamondcarat
           FROM workplace.diamonds d
        ), jewelries AS (
         SELECT v.id AS jewelriesvariantid,
            p.design_id AS designid,
            p.haravan_product_id,
            v.haravan_variant_id,
            v.barcode,
            v.category AS productgroup,
            d.design_type AS jewelriesproducttype,
            d.gender AS jewelriesgender,
            v.applique_material AS jewelriesappliquematerial,
            v.fineness AS jewelriesfiness,
            v.material_color AS jewelriesmaterialcolor,
            v.size_type AS jewelriessizetype,
            v.ring_size AS jewelriesringsize,
            v.price
           FROM workplace.variants v
             LEFT JOIN workplace.products p ON v.product_id = p.id
             LEFT JOIN workplace.designs d ON d.id = p.design_id
          WHERE v.haravan_variant_id IS NOT NULL
        UNION ALL
         SELECT NULL::integer AS jewelriesvariantid,
            j.design_id AS designid,
            j.product_id AS haravan_product_id,
            j.variant_id AS haravan_variant_id,
            j.barcode,
            j.category AS productgroup,
            j.product_type AS jewelriesproducttype,
            j.gender AS jewelriesgender,
            j.applique_material AS jewelriesappliquematerial,
            j.fineness AS jewelriesfiness,
            j.material_color AS jewelriesmaterialcolor,
            j.size_type AS jewelriessizetype,
            j.ring_size AS jewelriesringsize,
            j.price
           FROM workplace.jewelries j
          WHERE j.variant_id IS NOT NULL
        ), haravan_product_types AS (
         SELECT variants.id AS haravan_variant_id,
            variants.product_type AS haravan_product_type
           FROM haravan.variants
        ), combined_data AS (
         SELECT diamonds.haravan_product_id,
            diamonds.haravan_variant_id,
            diamonds.barcode,
            diamonds.diamondreportno,
            diamonds.price,
            diamonds.diamondcogs,
            diamonds.productgroup,
            diamonds.diamondshape,
            diamonds.diamondcut,
            diamonds.diamondcolor,
            diamonds.diamondclarity,
            diamonds.diamondfluorescence,
            diamonds.diamondlength,
            diamonds.diamondwidth,
            diamonds.diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'diamond'::text AS source_table
           FROM diamonds
        UNION ALL
         SELECT jewelries.haravan_product_id,
            jewelries.haravan_variant_id,
            jewelries.barcode,
            NULL::bigint AS diamondreportno,
            jewelries.price,
            NULL::numeric AS diamondcogs,
            'Trang sức'::text AS productgroup,
            NULL::text AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            NULL::real AS diamondlength,
            NULL::real AS diamondwidth,
            NULL::numeric AS diamondcarat,
            jewelries.jewelriesvariantid,
            jewelries.designid,
            jewelries.jewelriesproducttype,
            jewelries.jewelriesgender,
            jewelries.jewelriesappliquematerial,
            jewelries.jewelriesfiness,
            jewelries.jewelriesmaterialcolor,
            jewelries.jewelriessizetype,
            jewelries.jewelriesringsize,
            'jewelry'::text AS source_table
           FROM jewelries
        UNION ALL
         SELECT variants.product_id AS haravan_product_id,
            variants.id AS haravan_variant_id,
            variants.barcode,
            NULL::bigint AS diamondreportno,
            variants.price,
            NULL::numeric AS diamondcogs,
            'Sản phẩm khác'::text AS productgroup,
            NULL::text AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            NULL::real AS diamondlength,
            NULL::real AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'variant'::text AS source_table
           FROM haravan.variants
          WHERE (variants.product_type::text = ANY (ARRAY['virtual'::character varying, 'Hàng Bảo Hành'::character varying, 'Quà Tặng'::character varying, 'Hàng Khách Gửi'::character varying]::text[])) AND ((variants.product_type::text = ANY (ARRAY['virtual'::character varying, 'Hàng Khách Gửi'::character varying]::text[])) OR variants.title::text !~ 'GIA[0-9]{10}'::text)
        UNION ALL
         SELECT melee_diamonds.haravan_product_id,
            melee_diamonds.haravan_variant_id,
            melee_diamonds.barcode,
            NULL::bigint AS diamondreportno,
            NULL::numeric AS price,
            NULL::numeric AS diamondcogs,
            'Kim Cương Tấm'::text AS productgroup,
            melee_diamonds.shape AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            melee_diamonds.length AS diamondlength,
            melee_diamonds.width AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'melee_diamond'::text AS source_table
           FROM workplace.melee_diamonds
          WHERE melee_diamonds.haravan_variant_id IS NOT NULL
        UNION ALL
         SELECT moissanite.haravan_product_id,
            moissanite.haravan_variant_id,
            moissanite.barcode,
            NULL::bigint AS diamondreportno,
            NULL::numeric AS price,
            NULL::numeric AS diamondcogs,
            'Moissanite'::text AS productgroup,
            moissanite.shape AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            moissanite.length AS diamondlength,
            moissanite.width AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'moissanite'::text AS source_table
           FROM workplace.moissanite
          WHERE moissanite.haravan_variant_id IS NOT NULL AND moissanite.haravan_product_id IS NOT NULL
        ), combined_with_product_type AS (
         SELECT cd.haravan_product_id,
            cd.haravan_variant_id,
            cd.barcode,
            cd.diamondreportno,
            cd.price,
            cd.diamondcogs,
            cd.productgroup,
            cd.diamondshape,
            cd.diamondcut,
            cd.diamondcolor,
            cd.diamondclarity,
            cd.diamondfluorescence,
            cd.diamondlength,
            cd.diamondwidth,
            cd.diamondcarat,
            cd.jewelriesvariantid,
            cd.designid,
            cd.jewelriesproducttype,
            cd.jewelriesgender,
            cd.jewelriesappliquematerial,
            cd.jewelriesfiness,
            cd.jewelriesmaterialcolor,
            cd.jewelriessizetype,
            cd.jewelriesringsize,
            cd.source_table,
            hpt.haravan_product_type
           FROM combined_data cd
             LEFT JOIN haravan_product_types hpt ON cd.haravan_variant_id = hpt.haravan_variant_id
        ), ranked_data AS (
         SELECT combined_with_product_type.haravan_product_id,
            combined_with_product_type.haravan_variant_id,
            combined_with_product_type.barcode,
            combined_with_product_type.diamondreportno,
            combined_with_product_type.price,
            combined_with_product_type.diamondcogs,
            combined_with_product_type.productgroup,
            combined_with_product_type.diamondshape,
            combined_with_product_type.diamondcut,
            combined_with_product_type.diamondcolor,
            combined_with_product_type.diamondclarity,
            combined_with_product_type.diamondfluorescence,
            combined_with_product_type.diamondlength,
            combined_with_product_type.diamondwidth,
            combined_with_product_type.diamondcarat,
            combined_with_product_type.jewelriesvariantid,
            combined_with_product_type.designid,
            combined_with_product_type.jewelriesproducttype,
            combined_with_product_type.jewelriesgender,
            combined_with_product_type.jewelriesappliquematerial,
            combined_with_product_type.jewelriesfiness,
            combined_with_product_type.jewelriesmaterialcolor,
            combined_with_product_type.jewelriessizetype,
            combined_with_product_type.jewelriesringsize,
            combined_with_product_type.source_table,
            combined_with_product_type.haravan_product_type,
            row_number() OVER (PARTITION BY combined_with_product_type.haravan_variant_id ORDER BY combined_with_product_type.haravan_variant_id) AS rn
           FROM combined_with_product_type
        ), final_query AS (
         SELECT ranked_data.haravan_product_id,
            ranked_data.haravan_variant_id,
            ranked_data.barcode,
            ranked_data.diamondreportno,
            ranked_data.price,
            ranked_data.diamondcogs,
            ranked_data.productgroup,
            ranked_data.diamondshape,
            ranked_data.diamondcut,
            ranked_data.diamondcolor,
            ranked_data.diamondclarity,
            ranked_data.diamondfluorescence,
            ranked_data.diamondlength,
            ranked_data.diamondwidth,
            ranked_data.diamondcarat,
            ranked_data.jewelriesvariantid,
            ranked_data.designid,
            ranked_data.jewelriesproducttype,
            ranked_data.jewelriesgender,
            ranked_data.jewelriesappliquematerial,
            ranked_data.jewelriesfiness,
            ranked_data.jewelriesmaterialcolor,
            ranked_data.jewelriessizetype,
            ranked_data.jewelriesringsize,
            ranked_data.source_table,
            ranked_data.haravan_product_type
           FROM ranked_data
          WHERE ranked_data.rn = 1
        )
 SELECT f.haravan_product_id,
    f.haravan_variant_id,
    f.barcode,
    f.diamondreportno,
    f.price,
    f.diamondcogs,
    f.productgroup,
    f.diamondshape,
    f.diamondcut,
    f.diamondcolor,
    f.diamondclarity,
    f.diamondfluorescence,
    f.diamondlength,
    f.diamondwidth,
    f.diamondcarat,
    f.jewelriesvariantid,
    f.designid,
    f.jewelriesproducttype,
    f.jewelriesgender,
    f.jewelriesappliquematerial,
    f.jewelriesfiness,
    f.jewelriesmaterialcolor,
    f.jewelriessizetype,
    f.jewelriesringsize,
    f.source_table,
    f.haravan_product_type,
    hv.sku
   FROM final_query f
     LEFT JOIN haravan.variants hv ON f.haravan_variant_id = hv.id;
ALTER TABLE "supplychain"."dim_products" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for variant_price_changes
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."variant_price_changes";
CREATE VIEW "supplychain"."variant_price_changes" AS  WITH variants_cte AS (
         SELECT p.id AS nocodb_product_id,
            p.haravan_product_id,
            v.id AS nocodb_variant_id,
            v.haravan_variant_id,
            p.design_id,
            p.published_scope,
            d.design_code,
            v.fineness,
            (d.design_code || '_'::text) || v.fineness AS design_code_material,
            v.price AS old_price,
            hv.qty_onhand
           FROM workplace.products p
             LEFT JOIN workplace.variants v ON v.product_id = p.id
             LEFT JOIN workplace.designs d ON p.design_id = d.id
             LEFT JOIN haravan.variants hv ON v.haravan_variant_id = hv.id
          WHERE p.haravan_product_id IS NOT NULL AND v.haravan_variant_id IS NOT NULL
        ), price_changes_cte AS (
         SELECT j.design_id,
            d.design_code,
            d.design_type,
            j.material,
            (j.design_code || '_'::text) || j.material AS design_code_material,
                CASE
                    WHEN d.design_type = 'Bông Tai'::text THEN j.proposal_price / 2::numeric
                    ELSE j.proposal_price
                END AS new_price,
            j.tag
           FROM supplychain.jewelry_price j
             LEFT JOIN workplace.designs d ON j.design_id = d.id
        )
 SELECT vcte.nocodb_product_id,
    vcte.haravan_product_id,
    vcte.nocodb_variant_id,
    vcte.haravan_variant_id,
    vcte.design_id,
    vcte.design_code,
    vcte.fineness,
    vcte.published_scope,
    vcte.design_code_material,
    pcte.new_price,
    vcte.old_price,
    pcte.new_price - vcte.old_price AS diff_price,
    (pcte.new_price - vcte.old_price) / NULLIF(pcte.new_price, 0::numeric) AS percent_diff_price,
    vcte.qty_onhand,
    pcte.tag
   FROM variants_cte vcte
     LEFT JOIN price_changes_cte pcte ON vcte.design_code_material = pcte.design_code_material
  WHERE pcte.new_price IS NOT NULL;
ALTER TABLE "supplychain"."variant_price_changes" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "supplychain"."design_melee_id_seq"
OWNED BY "supplychain"."design_melee"."id";
SELECT setval('"supplychain"."design_melee_id_seq"', 11141, true);

-- ----------------------------
-- Primary Key structure for table buyback_exchange_approval_instances_detail
-- ----------------------------
ALTER TABLE "supplychain"."buyback_exchange_approval_instances_detail" ADD CONSTRAINT "buyback_exchange_approval_instances_pkey" PRIMARY KEY ("request_no");

-- ----------------------------
-- Triggers structure for table design_melee
-- ----------------------------
CREATE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "supplychain"."design_melee"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_database_updated_at"();

-- ----------------------------
-- Primary Key structure for table design_melee
-- ----------------------------
ALTER TABLE "supplychain"."design_melee" ADD CONSTRAINT "design_melee_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table designs
-- ----------------------------
CREATE TRIGGER "trg_classify_melee_type" AFTER UPDATE OF "get_melee_status" ON "supplychain"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."classify_melee_type"();
CREATE TRIGGER "trg_melee_type_update" BEFORE UPDATE ON "supplychain"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."trg_update_melee_type_timestamp"();
CREATE TRIGGER "trg_update_link_4view_timestamp" BEFORE UPDATE ON "supplychain"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_link_4view_timestamp"();

-- ----------------------------
-- Checks structure for table designs
-- ----------------------------
ALTER TABLE "supplychain"."designs" ADD CONSTRAINT "designs_get_melee_status_check" CHECK (get_melee_status = ANY (ARRAY['Pending'::text, 'Success'::text, 'Fail'::text]));

-- ----------------------------
-- Primary Key structure for table designs
-- ----------------------------
ALTER TABLE "supplychain"."designs" ADD CONSTRAINT "designs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table diamond_attribute
-- ----------------------------
CREATE TRIGGER "trigger_set_database_created_at" BEFORE INSERT ON "supplychain"."diamond_attribute"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_database_created_at"();
CREATE TRIGGER "trigger_set_database_updated_at" BEFORE UPDATE ON "supplychain"."diamond_attribute"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_database_updated_at"();

-- ----------------------------
-- Primary Key structure for table diamond_attribute
-- ----------------------------
ALTER TABLE "supplychain"."diamond_attribute" ADD CONSTRAINT "diamond_attribute_pk" PRIMARY KEY ("report_no");

-- ----------------------------
-- Primary Key structure for table diamond_purchase
-- ----------------------------
ALTER TABLE "supplychain"."diamond_purchase" ADD CONSTRAINT "diamond_purchase_pk" PRIMARY KEY ("report_no");

-- ----------------------------
-- Primary Key structure for table diamond_quotation
-- ----------------------------
ALTER TABLE "supplychain"."diamond_quotation" ADD CONSTRAINT "diamond_quotation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table diamond_ticket_quotation
-- ----------------------------
ALTER TABLE "supplychain"."diamond_ticket_quotation" ADD CONSTRAINT "diamond_ticket_quotation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table gold_prices
-- ----------------------------
ALTER TABLE "supplychain"."gold_prices" ADD CONSTRAINT "gold_prices_pkey" PRIMARY KEY ("timestamp");

-- ----------------------------
-- Triggers structure for table history_price_ticket
-- ----------------------------
CREATE TRIGGER "trigger_set_created_at" BEFORE INSERT ON "supplychain"."history_price_ticket"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_created_at"();
CREATE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "supplychain"."history_price_ticket"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();

-- ----------------------------
-- Primary Key structure for table jewelry_design_items
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_design_items" ADD CONSTRAINT "jewelry_design_items_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Primary Key structure for table jewelry_price
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_price" ADD CONSTRAINT "jewelry_price_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Triggers structure for table jewelry_purchase_order_line_items
-- ----------------------------
CREATE TRIGGER "set_db_update_at_trigger" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();
CREATE TRIGGER "trg_update_hash_order_product_id" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"();
CREATE TRIGGER "trg_update_hash_sku_id" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"();

-- ----------------------------
-- Primary Key structure for table jewelry_purchase_order_line_items
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_purchase_order_line_items" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Triggers structure for table jewelry_purchase_orders
-- ----------------------------
CREATE TRIGGER "trg_set_db_update_at" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();
CREATE TRIGGER "trigger_set_db_update_at" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();
CREATE TRIGGER "trigger_update_hash_record_id_jewelry_purchase_order" BEFORE UPDATE OF "record_id" ON "supplychain"."jewelry_purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_jewelry_purchase_order_hash_record_id"();

-- ----------------------------
-- Primary Key structure for table jewelry_purchase_orders
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_purchase_orders" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Primary Key structure for table pnj_products
-- ----------------------------
ALTER TABLE "supplychain"."pnj_products" ADD CONSTRAINT "pnj_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ticket_price
-- ----------------------------
ALTER TABLE "supplychain"."ticket_price" ADD CONSTRAINT "ticket_price_pkey" PRIMARY KEY ("recordid");
