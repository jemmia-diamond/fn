/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : gia

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:44
*/

CREATE SCHEMA IF NOT EXISTS "gia";


-- ----------------------------
-- Sequence structure for report_no_data_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "gia"."report_no_data_id_seq";
CREATE SEQUENCE "gia"."report_no_data_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "gia"."report_no_data_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for report_no_data
-- ----------------------------
DROP TABLE IF EXISTS "gia"."report_no_data";
CREATE TABLE "gia"."report_no_data" (
  "id" int8 NOT NULL DEFAULT nextval('"gia".report_no_data_id_seq'::regclass),
  "report_no" varchar(20) COLLATE "pg_catalog"."default" NOT NULL,
  "report_type" varchar(255) COLLATE "pg_catalog"."default",
  "report_dt" varchar(255) COLLATE "pg_catalog"."default",
  "shape" varchar(255) COLLATE "pg_catalog"."default",
  "measurements" varchar(255) COLLATE "pg_catalog"."default",
  "weight" varchar(255) COLLATE "pg_catalog"."default",
  "color_grade" varchar(255) COLLATE "pg_catalog"."default",
  "clarity_grade" varchar(255) COLLATE "pg_catalog"."default",
  "cut_grade" varchar(255) COLLATE "pg_catalog"."default",
  "depth" varchar(255) COLLATE "pg_catalog"."default",
  "table_size" varchar(255) COLLATE "pg_catalog"."default",
  "crown_angle" varchar(255) COLLATE "pg_catalog"."default",
  "crown_height" varchar(255) COLLATE "pg_catalog"."default",
  "pavilion_angle" varchar(255) COLLATE "pg_catalog"."default",
  "pavilion_depth" varchar(255) COLLATE "pg_catalog"."default",
  "star_length" varchar(255) COLLATE "pg_catalog"."default",
  "lower_half" varchar(255) COLLATE "pg_catalog"."default",
  "girdle" varchar(255) COLLATE "pg_catalog"."default",
  "culet" varchar(255) COLLATE "pg_catalog"."default",
  "polish" varchar(255) COLLATE "pg_catalog"."default",
  "symmetry" varchar(255) COLLATE "pg_catalog"."default",
  "fluorescence" varchar(255) COLLATE "pg_catalog"."default",
  "clarity_characteristics" varchar(255) COLLATE "pg_catalog"."default",
  "inscription" varchar(255) COLLATE "pg_catalog"."default",
  "encrypted_report_no" varchar(255) COLLATE "pg_catalog"."default",
  "simple_encrypted_report_no" varchar(255) COLLATE "pg_catalog"."default",
  "is_pdf_available" varchar(255) COLLATE "pg_catalog"."default",
  "pdf_url" varchar(255) COLLATE "pg_catalog"."default",
  "propimg" varchar(255) COLLATE "pg_catalog"."default",
  "digital_card" varchar(255) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "gia"."report_no_data" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "gia"."report_no_data_id_seq"
OWNED BY "gia"."report_no_data"."id";
SELECT setval('"gia"."report_no_data_id_seq"', 128693, true);

-- ----------------------------
-- Primary Key structure for table report_no_data
-- ----------------------------
ALTER TABLE "gia"."report_no_data" ADD CONSTRAINT "report_no_data_pkey" PRIMARY KEY ("id");
