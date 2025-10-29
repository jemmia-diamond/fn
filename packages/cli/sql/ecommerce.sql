/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : ecommerce

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:35
*/

CREATE SCHEMA IF NOT EXISTS "ecommerce";


-- ----------------------------
-- Table structure for order_tracking
-- ----------------------------
DROP TABLE IF EXISTS "ecommerce"."order_tracking";
CREATE TABLE "ecommerce"."order_tracking" (
  "uuid" uuid NOT NULL,
  "haravan_order_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "haravan_order_status" text COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "ecommerce"."order_tracking" OWNER TO "neondb_owner";

-- ----------------------------
-- Uniques structure for table order_tracking
-- ----------------------------
ALTER TABLE "ecommerce"."order_tracking" ADD CONSTRAINT "order_tracking_haravan_order_id_key" UNIQUE ("haravan_order_id", "haravan_order_status");

-- ----------------------------
-- Primary Key structure for table order_tracking
-- ----------------------------
ALTER TABLE "ecommerce"."order_tracking" ADD CONSTRAINT "order_tracking_pkey" PRIMARY KEY ("uuid");
