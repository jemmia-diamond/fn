/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : reporting

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:52
*/

CREATE SCHEMA IF NOT EXISTS "reporting";

-- ----------------------------
-- Sequence structure for time_dim_col_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "reporting"."time_dim_col_seq";
CREATE SEQUENCE "reporting"."time_dim_col_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "reporting"."time_dim_col_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for time_dim
-- ----------------------------
DROP TABLE IF EXISTS "reporting"."time_dim";
CREATE TABLE "reporting"."time_dim" (
  "col" int4 NOT NULL DEFAULT nextval('"reporting".time_dim_col_seq'::regclass),
  "day" timestamp(6)
)
;
ALTER TABLE "reporting"."time_dim" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "reporting"."time_dim_col_seq"
OWNED BY "reporting"."time_dim"."col";
SELECT setval('"reporting"."time_dim_col_seq"', 12420, true);

-- ----------------------------
-- Primary Key structure for table time_dim
-- ----------------------------
ALTER TABLE "reporting"."time_dim" ADD CONSTRAINT "time_dim_pkey" PRIMARY KEY ("col");
