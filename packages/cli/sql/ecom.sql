/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : ecom

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:31
*/

CREATE SCHEMA IF NOT EXISTS "ecom";


-- ----------------------------
-- Sequence structure for leads_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "ecom"."leads_id_seq";
CREATE SEQUENCE "ecom"."leads_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "ecom"."leads_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for leads
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."leads";
CREATE TABLE "ecom"."leads" (
  "id" int4 NOT NULL DEFAULT nextval('"ecom".leads_id_seq'::regclass),
  "raw_data" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "custom_uuid" text COLLATE "pg_catalog"."default" DEFAULT (gen_random_uuid())::text
)
;
ALTER TABLE "ecom"."leads" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."products";
CREATE TABLE "ecom"."products" (
  "haravan_product_id" int8,
  "haravan_product_type" text COLLATE "pg_catalog"."default",
  "design_id" int8,
  "handle" varchar COLLATE "pg_catalog"."default",
  "workplace_id" int4,
  "category" text COLLATE "pg_catalog"."default",
  "title" text COLLATE "pg_catalog"."default",
  "min_price" numeric,
  "max_price" numeric,
  "qty_onhand" int8,
  "image_updated_at" timestamp(6),
  "wedding_ring_id" int4,
  "primary_collection" text COLLATE "pg_catalog"."default",
  "primary_collection_handle" text COLLATE "pg_catalog"."default",
  "pages" text COLLATE "pg_catalog"."default",
  "max_price_18" int4,
  "max_price_14" int4
)
;
ALTER TABLE "ecom"."products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for qr_generator
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."qr_generator";
CREATE TABLE "ecom"."qr_generator" (
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "bank_code" varchar COLLATE "pg_catalog"."default",
  "bank_account_number" varchar COLLATE "pg_catalog"."default",
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "customer_phone_number" varchar COLLATE "pg_catalog"."default",
  "transfer_amount" int8,
  "transfer_note" varchar COLLATE "pg_catalog"."default",
  "transfer_status" varchar COLLATE "pg_catalog"."default",
  "haravan_order_number" varchar COLLATE "pg_catalog"."default",
  "haravan_order_status" varchar COLLATE "pg_catalog"."default",
  "haravan_order_id" int8,
  "haravan_order_total_price" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamp(6),
  "is_deleted" bool,
  "qr_url" text COLLATE "pg_catalog"."default",
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default",
  "all_lark_record_id" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "ecom"."qr_generator" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variants
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."variants";
CREATE TABLE "ecom"."variants" (
  "hararvan_product_id" int8,
  "haravan_variant_id" int8,
  "sku" varchar COLLATE "pg_catalog"."default",
  "price" numeric,
  "price_compare_at" numeric(36,8),
  "material_color" text COLLATE "pg_catalog"."default",
  "fineness" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "haravan_product_id" int4
)
;
ALTER TABLE "ecom"."variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for wedding_rings
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."wedding_rings";
CREATE TABLE "ecom"."wedding_rings" (
  "id" int4,
  "title" text COLLATE "pg_catalog"."default",
  "max_price" numeric,
  "min_price" numeric,
  "image_updated_at" timestamp(6)
)
;
ALTER TABLE "ecom"."wedding_rings" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "ecom"."leads_id_seq"
OWNED BY "ecom"."leads"."id";
SELECT setval('"ecom"."leads_id_seq"', 1977, true);

-- ----------------------------
-- Uniques structure for table leads
-- ----------------------------
ALTER TABLE "ecom"."leads" ADD CONSTRAINT "leads_custom_uuid_key" UNIQUE ("custom_uuid");

-- ----------------------------
-- Primary Key structure for table leads
-- ----------------------------
ALTER TABLE "ecom"."leads" ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table products
-- ----------------------------
ALTER TABLE "ecom"."products" ADD CONSTRAINT "products_unique_haravan_id" UNIQUE ("haravan_product_id");

-- ----------------------------
-- Indexes structure for table qr_generator
-- ----------------------------
CREATE INDEX "ix_ecom_qr_generator_id" ON "ecom"."qr_generator" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table qr_generator
-- ----------------------------
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table variants
-- ----------------------------
ALTER TABLE "ecom"."variants" ADD CONSTRAINT "unique_haravan_variant_id" UNIQUE ("haravan_variant_id");

-- ----------------------------
-- Uniques structure for table wedding_rings
-- ----------------------------
ALTER TABLE "ecom"."wedding_rings" ADD CONSTRAINT "wedding_rings_id_key" UNIQUE ("id");
