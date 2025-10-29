/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : policy

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:37
*/

CREATE SCHEMA IF NOT EXISTS "policy";

-- ----------------------------
-- Table structure for purchase_exchange_policy
-- ----------------------------
DROP TABLE IF EXISTS "policy"."purchase_exchange_policy";
CREATE TABLE "policy"."purchase_exchange_policy" (
  "order_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "item_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "order_code" varchar(50) COLLATE "pg_catalog"."default",
  "sku" varchar(50) COLLATE "pg_catalog"."default",
  "item_name" varchar(255) COLLATE "pg_catalog"."default",
  "barcode" varchar(50) COLLATE "pg_catalog"."default",
  "policy_id" varchar(50) COLLATE "pg_catalog"."default",
  "policy_name" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "policy"."purchase_exchange_policy" OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table purchase_exchange_policy
-- ----------------------------
ALTER TABLE "policy"."purchase_exchange_policy" ADD CONSTRAINT "purchase_exchange_policy_pkey" PRIMARY KEY ("order_id", "item_id");
