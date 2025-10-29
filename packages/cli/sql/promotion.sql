/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : promotion

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:42
*/

CREATE SCHEMA IF NOT EXISTS "promotion";

-- ----------------------------
-- Table structure for order_promotion_analysis
-- ----------------------------
DROP TABLE IF EXISTS "promotion"."order_promotion_analysis";
CREATE TABLE "promotion"."order_promotion_analysis" (
  "uuid" uuid NOT NULL,
  "order_code" varchar COLLATE "pg_catalog"."default",
  "variant_id" int8,
  "price" int8,
  "promotion_name" varchar COLLATE "pg_catalog"."default",
  "priority_order" varchar COLLATE "pg_catalog"."default",
  "price_before_promotion" int8,
  "price_after_promotion" int8,
  "calculated_sale_price" int8,
  "actual_sale_price" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "promotion"."order_promotion_analysis" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for order_promotions
-- ----------------------------
DROP TABLE IF EXISTS "promotion"."order_promotions";
CREATE TABLE "promotion"."order_promotions" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "haravan_id" varchar(50) COLLATE "pg_catalog"."default",
  "order_code" varchar(50) COLLATE "pg_catalog"."default",
  "real_created_at" timestamp(6),
  "order_created_on" timestamp(6),
  "sub_total_price" numeric(36,8),
  "total_price" numeric(36,8),
  "updated_at" timestamp(6),
  "promotion_order" jsonb,
  "promotion_item" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "promotion"."order_promotions" OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table order_promotion_analysis
-- ----------------------------
ALTER TABLE "promotion"."order_promotion_analysis" ADD CONSTRAINT "order_promotion_analysis_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table order_promotions
-- ----------------------------
CREATE UNIQUE INDEX "ix_promotion_order_promotions_id" ON "promotion"."order_promotions" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table order_promotions
-- ----------------------------
ALTER TABLE "promotion"."order_promotions" ADD CONSTRAINT "order_promotions_pkey" PRIMARY KEY ("uuid");
