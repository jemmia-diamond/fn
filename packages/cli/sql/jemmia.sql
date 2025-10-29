/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : jemmia

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:07
*/

CREATE SCHEMA IF NOT EXISTS "jemmia";

-- ----------------------------
-- Table structure for metadata
-- ----------------------------
DROP TABLE IF EXISTS "jemmia"."metadata";
CREATE TABLE "jemmia"."metadata" (
  "product_id" int4 NOT NULL,
  "variant_id" int4,
  "path_to_3dm" text COLLATE "pg_catalog"."default",
  "collection_drive" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "jemmia"."metadata" OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table metadata
-- ----------------------------
ALTER TABLE "jemmia"."metadata" ADD CONSTRAINT "metadata_pkey" PRIMARY KEY ("product_id");
