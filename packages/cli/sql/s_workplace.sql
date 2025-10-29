/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : workplace

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:24:14
*/

CREATE SCHEMA IF NOT EXISTS "workplace";

-- ----------------------------
-- Sequence structure for collections_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."collections_id_seq";
CREATE SEQUENCE "workplace"."collections_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."collections_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_details_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_details_id_seq";
CREATE SEQUENCE "workplace"."design_details_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_details_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_images_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_images_id_seq";
CREATE SEQUENCE "workplace"."design_images_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_images_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_melee_details_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_melee_details_id_seq";
CREATE SEQUENCE "workplace"."design_melee_details_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_melee_details_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_price_estimation_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_price_estimation_id_seq";
CREATE SEQUENCE "workplace"."design_price_estimation_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_price_estimation_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_products_id_seq";
CREATE SEQUENCE "workplace"."design_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_products_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_products_id_seq1";
CREATE SEQUENCE "workplace"."design_products_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_products_id_seq1" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_set_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_set_id_seq";
CREATE SEQUENCE "workplace"."design_set_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_set_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for diamomds_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."diamomds_id_seq";
CREATE SEQUENCE "workplace"."diamomds_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."diamomds_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for diamond_price_list_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."diamond_price_list_id_seq";
CREATE SEQUENCE "workplace"."diamond_price_list_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."diamond_price_list_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for ecom_360_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."ecom_360_id_seq";
CREATE SEQUENCE "workplace"."ecom_360_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."ecom_360_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for ecom_old_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."ecom_old_products_id_seq";
CREATE SEQUENCE "workplace"."ecom_old_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."ecom_old_products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for hrv_locations_1_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."hrv_locations_1_id_seq";
CREATE SEQUENCE "workplace"."hrv_locations_1_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."hrv_locations_1_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for jewelries_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."jewelries_id_seq";
CREATE SEQUENCE "workplace"."jewelries_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."jewelries_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for materials_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."materials_id_seq";
CREATE SEQUENCE "workplace"."materials_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."materials_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for melee_diamonds_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."melee_diamonds_id_seq";
CREATE SEQUENCE "workplace"."melee_diamonds_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."melee_diamonds_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for moissanite_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."moissanite_id_seq";
CREATE SEQUENCE "workplace"."moissanite_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."moissanite_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for moissanite_serials_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."moissanite_serials_id_seq";
CREATE SEQUENCE "workplace"."moissanite_serials_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."moissanite_serials_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for product_collections_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."product_collections_id_seq";
CREATE SEQUENCE "workplace"."product_collections_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."product_collections_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."products_id_seq";
CREATE SEQUENCE "workplace"."products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for promotions_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."promotions_id_seq";
CREATE SEQUENCE "workplace"."promotions_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."promotions_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for sets_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."sets_id_seq";
CREATE SEQUENCE "workplace"."sets_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."sets_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for size_details_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."size_details_id_seq";
CREATE SEQUENCE "workplace"."size_details_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."size_details_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for submitted_codes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."submitted_codes_id_seq";
CREATE SEQUENCE "workplace"."submitted_codes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."submitted_codes_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for temporary_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."temporary_products_id_seq";
CREATE SEQUENCE "workplace"."temporary_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."temporary_products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for temporary_products_web_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."temporary_products_web_id_seq";
CREATE SEQUENCE "workplace"."temporary_products_web_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."temporary_products_web_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for variant_serials_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."variant_serials_id_seq";
CREATE SEQUENCE "workplace"."variant_serials_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."variant_serials_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for variants_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."variants_id_seq";
CREATE SEQUENCE "workplace"."variants_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."variants_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for wedding_rings_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."wedding_rings_id_seq";
CREATE SEQUENCE "workplace"."wedding_rings_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."wedding_rings_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for _nc_m2m_haravan_collect_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."_nc_m2m_haravan_collect_products";
CREATE TABLE "workplace"."_nc_m2m_haravan_collect_products" (
  "products_id" int4 NOT NULL,
  "haravan_collections_id" int4 NOT NULL
)
;
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for collections
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."collections";
CREATE TABLE "workplace"."collections" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".collections_id_seq'::regclass),
  "collection_name" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "air" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."collections" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_details
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_details";
CREATE TABLE "workplace"."design_details" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_details_id_seq'::regclass),
  "gold_weight" numeric NOT NULL DEFAULT 0,
  "labour_cost" numeric NOT NULL DEFAULT 0,
  "shape_of_main_stone" text COLLATE "pg_catalog"."default",
  "main_stone_length" numeric,
  "main_stone_width" numeric,
  "melee_total_price" numeric
)
;
ALTER TABLE "workplace"."design_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_images
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_images";
CREATE TABLE "workplace"."design_images" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_images_id_seq'::regclass),
  "design_id" int4,
  "material_color" text COLLATE "pg_catalog"."default" DEFAULT 'Vàng Trắng'::text,
  "retouch" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "tick_sync_to_haravan" bool DEFAULT false,
  "note" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."design_images" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_melee_details
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_melee_details";
CREATE TABLE "workplace"."design_melee_details" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_melee_details_id_seq'::regclass),
  "design_detail_id" int4 NOT NULL,
  "quantity" int4 NOT NULL
)
;
ALTER TABLE "workplace"."design_melee_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_price_estimation
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_price_estimation";
CREATE TABLE "workplace"."design_price_estimation" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_price_estimation_id_seq'::regclass),
  "code" text COLLATE "pg_catalog"."default",
  "ref_price" numeric,
  "discount_ref_price" numeric,
  "design_id" int4
)
;
ALTER TABLE "workplace"."design_price_estimation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_set
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_set";
CREATE TABLE "workplace"."design_set" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_set_id_seq'::regclass),
  "design_id" int4,
  "set_id" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "workplace"."design_set" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for designs
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."designs";
CREATE TABLE "workplace"."designs" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_products_id_seq1'::regclass),
  "code" text COLLATE "pg_catalog"."default",
  "erp_code" text COLLATE "pg_catalog"."default",
  "backup_code" text COLLATE "pg_catalog"."default",
  "design_type" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "design_year" text COLLATE "pg_catalog"."default" DEFAULT '2025'::text,
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
  "social_post" bool DEFAULT false,
  "website" bool DEFAULT false,
  "RENDER" bool,
  "RETOUCH" bool DEFAULT false,
  "gold_weight" numeric,
  "main_stone" text COLLATE "pg_catalog"."default",
  "stone_quantity" text COLLATE "pg_catalog"."default",
  "stone_weight" text COLLATE "pg_catalog"."default",
  "diamond_holder" text COLLATE "pg_catalog"."default",
  "source" text COLLATE "pg_catalog"."default",
  "variant_number" int8 DEFAULT 1,
  "collections_id" int4,
  "image_4view" text COLLATE "pg_catalog"."default",
  "image_render" text COLLATE "pg_catalog"."default",
  "image_retouch" text COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "collection_name" text COLLATE "pg_catalog"."default",
  "auto_create_folder" bool,
  "design_code" text COLLATE "pg_catalog"."default",
  "ecom_showed" bool DEFAULT false,
  "tag" text COLLATE "pg_catalog"."default",
  "stock_locations" text COLLATE "pg_catalog"."default",
  "wedding_ring_id" int4,
  "reference_code" text COLLATE "pg_catalog"."default",
  "design_status" text COLLATE "pg_catalog"."default" DEFAULT 'active'::text,
  "erp_code_duplicated" bool DEFAULT false,
  "max_seq" int4,
  "last_synced_render" text COLLATE "pg_catalog"."default",
  "last_synced_4view" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "pick_up" date,
  "created_date" date
)
;
ALTER TABLE "workplace"."designs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for designs_temporary_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."designs_temporary_products";
CREATE TABLE "workplace"."designs_temporary_products" (
  "id" int4 NOT NULL,
  "design_code" text COLLATE "pg_catalog"."default",
  "design_type" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "cover" text COLLATE "pg_catalog"."default",
  "link_render" text COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default",
  "erp_code" text COLLATE "pg_catalog"."default",
  "backup_code" text COLLATE "pg_catalog"."default",
  "lark_record_id" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."designs_temporary_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_price_list
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."diamond_price_list";
CREATE TABLE "workplace"."diamond_price_list" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".diamond_price_list_id_seq'::regclass),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "size" numeric,
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "carat" text COLLATE "pg_catalog"."default",
  "price" numeric
)
;
ALTER TABLE "workplace"."diamond_price_list" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamonds
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."diamonds";
CREATE TABLE "workplace"."diamonds" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".diamomds_id_seq'::regclass),
  "barcode" text COLLATE "pg_catalog"."default",
  "report_lab" text COLLATE "pg_catalog"."default",
  "report_no" int8,
  "price" numeric,
  "cogs" numeric,
  "product_group" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default",
  "cut" text COLLATE "pg_catalog"."default",
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "edge_size_1" float4,
  "edge_size_2" float4,
  "carat" numeric,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "auto_create_haravan_product" bool DEFAULT false,
  "product_id" int8,
  "variant_id" int8,
  "promotions" text COLLATE "pg_catalog"."default" DEFAULT 'CT nền giảm KCV 8%'::text,
  "link_haravan" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "vendor" text COLLATE "pg_catalog"."default",
  "published_scope" text COLLATE "pg_catalog"."default" DEFAULT 'global'::text,
  "qty_onhand" float4,
  "qty_available" float4,
  "qty_commited" float4,
  "qty_incoming" float4,
  "printing_batch" text COLLATE "pg_catalog"."default",
  "g1_collection_id" int4
)
;
ALTER TABLE "workplace"."diamonds" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for ecom_360
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."ecom_360";
CREATE TABLE "workplace"."ecom_360" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".ecom_360_id_seq'::regclass),
  "product_id" int4,
  "path" text COLLATE "pg_catalog"."default" DEFAULT 'https://90814f99c119cd5dc08362580f81a76f.r2.cloudflarestorage.com/jemmia-images/glb/'::text,
  "file_name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."ecom_360" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for ecom_old_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."ecom_old_products";
CREATE TABLE "workplace"."ecom_old_products" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".ecom_old_products_id_seq'::regclass),
  "product_id" int4,
  "variant_id" int4,
  "published_scope" varchar(50) COLLATE "pg_catalog"."default",
  "product_type" varchar(50) COLLATE "pg_catalog"."default",
  "template_suffix" varchar(50) COLLATE "pg_catalog"."default",
  "title" varchar(64) COLLATE "pg_catalog"."default",
  "code" varchar(50) COLLATE "pg_catalog"."default",
  "shape" varchar(50) COLLATE "pg_catalog"."default",
  "color" varchar(50) COLLATE "pg_catalog"."default",
  "material" varchar(50) COLLATE "pg_catalog"."default",
  "band" varchar(50) COLLATE "pg_catalog"."default",
  "design_id" int4
)
;
ALTER TABLE "workplace"."ecom_old_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for haravan_collections
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."haravan_collections";
CREATE TABLE "workplace"."haravan_collections" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".product_collections_id_seq'::regclass),
  "collection_type" text COLLATE "pg_catalog"."default" DEFAULT 'custom_collection'::text,
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "products_count" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "haravan_id" int8,
  "auto_create" bool DEFAULT false,
  "auto_add_product_type" text COLLATE "pg_catalog"."default",
  "handle" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."haravan_collections" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for hrv_locations_1
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."hrv_locations_1";
CREATE TABLE "workplace"."hrv_locations_1" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".hrv_locations_1_id_seq'::regclass),
  "name" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."hrv_locations_1" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelries
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."jewelries";
CREATE TABLE "workplace"."jewelries" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".jewelries_id_seq'::regclass),
  "barcode" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default" DEFAULT 'Trang sức'::text,
  "supplier_code" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric,
  "diamond_weight" numeric,
  "price" numeric,
  "cogs" numeric,
  "quantity" int2,
  "order_code" text COLLATE "pg_catalog"."default",
  "supplier" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "subcategory" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "applique_material" text COLLATE "pg_catalog"."default",
  "fineness" text COLLATE "pg_catalog"."default",
  "material_color" text COLLATE "pg_catalog"."default",
  "size_type" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "storage_size_type" text COLLATE "pg_catalog"."default",
  "storage_size_1" numeric,
  "storage_size_2" numeric,
  "design_id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "product_group" text COLLATE "pg_catalog"."default",
  "product_type" text COLLATE "pg_catalog"."default",
  "type" text COLLATE "pg_catalog"."default",
  "design_code" text COLLATE "pg_catalog"."default",
  "4view" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "supply_product_type" text COLLATE "pg_catalog"."default",
  "stock" int8,
  "printing_batch" text COLLATE "pg_catalog"."default",
  "haravan_product_type" text COLLATE "pg_catalog"."default",
  "vendor" text COLLATE "pg_catalog"."default",
  "promotions" text COLLATE "pg_catalog"."default",
  "auto_create_haravan_product" bool DEFAULT false,
  "variant_id" int8,
  "product_id" int8,
  "link_haravan" text COLLATE "pg_catalog"."default",
  "qty_onhand" float4,
  "qty_commited" float4,
  "qty_incoming" float4,
  "qty_available" float4,
  "published_scope" text COLLATE "pg_catalog"."default",
  "ring_pair_id" int8,
  "infomation" text COLLATE "pg_catalog"."default",
  "code_in_title" text COLLATE "pg_catalog"."default",
  "stored_sku" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."jewelries" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for materials
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."materials";
CREATE TABLE "workplace"."materials" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".materials_id_seq'::regclass),
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "market_price" numeric NOT NULL,
  "percentage" float8
)
;
ALTER TABLE "workplace"."materials" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for melee_diamonds
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."melee_diamonds";
CREATE TABLE "workplace"."melee_diamonds" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".melee_diamonds_id_seq'::regclass),
  "haravan_product_id" int4,
  "haravan_variant_id" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "length" numeric,
  "width" numeric,
  "sku" text COLLATE "pg_catalog"."default",
  "barcode" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."melee_diamonds" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for moissanite
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."moissanite";
CREATE TABLE "workplace"."moissanite" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".moissanite_id_seq'::regclass),
  "product_group" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default",
  "length" numeric,
  "width" numeric,
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "fluorescence" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "cut" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "polish" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "symmetry" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "haravan_product_id" int8,
  "haravan_variant_id" int8,
  "auto_create" bool DEFAULT false,
  "price" numeric DEFAULT 0,
  "barcode" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."moissanite" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for moissanite_serials
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."moissanite_serials";
CREATE TABLE "workplace"."moissanite_serials" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".moissanite_serials_id_seq'::regclass),
  "final_encoded_rfid" text COLLATE "pg_catalog"."default",
  "moissanite_id" int4,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "workplace"."moissanite_serials" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."products";
CREATE TABLE "workplace"."products" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".products_id_seq'::regclass),
  "haravan_product_id" int8,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "nc_order" numeric,
  "vendor" text COLLATE "pg_catalog"."default" DEFAULT 'Jemmia'::text,
  "haravan_product_type" text COLLATE "pg_catalog"."default",
  "design_id" int8,
  "published_scope" text COLLATE "pg_catalog"."default" DEFAULT 'pos'::text,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "template_suffix" text COLLATE "pg_catalog"."default",
  "handle" text COLLATE "pg_catalog"."default",
  "auto_create_haravan" bool DEFAULT false,
  "note" text COLLATE "pg_catalog"."default",
  "web_url" text COLLATE "pg_catalog"."default",
  "ecom_title" text COLLATE "pg_catalog"."default",
  "g1_promotion" text COLLATE "pg_catalog"."default" DEFAULT '16%'::text,
  "published" text COLLATE "pg_catalog"."default",
  "estimated_gold_weight" numeric,
  "has_360" bool DEFAULT false,
  "diamond_shape" text COLLATE "pg_catalog"."default",
  "stone_min_width" numeric,
  "stone_max_width" numeric,
  "stone_min_length" numeric,
  "stone_max_length" numeric,
  "collections" text COLLATE "pg_catalog"."default",
  "haravan_collections_id" int4
)
;
ALTER TABLE "workplace"."products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for promotions
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."promotions";
CREATE TABLE "workplace"."promotions" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".promotions_id_seq'::regclass),
  "name" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "starts_at" timestamp(6),
  "ends_at" timestamp(6),
  "take_type" text COLLATE "pg_catalog"."default",
  "set_time_active" timestamp(6),
  "status" text COLLATE "pg_catalog"."default",
  "value" int8,
  "products_selection" text COLLATE "pg_catalog"."default",
  "promotion_id" int8,
  "link_to_admind" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."promotions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for sets
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."sets";
CREATE TABLE "workplace"."sets" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".sets_id_seq'::regclass),
  "set_name" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "design_codes" text COLLATE "pg_catalog"."default",
  "haravan_product_id" int4,
  "haravan_variant_id" int4,
  "note" text COLLATE "pg_catalog"."default",
  "main_image_link" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."sets" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for size_details
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."size_details";
CREATE TABLE "workplace"."size_details" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".size_details_id_seq'::regclass),
  "panel_size_type" text COLLATE "pg_catalog"."default",
  "length" numeric,
  "quantity" int8,
  "jewelry_id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "width" numeric
)
;
ALTER TABLE "workplace"."size_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for submitted_codes
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."submitted_codes";
CREATE TABLE "workplace"."submitted_codes" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".submitted_codes_id_seq'::regclass),
  "codes" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_by" varchar COLLATE "pg_catalog"."default",
  "notes" text COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "tag" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."submitted_codes" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for temporary_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."temporary_products";
CREATE TABLE "workplace"."temporary_products" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".temporary_products_id_seq'::regclass),
  "haravan_product_id" int4,
  "haravan_variant_id" int4,
  "customer_name" text COLLATE "pg_catalog"."default",
  "variant_title" text COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default",
  "price" numeric DEFAULT 0,
  "product_information" text COLLATE "pg_catalog"."default",
  "design_id" int4,
  "category" text COLLATE "pg_catalog"."default",
  "applique_material" text COLLATE "pg_catalog"."default",
  "material_color" text COLLATE "pg_catalog"."default",
  "size_type" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "fineness" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "design_code" text COLLATE "pg_catalog"."default",
  "summary" text COLLATE "pg_catalog"."default",
  "lark_base_record_id" text COLLATE "pg_catalog"."default",
  "use_case" text COLLATE "pg_catalog"."default",
  "variant_serial_id" int4,
  "ticket_type" text COLLATE "pg_catalog"."default",
  "product_group" text COLLATE "pg_catalog"."default",
  "gia_report_no" text COLLATE "pg_catalog"."default",
  "ref_design_code" text COLLATE "pg_catalog"."default",
  "request_code" text COLLATE "pg_catalog"."default",
  "is_create_product" text COLLATE "pg_catalog"."default",
  "is_notify_lark_reorder" bool
)
;
ALTER TABLE "workplace"."temporary_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for temporary_products_web
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."temporary_products_web";
CREATE TABLE "workplace"."temporary_products_web" (
  "id" int8 NOT NULL DEFAULT nextval('"workplace".temporary_products_web_id_seq'::regclass),
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "original_hrv_product_id" varchar COLLATE "pg_catalog"."default",
  "original_hrv_variant_id" varchar COLLATE "pg_catalog"."default",
  "token" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "price" int8,
  "line_price" int8,
  "price_original" int8,
  "line_price_orginal" int8,
  "quantity" int4,
  "sku" varchar COLLATE "pg_catalog"."default",
  "grams" float8,
  "product_type" varchar COLLATE "pg_catalog"."default",
  "vendor" varchar COLLATE "pg_catalog"."default",
  "properties" jsonb,
  "gift_card" bool,
  "url" varchar COLLATE "pg_catalog"."default",
  "image" varchar COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "requires_shipping" bool,
  "not_allow_promotion" bool,
  "product_title" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "product_description" varchar COLLATE "pg_catalog"."default",
  "variant_title" varchar COLLATE "pg_catalog"."default",
  "variant_options" jsonb,
  "promotionref" varchar COLLATE "pg_catalog"."default",
  "promotionby" jsonb,
  "haravan_product_id" int8,
  "haravan_variant_id" int8
)
;
ALTER TABLE "workplace"."temporary_products_web" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for temtab
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."temtab";
CREATE TABLE "workplace"."temtab" (
  "design_code" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "column3" varchar(50) COLLATE "pg_catalog"."default",
  "column4" varchar(50) COLLATE "pg_catalog"."default",
  "column5" varchar(50) COLLATE "pg_catalog"."default",
  "column6" varchar(50) COLLATE "pg_catalog"."default",
  "column7" varchar(50) COLLATE "pg_catalog"."default",
  "column8" varchar(50) COLLATE "pg_catalog"."default",
  "column9" varchar(50) COLLATE "pg_catalog"."default",
  "column10" varchar(50) COLLATE "pg_catalog"."default",
  "column11" varchar(50) COLLATE "pg_catalog"."default",
  "column12" varchar(50) COLLATE "pg_catalog"."default",
  "column13" varchar(50) COLLATE "pg_catalog"."default",
  "column14" varchar(50) COLLATE "pg_catalog"."default",
  "column15" varchar(50) COLLATE "pg_catalog"."default",
  "column16" varchar(50) COLLATE "pg_catalog"."default",
  "column17" varchar(50) COLLATE "pg_catalog"."default",
  "column18" varchar(50) COLLATE "pg_catalog"."default",
  "column19" varchar(50) COLLATE "pg_catalog"."default",
  "column20" varchar(50) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."temtab" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variant_serials
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."variant_serials";
CREATE TABLE "workplace"."variant_serials" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".variant_serials_id_seq'::regclass),
  "variant_id" int8,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "nc_order" numeric,
  "serial_number" text COLLATE "pg_catalog"."default",
  "printing_batch" text COLLATE "pg_catalog"."default",
  "encode_barcode" text COLLATE "pg_catalog"."default",
  "final_encoded_barcode" text COLLATE "pg_catalog"."default",
  "old_encode_barcode" text COLLATE "pg_catalog"."default",
  "old_finnal_encode_barcode" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric,
  "diamond_weight" numeric,
  "old_variant_id" int8,
  "old_product_id" int8,
  "quantity" numeric,
  "supplier" text COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "cogs" numeric,
  "old_barcode" text COLLATE "pg_catalog"."default",
  "order_on" text COLLATE "pg_catalog"."default",
  "stock_id" int8,
  "order_id" int8,
  "storage_size_type" text COLLATE "pg_catalog"."default",
  "storage_size_1" numeric,
  "storage_size_2" numeric,
  "note" text COLLATE "pg_catalog"."default",
  "stock_at" text COLLATE "pg_catalog"."default",
  "order_reference" text COLLATE "pg_catalog"."default",
  "last_rfid_scan_time" timestamptz(6),
  "fulfillment_status_value" text COLLATE "pg_catalog"."default",
  "lark_record_id" text COLLATE "pg_catalog"."default",
  "arrival_date" date,
  "actual_gold_price" numeric,
  "actual_melee_price" numeric,
  "actual_labor_cost" numeric
)
;
ALTER TABLE "workplace"."variant_serials" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variant_serials_lark
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."variant_serials_lark";
CREATE TABLE "workplace"."variant_serials_lark" (
  "id" int4 NOT NULL,
  "lark_record_id" text COLLATE "pg_catalog"."default",
  "db_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "workplace"."variant_serials_lark" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variants
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."variants";
CREATE TABLE "workplace"."variants" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".variants_id_seq'::regclass),
  "haravan_variant_id" int8,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "nc_order" numeric,
  "product_id" int8,
  "barcode" text COLLATE "pg_catalog"."default",
  "inventory_quantity" int8,
  "old_inventory_quantity" int8,
  "sku" text COLLATE "pg_catalog"."default",
  "qty_available" int8,
  "qty_onhand" int8,
  "qty_commited" int8,
  "qty_incoming" int8,
  "category" text COLLATE "pg_catalog"."default" DEFAULT 'Trang sức'::text,
  "applique_material" text COLLATE "pg_catalog"."default",
  "fineness" text COLLATE "pg_catalog"."default",
  "material_color" text COLLATE "pg_catalog"."default",
  "size_type" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "haravan_product_id" int8,
  "price" numeric,
  "auto_create_variant" bool DEFAULT false,
  "note" text COLLATE "pg_catalog"."default",
  "estimated_gold_weight" float4
)
;
ALTER TABLE "workplace"."variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for wedding_rings
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."wedding_rings";
CREATE TABLE "workplace"."wedding_rings" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".wedding_rings_id_seq'::regclass),
  "description" text COLLATE "pg_catalog"."default",
  "ecom_title" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."wedding_rings" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for insert_design_id_into_design_details
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."insert_design_id_into_design_details"();
CREATE FUNCTION "workplace"."insert_design_id_into_design_details"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Insert a new record into the workplace.design_details table with the new design_id
    INSERT INTO workplace.design_details (design_id)
    VALUES (NEW.id); -- The default values for gold_weight and labour_cost will be used
    
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."insert_design_id_into_design_details"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_archived_update
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_archived_update"();
CREATE FUNCTION "workplace"."prevent_archived_update"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    IF OLD.design_status = 'archived' AND (NEW.design_status <> 'archived' OR NEW.design_status IS NULL) THEN
        RAISE EXCEPTION 'Cannot change design_status from archived to another value';
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_archived_update"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_design_code_attributes_update_on_designs
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_design_code_attributes_update_on_designs"();
CREATE FUNCTION "workplace"."prevent_design_code_attributes_update_on_designs"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    IF EXISTS (SELECT 1 FROM workplace.products WHERE design_id = NEW.id) THEN
        IF NEW.design_type <> OLD.design_type OR
           NEW.gender <> OLD.gender OR
           NEW.design_year <> OLD.design_year OR
           NEW.design_seq <> OLD.design_seq OR
           NEW.source <> OLD.source OR
           NEW.variant_number <> OLD.variant_number OR
           NEW.diamond_holder <> OLD.diamond_holder OR
			NEW.design_type IS NULL OR
			NEW.gender IS NULL OR
			NEW.design_year IS NULL OR
			NEW.source IS NULL OR
			NEW.design_seq IS NULL OR
			NEW.variant_number IS NULL OR
			NEW.diamond_holder IS NULL THEN
            RAISE EXCEPTION 'Update is not allowed on these columns for designs where id exists in products.';
        END IF;
    END IF;
    RETURN NEW; -- Allow the update if conditions are met
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_design_code_attributes_update_on_designs"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_design_details_deletion
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_design_details_deletion"();
CREATE FUNCTION "workplace"."prevent_design_details_deletion"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    RAISE EXCEPTION 'Deleting records from design_details is not allowed';
    RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_design_details_deletion"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_design_id_update
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_design_id_update"();
CREATE FUNCTION "workplace"."prevent_design_id_update"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Chỉ kiểm tra nếu OLD.design_id khác null
    IF OLD.design_id IS NOT NULL THEN
        -- Kiểm tra xem design_id có thay đổi không
        IF NEW.design_id IS DISTINCT FROM OLD.design_id THEN
            RAISE EXCEPTION 'Updating design_id is not allowed';
        END IF;
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_design_id_update"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_barcode
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_barcode"();
CREATE FUNCTION "workplace"."prevent_update_barcode"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
	IF (OLD.barcode IS NOT NULL AND NEW.barcode IS DISTINCT FROM OLD.barcode) THEN 
		RAISE EXCEPTION 'barcode is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_barcode"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_final_encoded_barcode
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_final_encoded_barcode"();
CREATE FUNCTION "workplace"."prevent_update_final_encoded_barcode"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
--	IF (OLD.final_encoded_barcode IS NOT NULL AND NEW.final_encoded_barcode IS DISTINCT FROM OLD.final_encoded_barcode) THEN 
--		RAISE EXCEPTION 'final_encoded_barcode is not allowed to be updated!';
--	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_final_encoded_barcode"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_serial_number
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_serial_number"();
CREATE FUNCTION "workplace"."prevent_update_serial_number"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
	IF (OLD.serial_number IS NOT NULL AND NEW.serial_number IS DISTINCT FROM OLD.serial_number) THEN 
		RAISE EXCEPTION 'serial_number is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_serial_number"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_sku_attribtes
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_sku_attribtes"();
CREATE FUNCTION "workplace"."prevent_update_sku_attribtes"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
	IF OLD.sku IS NOT NULL THEN
		IF 	(OLD.product_id IS NOT NULL AND OLD.product_id <> NEW.product_id) OR
			(OLD.category IS NOT NULL AND OLD.category <> NEW.category) OR
			(OLD.applique_material IS NOT NULL AND OLD.applique_material <> NEW.applique_material) OR
			(OLD.fineness IS NOT NULL AND OLD.fineness <> NEW.fineness) OR
			(OLD.material_color IS NOT NULL AND OLD.material_color <> NEW.material_color) OR
			(OLD.size_type IS NOT NULL AND OLD.size_type <> NEW.size_type) OR
			(OLD.ring_size IS NOT NULL AND OLD.ring_size <> NEW.ring_size) THEN
				RAISE EXCEPTION 'Update to column(s) not allowed when they are NOT NULL';
		END IF;
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_sku_attribtes"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_variant_id
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_variant_id"();
CREATE FUNCTION "workplace"."prevent_update_variant_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
	IF OLD.variant_id IS NULL THEN
		RETURN NEW;
	END IF;
	IF OLD.variant_id IS NOT NULL AND NEW.variant_id IS DISTINCT FROM OLD.variant_id THEN 
		RAISE EXCEPTION 'variant_id is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_variant_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_variant_serial_id
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_variant_serial_id"();
CREATE FUNCTION "workplace"."prevent_update_variant_serial_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
--	IF (NEW.variant_serial_id is null) then 
--		RAISE EXCEPTION 'barcode is not allowed to be updated!';
--	END IF;
--	IF (OLD.variant_serial_id IS NOT NULL AND NEW.variant_serial_id IS DISTINCT FROM OLD.variant_serial_id) THEN 
--		RAISE EXCEPTION 'barcode is not allowed to be updated!';
--	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_variant_serial_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_serial_number
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."set_serial_number"();
CREATE FUNCTION "workplace"."set_serial_number"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
    current_year_month TEXT;
    max_serial TEXT;
    next_serial INTEGER;
    serial_number TEXT;
BEGIN
    -- Compute the current year and month in YYMM format
    current_year_month := TO_CHAR(NOW(), 'YYMM');

    -- Get the maximum serial number for the current year and month
    SELECT MAX(vs.serial_number) INTO max_serial
    FROM workplace.variant_serials vs
    WHERE vs.serial_number LIKE current_year_month || '%';

    -- Determine the next serial number
    IF max_serial IS NOT NULL THEN
        -- Extract the numeric part, increment, and pad with zeros
        next_serial := CAST(SUBSTRING(max_serial FROM 5) AS INTEGER) + 1;
    ELSE
        -- Start from 6 if no serial exists for the current year and month
        next_serial := 6;
    END IF;

    -- Format the serial number as a 4-digit string
    serial_number := LPAD(next_serial::TEXT, 4, '0');

    -- Combine year_month and serial_number
    NEW.serial_number := current_year_month || serial_number;

    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."set_serial_number"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for to_date_time_safe
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."to_date_time_safe"("value" text, "format" text);
CREATE FUNCTION "workplace"."to_date_time_safe"("value" text, "format" text)
  RETURNS "pg_catalog"."timestamp" AS $BODY$
  BEGIN
    RETURN to_timestamp(value, format);
    EXCEPTION
      WHEN others THEN RETURN NULL;  
  END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."to_date_time_safe"("value" text, "format" text) OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_database_updated_at_column
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_database_updated_at_column"();
CREATE FUNCTION "workplace"."update_database_updated_at_column"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.database_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_database_updated_at_column"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_design_max_seq
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_design_max_seq"();
CREATE FUNCTION "workplace"."update_design_max_seq"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    UPDATE workplace.designs
    SET max_seq = (SELECT MAX(design_seq) 
                   FROM workplace.designs 
                   WHERE design_year = NEW.design_year)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_design_max_seq"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_last_rfid_scan_time
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_last_rfid_scan_time"();
CREATE FUNCTION "workplace"."update_last_rfid_scan_time"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
    UPDATE workplace.variant_serials AS vs
	SET
	stock_at = latest_scan.warehouse,
	last_rfid_scan_time = latest_scan.date_created
	FROM (
	SELECT date_created, warehouse, rfid_tag, serial_number
	FROM (
	    SELECT a.date_created, a.warehouse, b.rfid_tag, c.serial_number, 
	           ROW_NUMBER() OVER (PARTITION BY b.rfid_tag ORDER BY a.date_created DESC) AS rn
	    FROM (
	        SELECT id, date_created, warehouse, jsonb_array_elements(lines)::INT4 AS line_id
	        FROM inventory_cms.inventory_check_sheets
	    ) a
	    JOIN (
	        SELECT id AS line_id, element->>0 AS rfid_tag
	        FROM inventory_cms.inventory_check_lines, jsonb_array_elements(rfid_tags) AS element
	    ) b ON a.line_id = b.line_id
	    LEFT JOIN workplace.variant_serials as c ON c.final_encoded_barcode =  LOWER(b.rfid_tag)
	) sub
	WHERE rn = 1
	
	) AS latest_scan
	WHERE
	vs.final_encoded_barcode = LOWER(latest_scan.rfid_tag);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_last_rfid_scan_time"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_order_references_in_variant_serials
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_order_references_in_variant_serials"();
CREATE FUNCTION "workplace"."update_order_references_in_variant_serials"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
    UPDATE workplace.variant_serials AS wvs
    SET 
        order_reference = A.order_code,
        fulfillment_status_value = A.fulfillment_status_value
    FROM (
        WITH latest_line_items AS (
            SELECT 
                bli.*,
                ROW_NUMBER() OVER (PARTITION BY bli.serial_number ORDER BY bli.database_updated_at DESC) AS row_num
            FROM 
                bizflycrm.line_items AS bli
        )
        SELECT
            bsn.serial_number AS serial_number,
            serial_number_item ->> 'id' AS id,
            lli.barcode,
            bo.order_code,
            bo.fulfillment_status_value
        FROM
            latest_line_items AS lli
            LEFT JOIN bizflycrm.orders AS bo 
                ON lli.order_id = bo.id
            JOIN LATERAL jsonb_array_elements(
                CASE 
                    WHEN jsonb_typeof(lli.serial_number) = 'array' THEN lli.serial_number
                    WHEN jsonb_typeof(lli.serial_number) = 'object' THEN jsonb_build_array(lli.serial_number)
                    ELSE '[]'::jsonb
                END
            ) AS serial_number_item ON TRUE
            LEFT JOIN bizflycrm.serial_numbers AS bsn
                ON serial_number_item ->> 'id' = bsn.id  
        WHERE 
            bo.cancelled_status_value IN ('chưa', 'chưa hủy đơn hàng')
            AND lli.row_num = 1 
    ) AS A
    WHERE wvs.serial_number = A.serial_number;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_order_references_in_variant_serials"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_total_price
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_total_price"();
CREATE FUNCTION "workplace"."update_total_price"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Update the total_price in the designs table
    UPDATE workplace.design_details
    SET melee_total_price = (
        SELECT SUM(md.price * dmd.quantity)
        FROM workplace.design_melee_details dmd
        JOIN workplace.melee_diamonds md ON dmd.melee_diamond_id = md.id
        WHERE dmd.design_detail_id = NEW.design_detail_id
    )
    WHERE id = NEW.design_detail_id;

    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_total_price"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for validate_codes_pattern
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."validate_codes_pattern"();
CREATE FUNCTION "workplace"."validate_codes_pattern"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Validate the 'codes' column using a regex that allows letters (a-z, A-Z), numbers (0-9), and dashes (-)
    IF NEW.codes !~ '^([a-zA-Z0-9-]+)(\n[a-zA-Z0-9-]+)*$' THEN
        RAISE EXCEPTION 'Invalid codes pattern. Each line must only contain letters (a-z, A-Z), numbers (0-9), or dashes (-).';
    END IF;

    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."validate_codes_pattern"() OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."collections_id_seq"
OWNED BY "workplace"."collections"."id";
SELECT setval('"workplace"."collections_id_seq"', 97, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_details_id_seq"
OWNED BY "workplace"."design_details"."id";
SELECT setval('"workplace"."design_details_id_seq"', 3180, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_images_id_seq"
OWNED BY "workplace"."design_images"."id";
SELECT setval('"workplace"."design_images_id_seq"', 1675, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_melee_details_id_seq"
OWNED BY "workplace"."design_melee_details"."id";
SELECT setval('"workplace"."design_melee_details_id_seq"', 156, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_price_estimation_id_seq"
OWNED BY "workplace"."design_price_estimation"."id";
SELECT setval('"workplace"."design_price_estimation_id_seq"', 486, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"workplace"."design_products_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_products_id_seq1"
OWNED BY "workplace"."designs"."id";
SELECT setval('"workplace"."design_products_id_seq1"', 9369, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_set_id_seq"
OWNED BY "workplace"."design_set"."id";
SELECT setval('"workplace"."design_set_id_seq"', 111, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."diamomds_id_seq"
OWNED BY "workplace"."diamonds"."id";
SELECT setval('"workplace"."diamomds_id_seq"', 13993, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."diamond_price_list_id_seq"
OWNED BY "workplace"."diamond_price_list"."id";
SELECT setval('"workplace"."diamond_price_list_id_seq"', 263, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."ecom_360_id_seq"
OWNED BY "workplace"."ecom_360"."id";
SELECT setval('"workplace"."ecom_360_id_seq"', 188, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."ecom_old_products_id_seq"
OWNED BY "workplace"."ecom_old_products"."id";
SELECT setval('"workplace"."ecom_old_products_id_seq"', 745, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."hrv_locations_1_id_seq"
OWNED BY "workplace"."hrv_locations_1"."id";
SELECT setval('"workplace"."hrv_locations_1_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."jewelries_id_seq"
OWNED BY "workplace"."jewelries"."id";
SELECT setval('"workplace"."jewelries_id_seq"', 12364, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."materials_id_seq"
OWNED BY "workplace"."materials"."id";
SELECT setval('"workplace"."materials_id_seq"', 8, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."melee_diamonds_id_seq"
OWNED BY "workplace"."melee_diamonds"."id";
SELECT setval('"workplace"."melee_diamonds_id_seq"', 63, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."moissanite_id_seq"
OWNED BY "workplace"."moissanite"."id";
SELECT setval('"workplace"."moissanite_id_seq"', 183, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."moissanite_serials_id_seq"
OWNED BY "workplace"."moissanite_serials"."id";
SELECT setval('"workplace"."moissanite_serials_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."product_collections_id_seq"
OWNED BY "workplace"."haravan_collections"."id";
SELECT setval('"workplace"."product_collections_id_seq"', 17, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."products_id_seq"
OWNED BY "workplace"."products"."id";
SELECT setval('"workplace"."products_id_seq"', 6820, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."promotions_id_seq"
OWNED BY "workplace"."promotions"."id";
SELECT setval('"workplace"."promotions_id_seq"', 8, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."sets_id_seq"
OWNED BY "workplace"."sets"."id";
SELECT setval('"workplace"."sets_id_seq"', 32, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."size_details_id_seq"
OWNED BY "workplace"."size_details"."id";
SELECT setval('"workplace"."size_details_id_seq"', 291, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."submitted_codes_id_seq"
OWNED BY "workplace"."submitted_codes"."id";
SELECT setval('"workplace"."submitted_codes_id_seq"', 367, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."temporary_products_id_seq"
OWNED BY "workplace"."temporary_products"."id";
SELECT setval('"workplace"."temporary_products_id_seq"', 1355, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."temporary_products_web_id_seq"
OWNED BY "workplace"."temporary_products_web"."id";
SELECT setval('"workplace"."temporary_products_web_id_seq"', 36, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."variant_serials_id_seq"
OWNED BY "workplace"."variant_serials"."id";
SELECT setval('"workplace"."variant_serials_id_seq"', 7174, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."variants_id_seq"
OWNED BY "workplace"."variants"."id";
SELECT setval('"workplace"."variants_id_seq"', 5396, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."wedding_rings_id_seq"
OWNED BY "workplace"."wedding_rings"."id";
SELECT setval('"workplace"."wedding_rings_id_seq"', 433, true);

-- ----------------------------
-- Indexes structure for table _nc_m2m_haravan_collect_products
-- ----------------------------
CREATE INDEX "fk_haravan_co_products_0_kxecf3y_" ON "workplace"."_nc_m2m_haravan_collect_products" USING btree (
  "haravan_collections_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "fk_haravan_co_products_tl93hnbjtq" ON "workplace"."_nc_m2m_haravan_collect_products" USING btree (
  "products_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _nc_m2m_haravan_collect_products
-- ----------------------------
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "_nc_m2m_haravan_collect_products_pkey" PRIMARY KEY ("products_id", "haravan_collections_id");

-- ----------------------------
-- Triggers structure for table collections
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_collections" BEFORE UPDATE ON "workplace"."collections"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table collections
-- ----------------------------
ALTER TABLE "workplace"."collections" ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table design_details
-- ----------------------------
ALTER TABLE "workplace"."design_details" ADD CONSTRAINT "design_details_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table design_images
-- ----------------------------
CREATE TRIGGER "set_updated_at_design_images" BEFORE UPDATE ON "workplace"."design_images"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table design_images
-- ----------------------------
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "unique_design_color" UNIQUE ("design_id", "material_color");

-- ----------------------------
-- Primary Key structure for table design_images
-- ----------------------------
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "design_images_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table design_melee_details
-- ----------------------------
CREATE TRIGGER "trg_update_melee_total_price" AFTER INSERT OR UPDATE ON "workplace"."design_melee_details"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_total_price"();

-- ----------------------------
-- Primary Key structure for table design_melee_details
-- ----------------------------
ALTER TABLE "workplace"."design_melee_details" ADD CONSTRAINT "design_melee_details_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table design_price_estimation
-- ----------------------------
ALTER TABLE "workplace"."design_price_estimation" ADD CONSTRAINT "design_price_estimation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table design_set
-- ----------------------------
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table designs
-- ----------------------------
CREATE INDEX "designs_collections_id_index" ON "workplace"."designs" USING btree (
  "collections_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "unique_combination_constraint_design_code" ON "workplace"."designs" USING btree (
  "design_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "gender" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "diamond_holder" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "source" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "design_year" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "design_seq" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "variant_number" "pg_catalog"."int8_ops" ASC NULLS LAST
) WHERE design_type IS NOT NULL AND gender IS NOT NULL AND diamond_holder IS NOT NULL AND source IS NOT NULL AND design_year IS NOT NULL AND design_seq IS NOT NULL AND variant_number IS NOT NULL;

-- ----------------------------
-- Triggers structure for table designs
-- ----------------------------
CREATE TRIGGER "prevent_archived_status_change" BEFORE UPDATE ON "workplace"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_archived_update"();
CREATE TRIGGER "set_updated_at_workplace_designs" BEFORE UPDATE ON "workplace"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();
CREATE TRIGGER "trg_update_design_max_seq" AFTER INSERT OR UPDATE OF "design_year" ON "workplace"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_design_max_seq"();

-- ----------------------------
-- Uniques structure for table designs
-- ----------------------------
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_design_code" UNIQUE ("code");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_design_code_constraint" UNIQUE ("code");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_id_constraint" UNIQUE ("id");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_code_constraint" UNIQUE ("code");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "design_code_attributes_unique" UNIQUE ("design_type", "gender", "diamond_holder", "source", "design_year", "design_seq", "variant_number");

-- ----------------------------
-- Primary Key structure for table designs
-- ----------------------------
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "design_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table designs_temporary_products
-- ----------------------------
ALTER TABLE "workplace"."designs_temporary_products" ADD CONSTRAINT "designs_temporary_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table diamond_price_list
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_diamond_price_list" BEFORE UPDATE ON "workplace"."diamond_price_list"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table diamond_price_list
-- ----------------------------
ALTER TABLE "workplace"."diamond_price_list" ADD CONSTRAINT "diamond_price_list_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table diamonds
-- ----------------------------
CREATE INDEX "idx_variant_id_workplace_diamonds" ON "workplace"."diamonds" USING btree (
  "variant_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "unique_variant_id" ON "workplace"."diamonds" USING btree (
  "variant_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table diamonds
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_diamonds" BEFORE UPDATE ON "workplace"."diamonds"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table diamonds
-- ----------------------------
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "unique_diamond_barcode" UNIQUE ("barcode");

-- ----------------------------
-- Primary Key structure for table diamonds
-- ----------------------------
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "diamomds_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ecom_360
-- ----------------------------
ALTER TABLE "workplace"."ecom_360" ADD CONSTRAINT "ecom_360_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ecom_old_products
-- ----------------------------
ALTER TABLE "workplace"."ecom_old_products" ADD CONSTRAINT "ecom_old_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table haravan_collections
-- ----------------------------
ALTER TABLE "workplace"."haravan_collections" ADD CONSTRAINT "product_collections_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table hrv_locations_1
-- ----------------------------
ALTER TABLE "workplace"."hrv_locations_1" ADD CONSTRAINT "hrv_locations_1_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table jewelries
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_jewelries" BEFORE UPDATE ON "workplace"."jewelries"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table jewelries
-- ----------------------------
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "unique_barcode_jewelries" UNIQUE ("barcode");
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "jewelries_unique_variant_id" UNIQUE ("variant_id");

-- ----------------------------
-- Primary Key structure for table jewelries
-- ----------------------------
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "jewelries_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table materials
-- ----------------------------
ALTER TABLE "workplace"."materials" ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table melee_diamonds
-- ----------------------------
ALTER TABLE "workplace"."melee_diamonds" ADD CONSTRAINT "melee_diamonds_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table moissanite
-- ----------------------------
ALTER TABLE "workplace"."moissanite" ADD CONSTRAINT "unique_moissannite_sku_attributes" UNIQUE ("product_group", "shape", "length", "width", "color", "clarity", "fluorescence", "cut", "polish", "symmetry");
ALTER TABLE "workplace"."moissanite" ADD CONSTRAINT "moissanite_barcode_key" UNIQUE ("barcode");

-- ----------------------------
-- Primary Key structure for table moissanite
-- ----------------------------
ALTER TABLE "workplace"."moissanite" ADD CONSTRAINT "moissanite_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table moissanite_serials
-- ----------------------------
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "unique_final_encoded_rfid" UNIQUE ("final_encoded_rfid");

-- ----------------------------
-- Primary Key structure for table moissanite_serials
-- ----------------------------
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "moissanite_serials_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table products
-- ----------------------------
CREATE INDEX "fk_haravan_co_products_v88qytf5oz" ON "workplace"."products" USING btree (
  "haravan_collections_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "products_order_idx" ON "workplace"."products" USING btree (
  "nc_order" "pg_catalog"."numeric_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table products
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_products" BEFORE UPDATE ON "workplace"."products"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table products
-- ----------------------------
ALTER TABLE "workplace"."products" ADD CONSTRAINT "uniqe_product_id" UNIQUE ("haravan_product_id");
ALTER TABLE "workplace"."products" ADD CONSTRAINT "unique_design_id" UNIQUE ("design_id");

-- ----------------------------
-- Primary Key structure for table products
-- ----------------------------
ALTER TABLE "workplace"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table promotions
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_promotions" BEFORE UPDATE ON "workplace"."promotions"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table promotions
-- ----------------------------
ALTER TABLE "workplace"."promotions" ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table sets
-- ----------------------------
ALTER TABLE "workplace"."sets" ADD CONSTRAINT "sets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table size_details
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_size_details" BEFORE UPDATE ON "workplace"."size_details"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table size_details
-- ----------------------------
ALTER TABLE "workplace"."size_details" ADD CONSTRAINT "size_details_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table submitted_codes
-- ----------------------------
CREATE TRIGGER "check_codes_pattern" BEFORE INSERT OR UPDATE ON "workplace"."submitted_codes"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."validate_codes_pattern"();
CREATE TRIGGER "set_updated_at_workplace_submitted_codes" BEFORE UPDATE ON "workplace"."submitted_codes"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table submitted_codes
-- ----------------------------
ALTER TABLE "workplace"."submitted_codes" ADD CONSTRAINT "submitted_codes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table temporary_products
-- ----------------------------
CREATE TRIGGER "prevent_update_variant_serial_id_trigger" BEFORE UPDATE ON "workplace"."temporary_products"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_variant_serial_id"();

-- ----------------------------
-- Uniques structure for table temporary_products
-- ----------------------------
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "unique_lark_base_record_id" UNIQUE ("lark_base_record_id");
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_variant_serial_id_key" UNIQUE ("variant_serial_id");

-- ----------------------------
-- Primary Key structure for table temporary_products
-- ----------------------------
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table temporary_products_web
-- ----------------------------
ALTER TABLE "workplace"."temporary_products_web" ADD CONSTRAINT "temporary_products_web_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table temtab
-- ----------------------------
ALTER TABLE "workplace"."temtab" ADD CONSTRAINT "temtab_design_code_key" UNIQUE ("design_code");

-- ----------------------------
-- Indexes structure for table variant_serials
-- ----------------------------
CREATE INDEX "variant_serials_order_idx" ON "workplace"."variant_serials" USING btree (
  "nc_order" "pg_catalog"."numeric_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table variant_serials
-- ----------------------------
CREATE TRIGGER "prevent_update_final_encoded_barcode" BEFORE UPDATE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_final_encoded_barcode"();
CREATE TRIGGER "prevent_update_serial_number" BEFORE UPDATE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_serial_number"();
CREATE TRIGGER "prevent_update_variant_id" BEFORE DELETE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_variant_id"();
CREATE TRIGGER "set_updated_at_workplace_products" BEFORE UPDATE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();
CREATE TRIGGER "trigger_set_serial_number" BEFORE INSERT ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."set_serial_number"();

-- ----------------------------
-- Uniques structure for table variant_serials
-- ----------------------------
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "unique_serial_number" UNIQUE ("serial_number");
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "unique_final_encode_barcode" UNIQUE ("final_encoded_barcode");
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "unique_serial_number_final_encoded_barcode" UNIQUE ("serial_number", "final_encoded_barcode");

-- ----------------------------
-- Primary Key structure for table variant_serials
-- ----------------------------
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "variant_serials_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table variant_serials_lark
-- ----------------------------
ALTER TABLE "workplace"."variant_serials_lark" ADD CONSTRAINT "variant_serials_lark_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table variants
-- ----------------------------
CREATE INDEX "idx_harvan_variant_id_workplace_variants" ON "workplace"."variants" USING btree (
  "haravan_variant_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "variants_order_idx" ON "workplace"."variants" USING btree (
  "nc_order" "pg_catalog"."numeric_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table variants
-- ----------------------------
CREATE TRIGGER "prevent_update_barcode" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_barcode"();
CREATE TRIGGER "prevent_update_if_not_null_trigger" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_sku_attribtes"();
CREATE TRIGGER "set_updated_at_workplace_products" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();
CREATE TRIGGER "trigger_prevent_product_id_update" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "public"."prevent_product_id_update"();

-- ----------------------------
-- Uniques structure for table variants
-- ----------------------------
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "uniqe_variant_id" UNIQUE ("haravan_variant_id");
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "unique_sku" UNIQUE ("sku");
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "unique_sku_attributes" UNIQUE ("product_id", "category", "applique_material", "fineness", "material_color", "size_type", "ring_size");
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "unique_barcode" UNIQUE ("barcode");

-- ----------------------------
-- Primary Key structure for table variants
-- ----------------------------
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "variants_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table wedding_rings
-- ----------------------------
ALTER TABLE "workplace"."wedding_rings" ADD CONSTRAINT "wedding_rings_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table _nc_m2m_haravan_collect_products
-- ----------------------------
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "fk_haravan_co_products_8v31fxenpy" FOREIGN KEY ("products_id") REFERENCES "workplace"."products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "fk_haravan_co_products_q3phsaq_nx" FOREIGN KEY ("haravan_collections_id") REFERENCES "workplace"."haravan_collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_images
-- ----------------------------
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "design_images_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_melee_details
-- ----------------------------
ALTER TABLE "workplace"."design_melee_details" ADD CONSTRAINT "fk_design_detail" FOREIGN KEY ("design_detail_id") REFERENCES "workplace"."design_details" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_price_estimation
-- ----------------------------
ALTER TABLE "workplace"."design_price_estimation" ADD CONSTRAINT "design_price_estimation_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_set
-- ----------------------------
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "workplace"."sets" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table designs
-- ----------------------------
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "designs_wedding_ring_id_fkey" FOREIGN KEY ("wedding_ring_id") REFERENCES "workplace"."wedding_rings" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "fk_collection_designs_0ry69f9nc6" FOREIGN KEY ("collections_id") REFERENCES "workplace"."collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table diamonds
-- ----------------------------
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "diamonds_g1_collection_id_fkey" FOREIGN KEY ("g1_collection_id") REFERENCES "workplace"."haravan_collections" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ecom_360
-- ----------------------------
ALTER TABLE "workplace"."ecom_360" ADD CONSTRAINT "ecom_360_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "workplace"."products" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ecom_old_products
-- ----------------------------
ALTER TABLE "workplace"."ecom_old_products" ADD CONSTRAINT "ecom_old_products_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table jewelries
-- ----------------------------
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "fk_designs" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "fk_ring_pairs" FOREIGN KEY ("ring_pair_id") REFERENCES "workplace"."jewelries" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table moissanite_serials
-- ----------------------------
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "moissanite_serials_moissanite_id_fkey" FOREIGN KEY ("moissanite_id") REFERENCES "workplace"."moissanite" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table products
-- ----------------------------
ALTER TABLE "workplace"."products" ADD CONSTRAINT "fk_haravan_co_products_enlvmi264j" FOREIGN KEY ("haravan_collections_id") REFERENCES "workplace"."haravan_collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workplace"."products" ADD CONSTRAINT "fk_product_design" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table size_details
-- ----------------------------
ALTER TABLE "workplace"."size_details" ADD CONSTRAINT "fk_jewelries" FOREIGN KEY ("jewelry_id") REFERENCES "workplace"."jewelries" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table temporary_products
-- ----------------------------
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "fk_variant_serial" FOREIGN KEY ("variant_serial_id") REFERENCES "workplace"."variant_serials" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table variant_serials
-- ----------------------------
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "fk_variants_variant_serials" FOREIGN KEY ("variant_id") REFERENCES "workplace"."variants" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table variants
-- ----------------------------
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "fk_variants_products" FOREIGN KEY ("product_id") REFERENCES "workplace"."products" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
