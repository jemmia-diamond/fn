/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : data_2024

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:26
*/

CREATE SCHEMA IF NOT EXISTS "data_2024";


-- ----------------------------
-- Table structure for hrv_inventory_locations
-- ----------------------------
DROP TABLE IF EXISTS "data_2024"."hrv_inventory_locations";
CREATE TABLE "data_2024"."hrv_inventory_locations" (
  "id" int4,
  "loc_id" int4,
  "product_id" int4,
  "variant_id" int4,
  "qty_onhand" int4,
  "qty_commited" int4,
  "qty_incoming" int4,
  "qty_available" int4,
  "updated_at" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "data_2024"."hrv_inventory_locations" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for mapping_first_channel
-- ----------------------------
DROP TABLE IF EXISTS "data_2024"."mapping_first_channel";
CREATE TABLE "data_2024"."mapping_first_channel" (
  "a" varchar(255) COLLATE "pg_catalog"."default",
  "b" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "data_2024"."mapping_first_channel" OWNER TO "neondb_owner";
