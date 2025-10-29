/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 16:11:42
*/

CREATE SCHEMA IF NOT EXISTS "public";

-- ----------------------------
-- Function structure for update_database_updated_at_column
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."update_database_updated_at_column"();
CREATE FUNCTION "public"."update_database_updated_at_column"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.database_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."update_database_updated_at_column"() OWNER TO "neondb_owner";


-- ----------------------------
-- Function structure for prevent_product_id_update
-- ----------------------------
DROP FUNCTION IF EXISTS "public"."prevent_product_id_update"();
CREATE FUNCTION "public"."prevent_product_id_update"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Allow updates if the current product_id is NULL
    IF OLD.product_id IS NOT NULL AND NEW.product_id IS DISTINCT FROM OLD.product_id THEN
        RAISE EXCEPTION 'Updating product_id is not allowed unless it is currently NULL';
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "public"."prevent_product_id_update"() OWNER TO "neondb_owner";
