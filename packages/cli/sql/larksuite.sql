/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : larksuite

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:11
*/

CREATE SCHEMA IF NOT EXISTS "larksuite";

-- ----------------------------
-- Sequence structure for buyback_exchange_approval_instances_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "larksuite"."buyback_exchange_approval_instances_id_seq";
CREATE SEQUENCE "larksuite"."buyback_exchange_approval_instances_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "larksuite"."buyback_exchange_approval_instances_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for promotion_approval_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "larksuite"."promotion_approval_id_seq";
CREATE SEQUENCE "larksuite"."promotion_approval_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "larksuite"."promotion_approval_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for warehouse_inventories_lark_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "larksuite"."warehouse_inventories_lark_id_seq";
CREATE SEQUENCE "larksuite"."warehouse_inventories_lark_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "larksuite"."warehouse_inventories_lark_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for buyback_exchange_approval_instances
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."buyback_exchange_approval_instances";
CREATE TABLE "larksuite"."buyback_exchange_approval_instances" (
  "id" int4 NOT NULL DEFAULT nextval('"larksuite".buyback_exchange_approval_instances_id_seq'::regclass),
  "instance_code" varchar COLLATE "pg_catalog"."default",
  "serial_number" varchar COLLATE "pg_catalog"."default",
  "instance_type" varchar COLLATE "pg_catalog"."default",
  "order_code" varchar COLLATE "pg_catalog"."default",
  "new_order_code" varchar COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "phone_number" varchar COLLATE "pg_catalog"."default",
  "national_id" varchar COLLATE "pg_catalog"."default",
  "products_info" jsonb,
  "reason" varchar COLLATE "pg_catalog"."default",
  "refund_amount" numeric,
  "is_synced_to_crm" bool,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "submitted_date" timestamp(6)
)
;
ALTER TABLE "larksuite"."buyback_exchange_approval_instances" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for crm_lark_message
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."crm_lark_message";
CREATE TABLE "larksuite"."crm_lark_message" (
  "id" uuid NOT NULL,
  "parent_id" uuid,
  "crm_id" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "lark_message_id" varchar COLLATE "pg_catalog"."default",
  "order_data_item" json,
  "order_id" int8,
  "order_name" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "larksuite"."crm_lark_message" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for cskh
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."cskh";
CREATE TABLE "larksuite"."cskh" (
  "instance_code" text COLLATE "pg_catalog"."default",
  "instance_type" text COLLATE "pg_catalog"."default",
  "order_code" text COLLATE "pg_catalog"."default",
  "new_order_code" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default",
  "customer_name" text COLLATE "pg_catalog"."default",
  "phone_number" text COLLATE "pg_catalog"."default",
  "products_info" text COLLATE "pg_catalog"."default",
  "reason" text COLLATE "pg_catalog"."default",
  "refund_amount" float8,
  "submitted_date" timestamp(6)
)
;
ALTER TABLE "larksuite"."cskh" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for customer_appointments
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."customer_appointments";
CREATE TABLE "larksuite"."customer_appointments" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default",
  "lead_sale_name" varchar COLLATE "pg_catalog"."default",
  "lead_sale_email" varchar COLLATE "pg_catalog"."default",
  "suport_sale_name_list" text COLLATE "pg_catalog"."default",
  "suport_sale_email_list" text COLLATE "pg_catalog"."default",
  "store_name" varchar COLLATE "pg_catalog"."default",
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "customer_gender" varchar COLLATE "pg_catalog"."default",
  "channel" varchar COLLATE "pg_catalog"."default",
  "order_status" varchar COLLATE "pg_catalog"."default",
  "expected_visit_date" timestamp(6),
  "expected_visit_time_utc_plus_7" timestamp(6),
  "store_welcome_content" text COLLATE "pg_catalog"."default",
  "exchange_policy" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "budget_range" varchar COLLATE "pg_catalog"."default",
  "budget" numeric(36,8),
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "larksuite"."customer_appointments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."departments";
CREATE TABLE "larksuite"."departments" (
  "department_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "open_department_id" text COLLATE "pg_catalog"."default",
  "name" text COLLATE "pg_catalog"."default",
  "parent_department_id" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "larksuite"."departments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for groups
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."groups";
CREATE TABLE "larksuite"."groups" (
  "group_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "group_name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "larksuite"."groups" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for instances
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."instances";
CREATE TABLE "larksuite"."instances" (
  "uuid" text COLLATE "pg_catalog"."default" NOT NULL,
  "serial_number" text COLLATE "pg_catalog"."default",
  "instance_code" text COLLATE "pg_catalog"."default",
  "approval_code" text COLLATE "pg_catalog"."default",
  "approval_name" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default",
  "department_id" text COLLATE "pg_catalog"."default",
  "start_time" timestamp(6),
  "end_time" timestamp(6),
  "user_id" text COLLATE "pg_catalog"."default",
  "form" jsonb,
  "form_data" jsonb
)
;
ALTER TABLE "larksuite"."instances" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lark_line_items_payment
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."lark_line_items_payment";
CREATE TABLE "larksuite"."lark_line_items_payment" (
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "order_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "variant_id" varchar COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "larksuite"."lark_line_items_payment" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lark_order_qr_generator
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."lark_order_qr_generator";
CREATE TABLE "larksuite"."lark_order_qr_generator" (
  "haravan_order_id" int8 NOT NULL,
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "larksuite"."lark_order_qr_generator" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lark_variants
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."lark_variants";
CREATE TABLE "larksuite"."lark_variants" (
  "variant_id" int8 NOT NULL,
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "larksuite"."lark_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lark_warehouse_inventories
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."lark_warehouse_inventories";
CREATE TABLE "larksuite"."lark_warehouse_inventories" (
  "id" int4 NOT NULL DEFAULT nextval('"larksuite".warehouse_inventories_lark_id_seq'::regclass),
  "lark_record_id" varchar COLLATE "pg_catalog"."default",
  "qty_onhand" int8,
  "qty_committed" int8,
  "qty_available" int8,
  "qty_incoming" int8,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "larksuite"."lark_warehouse_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for promotion_approval
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."promotion_approval";
CREATE TABLE "larksuite"."promotion_approval" (
  "id" int4 NOT NULL DEFAULT nextval('"larksuite".promotion_approval_id_seq'::regclass),
  "order_code" varchar COLLATE "pg_catalog"."default",
  "reason" varchar COLLATE "pg_catalog"."default",
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "phone_number" varchar COLLATE "pg_catalog"."default",
  "order_amount" numeric,
  "order_request_discount" numeric,
  "is_synced_to_crm" bool DEFAULT false,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "submitted_date" timestamp(6),
  "instance_code" varchar COLLATE "pg_catalog"."default",
  "serial_number" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "larksuite"."promotion_approval" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for records
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."records";
CREATE TABLE "larksuite"."records" (
  "uuid" uuid NOT NULL,
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "table_id" text COLLATE "pg_catalog"."default",
  "app_token" text COLLATE "pg_catalog"."default",
  "fields" jsonb NOT NULL,
  "database_created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(3) NOT NULL
)
;
ALTER TABLE "larksuite"."records" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for shifts
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."shifts";
CREATE TABLE "larksuite"."shifts" (
  "shift_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "shift_name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "larksuite"."shifts" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for user_daily_shifts
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."user_daily_shifts";
CREATE TABLE "larksuite"."user_daily_shifts" (
  "day_no" int4 NOT NULL,
  "group_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "month" int4 NOT NULL,
  "shift_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "larksuite"."user_daily_shifts" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "larksuite"."users";
CREATE TABLE "larksuite"."users" (
  "user_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "open_id" text COLLATE "pg_catalog"."default",
  "union_id" text COLLATE "pg_catalog"."default",
  "name" text COLLATE "pg_catalog"."default",
  "en_name" text COLLATE "pg_catalog"."default",
  "email" text COLLATE "pg_catalog"."default",
  "enterprise_email" text COLLATE "pg_catalog"."default",
  "gender" int4,
  "city" text COLLATE "pg_catalog"."default",
  "country" text COLLATE "pg_catalog"."default",
  "department_ids" text[] COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "employee_no" text COLLATE "pg_catalog"."default",
  "employee_type" int4,
  "is_tenant_manager" bool,
  "job_title" text COLLATE "pg_catalog"."default",
  "join_time" int8,
  "leader_user_id" text COLLATE "pg_catalog"."default",
  "work_station" text COLLATE "pg_catalog"."default",
  "status_is_activated" bool,
  "status_is_exited" bool,
  "status_is_frozen" bool,
  "status_is_resigned" bool,
  "status_is_unjoin" bool,
  "avatar" jsonb
)
;
ALTER TABLE "larksuite"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "larksuite"."buyback_exchange_approval_instances_id_seq"
OWNED BY "larksuite"."buyback_exchange_approval_instances"."id";
SELECT setval('"larksuite"."buyback_exchange_approval_instances_id_seq"', 247816, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "larksuite"."promotion_approval_id_seq"
OWNED BY "larksuite"."promotion_approval"."id";
SELECT setval('"larksuite"."promotion_approval_id_seq"', 2, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "larksuite"."warehouse_inventories_lark_id_seq"
OWNED BY "larksuite"."lark_warehouse_inventories"."id";
SELECT setval('"larksuite"."warehouse_inventories_lark_id_seq"', 1, false);

-- ----------------------------
-- Uniques structure for table buyback_exchange_approval_instances
-- ----------------------------
ALTER TABLE "larksuite"."buyback_exchange_approval_instances" ADD CONSTRAINT "buyback_exchange_approval_instances_instance_code_key" UNIQUE ("instance_code");

-- ----------------------------
-- Primary Key structure for table buyback_exchange_approval_instances
-- ----------------------------
ALTER TABLE "larksuite"."buyback_exchange_approval_instances" ADD CONSTRAINT "buyback_exchange_approval_instances_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table crm_lark_message
-- ----------------------------
ALTER TABLE "larksuite"."crm_lark_message" ADD CONSTRAINT "crm_lark_message_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table customer_appointments
-- ----------------------------
CREATE UNIQUE INDEX "ix_larksuite_customer_appointments_id" ON "larksuite"."customer_appointments" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_larksuite_customer_appointments_uuid" ON "larksuite"."customer_appointments" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table customer_appointments
-- ----------------------------
ALTER TABLE "larksuite"."customer_appointments" ADD CONSTRAINT "customer_appointments_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Uniques structure for table departments
-- ----------------------------
ALTER TABLE "larksuite"."departments" ADD CONSTRAINT "departments_open_department_id_key" UNIQUE ("open_department_id");

-- ----------------------------
-- Primary Key structure for table departments
-- ----------------------------
ALTER TABLE "larksuite"."departments" ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id");

-- ----------------------------
-- Primary Key structure for table groups
-- ----------------------------
ALTER TABLE "larksuite"."groups" ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id");

-- ----------------------------
-- Uniques structure for table instances
-- ----------------------------
ALTER TABLE "larksuite"."instances" ADD CONSTRAINT "instances_serial_number_key" UNIQUE ("serial_number");
ALTER TABLE "larksuite"."instances" ADD CONSTRAINT "instances_instance_code_key" UNIQUE ("instance_code");

-- ----------------------------
-- Primary Key structure for table instances
-- ----------------------------
ALTER TABLE "larksuite"."instances" ADD CONSTRAINT "instances_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table lark_line_items_payment
-- ----------------------------
ALTER TABLE "larksuite"."lark_line_items_payment" ADD CONSTRAINT "lark_line_items_payment_pkey" PRIMARY KEY ("order_id", "variant_id");

-- ----------------------------
-- Primary Key structure for table lark_order_qr_generator
-- ----------------------------
ALTER TABLE "larksuite"."lark_order_qr_generator" ADD CONSTRAINT "lark_order_qr_generator_pkey" PRIMARY KEY ("haravan_order_id");

-- ----------------------------
-- Primary Key structure for table lark_variants
-- ----------------------------
ALTER TABLE "larksuite"."lark_variants" ADD CONSTRAINT "lark_variants_pkey" PRIMARY KEY ("variant_id");

-- ----------------------------
-- Indexes structure for table lark_warehouse_inventories
-- ----------------------------
CREATE UNIQUE INDEX "ix_larksuite_warehouse_inventories_lark_id" ON "larksuite"."lark_warehouse_inventories" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table lark_warehouse_inventories
-- ----------------------------
ALTER TABLE "larksuite"."lark_warehouse_inventories" ADD CONSTRAINT "warehouse_inventories_lark_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table promotion_approval
-- ----------------------------
ALTER TABLE "larksuite"."promotion_approval" ADD CONSTRAINT "instance_code_unique" UNIQUE ("instance_code");

-- ----------------------------
-- Primary Key structure for table promotion_approval
-- ----------------------------
ALTER TABLE "larksuite"."promotion_approval" ADD CONSTRAINT "promotion_approval_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table records
-- ----------------------------
CREATE UNIQUE INDEX "records_record_id_key" ON "larksuite"."records" USING btree (
  "record_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table records
-- ----------------------------
ALTER TABLE "larksuite"."records" ADD CONSTRAINT "records_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table shifts
-- ----------------------------
ALTER TABLE "larksuite"."shifts" ADD CONSTRAINT "shifts_pkey" PRIMARY KEY ("shift_id");

-- ----------------------------
-- Primary Key structure for table user_daily_shifts
-- ----------------------------
ALTER TABLE "larksuite"."user_daily_shifts" ADD CONSTRAINT "user_daily_shifts_pkey" PRIMARY KEY ("day_no", "group_id", "month", "user_id");

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "larksuite"."users" ADD CONSTRAINT "users_open_id_key" UNIQUE ("open_id");
ALTER TABLE "larksuite"."users" ADD CONSTRAINT "users_union_id_key" UNIQUE ("union_id");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "larksuite"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("user_id");
