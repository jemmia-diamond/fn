/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : inventory_cms

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:58
*/

CREATE SCHEMA IF NOT EXISTS "inventory_cms";

-- ----------------------------
-- Table structure for inventory_check_lines
-- ----------------------------
DROP TABLE IF EXISTS "inventory_cms"."inventory_check_lines";
CREATE TABLE "inventory_cms"."inventory_check_lines" (
  "uuid" uuid NOT NULL,
  "id" int4 NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "sort" text COLLATE "pg_catalog"."default",
  "user_created" text COLLATE "pg_catalog"."default",
  "date_created" timestamp(3),
  "user_updated" text COLLATE "pg_catalog"."default",
  "date_updated" timestamp(3),
  "product_name" text COLLATE "pg_catalog"."default",
  "product_id" text COLLATE "pg_catalog"."default",
  "variant_id" int4,
  "count_in_book" int4,
  "count_for_real" int4,
  "checked_status" text COLLATE "pg_catalog"."default",
  "sheet_id" int4,
  "variant_name" text COLLATE "pg_catalog"."default",
  "product_image" text COLLATE "pg_catalog"."default",
  "sku" text COLLATE "pg_catalog"."default",
  "count_extra_for_real" int4,
  "barcode" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default",
  "count_in_ordered" text COLLATE "pg_catalog"."default",
  "rfid_tags" jsonb
)
;
ALTER TABLE "inventory_cms"."inventory_check_lines" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for inventory_check_sheets
-- ----------------------------
DROP TABLE IF EXISTS "inventory_cms"."inventory_check_sheets";
CREATE TABLE "inventory_cms"."inventory_check_sheets" (
  "uuid" uuid NOT NULL,
  "id" int4 NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "sort" text COLLATE "pg_catalog"."default",
  "user_created" text COLLATE "pg_catalog"."default",
  "date_created" timestamp(3),
  "user_updated" text COLLATE "pg_catalog"."default",
  "date_updated" timestamp(3),
  "warehouse" text COLLATE "pg_catalog"."default",
  "staff" int4,
  "result" text COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default",
  "warehouse_id" text COLLATE "pg_catalog"."default",
  "count_in_book" int4,
  "count_for_real" int4,
  "extra" int4,
  "lines" jsonb
)
;
ALTER TABLE "inventory_cms"."inventory_check_sheets" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table inventory_check_lines
-- ----------------------------
CREATE UNIQUE INDEX "inventory_check_lines_id_key" ON "inventory_cms"."inventory_check_lines" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table inventory_check_lines
-- ----------------------------
ALTER TABLE "inventory_cms"."inventory_check_lines" ADD CONSTRAINT "inventory_check_lines_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table inventory_check_sheets
-- ----------------------------
CREATE UNIQUE INDEX "inventory_check_sheets_id_key" ON "inventory_cms"."inventory_check_sheets" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table inventory_check_sheets
-- ----------------------------
ALTER TABLE "inventory_cms"."inventory_check_sheets" ADD CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("uuid");
