/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : market_data

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:16
*/

CREATE SCHEMA IF NOT EXISTS "market_data";

-- ----------------------------
-- Table structure for exchange_rate
-- ----------------------------
DROP TABLE IF EXISTS "market_data"."exchange_rate";
CREATE TABLE "market_data"."exchange_rate" (
  "time" timestamp(6) NOT NULL,
  "code" varchar COLLATE "pg_catalog"."default",
  "bank" varchar COLLATE "pg_catalog"."default",
  "buy" numeric,
  "sell" numeric,
  "transfer" numeric,
  "created_at" timestamp(6)
)
;
ALTER TABLE "market_data"."exchange_rate" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for gold_pricing
-- ----------------------------
DROP TABLE IF EXISTS "market_data"."gold_pricing";
CREATE TABLE "market_data"."gold_pricing" (
  "time" timestamp(6) NOT NULL,
  "type" varchar COLLATE "pg_catalog"."default",
  "buy" numeric,
  "sell" numeric,
  "created_at" timestamptz(6)
)
;
ALTER TABLE "market_data"."gold_pricing" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table exchange_rate
-- ----------------------------
CREATE INDEX "exchange_rate_time_idx" ON "market_data"."exchange_rate" USING btree (
  "time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Triggers structure for table exchange_rate
-- ----------------------------
CREATE TRIGGER "ts_insert_blocker" BEFORE INSERT ON "market_data"."exchange_rate"
FOR EACH ROW
EXECUTE PROCEDURE "_timescaledb_functions"."insert_blocker"();

-- ----------------------------
-- Indexes structure for table gold_pricing
-- ----------------------------
CREATE INDEX "gold_pricing_time_idx" ON "market_data"."gold_pricing" USING btree (
  "time" "pg_catalog"."timestamp_ops" DESC NULLS FIRST
);

-- ----------------------------
-- Triggers structure for table gold_pricing
-- ----------------------------
CREATE TRIGGER "ts_insert_blocker" BEFORE INSERT ON "market_data"."gold_pricing"
FOR EACH ROW
EXECUTE PROCEDURE "_timescaledb_functions"."insert_blocker"();
