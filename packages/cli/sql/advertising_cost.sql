/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : advertising_cost

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:01
*/
CREATE SCHEMA IF NOT EXISTS "advertising_cost";



-- ----------------------------
-- Table structure for platforms
-- ----------------------------
DROP TABLE IF EXISTS "advertising_cost"."platforms";
CREATE TABLE "advertising_cost"."platforms" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default",
  "channel" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "page_id" varchar COLLATE "pg_catalog"."default",
  "platform" varchar COLLATE "pg_catalog"."default",
  "area" varchar COLLATE "pg_catalog"."default",
  "updated_at" int8,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "advertising_cost"."platforms" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table platforms
-- ----------------------------
CREATE UNIQUE INDEX "ix_advertising_cost_platforms_id" ON "advertising_cost"."platforms" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_advertising_cost_platforms_uuid" ON "advertising_cost"."platforms" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table platforms
-- ----------------------------
ALTER TABLE "advertising_cost"."platforms" ADD CONSTRAINT "platforms_pkey" PRIMARY KEY ("uuid");
