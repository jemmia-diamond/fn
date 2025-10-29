/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : inventory

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:53
*/

CREATE SCHEMA IF NOT EXISTS "inventory";

-- ----------------------------
-- Table structure for inventory_check_sheets
-- ----------------------------
DROP TABLE IF EXISTS "inventory"."inventory_check_sheets";
CREATE TABLE "inventory"."inventory_check_sheets" (
  "id" uuid NOT NULL,
  "staff" numeric,
  "count_in_book" numeric,
  "count_for_real" numeric,
  "extra" numeric,
  "lines" jsonb,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "warehouse" varchar(255) COLLATE "pg_catalog"."default",
  "warehouse_id" numeric,
  "code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "inventory"."inventory_check_sheets" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for inventory_check_sheets_2024
-- ----------------------------
DROP TABLE IF EXISTS "inventory"."inventory_check_sheets_2024";
CREATE TABLE "inventory"."inventory_check_sheets_2024" (
  "id" uuid,
  "staff" numeric,
  "count_in_book" numeric,
  "count_for_real" numeric,
  "extra" numeric,
  "lines" jsonb,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "warehouse" varchar(255) COLLATE "pg_catalog"."default",
  "warehouse_id" numeric,
  "code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "inventory"."inventory_check_sheets_2024" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for rfid_tags_warehouse
-- ----------------------------
DROP TABLE IF EXISTS "inventory"."rfid_tags_warehouse";
CREATE TABLE "inventory"."rfid_tags_warehouse" (
  "id" uuid NOT NULL,
  "rfid_tag" varchar COLLATE "pg_catalog"."default",
  "warehouse" varchar COLLATE "pg_catalog"."default",
  "warehouse_id" numeric,
  "product_id" numeric,
  "varient_id" numeric,
  "count_in_book" numeric,
  "count_for_real" numeric,
  "count_extra_for_real" numeric,
  "varient_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "inventory"."rfid_tags_warehouse" OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table inventory_check_sheets
-- ----------------------------
ALTER TABLE "inventory"."inventory_check_sheets" ADD CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table rfid_tags_warehouse
-- ----------------------------
ALTER TABLE "inventory"."rfid_tags_warehouse" ADD CONSTRAINT "rfid_tags_warehouse_pkey" PRIMARY KEY ("id");
