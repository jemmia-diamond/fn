/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : rapnet

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:47
*/

CREATE SCHEMA IF NOT EXISTS "rapnet";

-- ----------------------------
-- Table structure for diamonds_dev
-- ----------------------------
DROP TABLE IF EXISTS "rapnet"."diamonds_dev";
CREATE TABLE "rapnet"."diamonds_dev" (
  "diamond_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "gia_report_no" varchar COLLATE "pg_catalog"."default",
  "price" numeric,
  "country" varchar COLLATE "pg_catalog"."default",
  "is_available" bool,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "gia_info" jsonb,
  "sent_event" jsonb,
  "shade" varchar COLLATE "pg_catalog"."default",
  "key_to_symbols" varchar COLLATE "pg_catalog"."default",
  "inclusions" varchar COLLATE "pg_catalog"."default",
  "diamond_data" jsonb
)
;
ALTER TABLE "rapnet"."diamonds_dev" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamonds_prod
-- ----------------------------
DROP TABLE IF EXISTS "rapnet"."diamonds_prod";
CREATE TABLE "rapnet"."diamonds_prod" (
  "diamond_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "gia_report_no" varchar COLLATE "pg_catalog"."default",
  "price" numeric,
  "country" varchar COLLATE "pg_catalog"."default",
  "is_available" bool,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "gia_info" jsonb,
  "sent_event" jsonb,
  "shade" varchar COLLATE "pg_catalog"."default",
  "key_to_symbols" varchar COLLATE "pg_catalog"."default",
  "inclusions" varchar COLLATE "pg_catalog"."default",
  "diamond_data" jsonb
)
;
ALTER TABLE "rapnet"."diamonds_prod" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_generate_v1
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_generate_v1"();
CREATE FUNCTION "rapnet"."uuid_generate_v1"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  STABLE
  AS $$
    SELECT uuid_generate_v1();
  $$;
ALTER FUNCTION "rapnet"."uuid_generate_v1"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_generate_v1mc
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_generate_v1mc"();
CREATE FUNCTION "rapnet"."uuid_generate_v1mc"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  STABLE
  AS $$
    SELECT uuid_generate_v1mc();
  $$;
ALTER FUNCTION "rapnet"."uuid_generate_v1mc"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_generate_v3
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_generate_v3"("namespace" uuid, "name" text);
CREATE FUNCTION "rapnet"."uuid_generate_v3"("namespace" uuid, "name" text)
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_generate_v3(namespace, name);
  $$;
ALTER FUNCTION "rapnet"."uuid_generate_v3"("namespace" uuid, "name" text) OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_generate_v4
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_generate_v4"();
CREATE FUNCTION "rapnet"."uuid_generate_v4"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  STABLE
  AS $$
    SELECT uuid_generate_v4();
  $$;
ALTER FUNCTION "rapnet"."uuid_generate_v4"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_generate_v5
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_generate_v5"("namespace" uuid, "name" text);
CREATE FUNCTION "rapnet"."uuid_generate_v5"("namespace" uuid, "name" text)
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_generate_v5(namespace, name);
  $$;
ALTER FUNCTION "rapnet"."uuid_generate_v5"("namespace" uuid, "name" text) OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_nil
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_nil"();
CREATE FUNCTION "rapnet"."uuid_nil"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_nil();
  $$;
ALTER FUNCTION "rapnet"."uuid_nil"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_ns_dns
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_ns_dns"();
CREATE FUNCTION "rapnet"."uuid_ns_dns"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_ns_dns();
  $$;
ALTER FUNCTION "rapnet"."uuid_ns_dns"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_ns_oid
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_ns_oid"();
CREATE FUNCTION "rapnet"."uuid_ns_oid"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_ns_oid();
  $$;
ALTER FUNCTION "rapnet"."uuid_ns_oid"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_ns_url
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_ns_url"();
CREATE FUNCTION "rapnet"."uuid_ns_url"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_ns_url();
  $$;
ALTER FUNCTION "rapnet"."uuid_ns_url"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for uuid_ns_x500
-- ----------------------------
DROP FUNCTION IF EXISTS "rapnet"."uuid_ns_x500"();
CREATE FUNCTION "rapnet"."uuid_ns_x500"()
  RETURNS "pg_catalog"."uuid"
  LANGUAGE sql
  IMMUTABLE
  STRICT
  AS $$
    SELECT uuid_ns_x500();
  $$;
ALTER FUNCTION "rapnet"."uuid_ns_x500"() OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table diamonds_dev
-- ----------------------------
ALTER TABLE "rapnet"."diamonds_dev" ADD CONSTRAINT "diamonds_dev_pkey" PRIMARY KEY ("diamond_id");

-- ----------------------------
-- Primary Key structure for table diamonds_prod
-- ----------------------------
ALTER TABLE "rapnet"."diamonds_prod" ADD CONSTRAINT "diamonds_prod_pkey" PRIMARY KEY ("diamond_id");
