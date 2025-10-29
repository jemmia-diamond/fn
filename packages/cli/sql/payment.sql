/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : payment

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:32
*/

CREATE SCHEMA IF NOT EXISTS "payment";

-- ----------------------------
-- Table structure for manual_payments
-- ----------------------------
DROP TABLE IF EXISTS "payment"."manual_payments";
CREATE TABLE "payment"."manual_payments" (
  "uuid" uuid NOT NULL,
  "payment_type" varchar(255) COLLATE "pg_catalog"."default",
  "branch" varchar(255) COLLATE "pg_catalog"."default",
  "shipping_code" varchar(255) COLLATE "pg_catalog"."default",
  "send_date" timestamp(6),
  "receive_date" timestamp(6),
  "created_date" timestamp(6),
  "updated_date" timestamp(6),
  "bank_account" varchar(255) COLLATE "pg_catalog"."default",
  "bank_name" varchar(255) COLLATE "pg_catalog"."default",
  "transfer_amount" numeric(18,6),
  "transfer_note" text COLLATE "pg_catalog"."default",
  "haravan_order_id" int8,
  "haravan_order_name" varchar(255) COLLATE "pg_catalog"."default",
  "transfer_status" varchar(255) COLLATE "pg_catalog"."default",
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default",
  "misa_synced" bool NOT NULL DEFAULT false,
  "misa_sync_guid" varchar(255) COLLATE "pg_catalog"."default",
  "misa_sync_error_msg" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "payment"."manual_payments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for sepay_transaction
-- ----------------------------
DROP TABLE IF EXISTS "payment"."sepay_transaction";
CREATE TABLE "payment"."sepay_transaction" (
  "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "bank_brand_name" varchar COLLATE "pg_catalog"."default",
  "account_number" varchar COLLATE "pg_catalog"."default",
  "transaction_date" varchar COLLATE "pg_catalog"."default",
  "amount_out" varchar COLLATE "pg_catalog"."default",
  "amount_in" varchar COLLATE "pg_catalog"."default",
  "accumulated" varchar COLLATE "pg_catalog"."default",
  "transaction_content" text COLLATE "pg_catalog"."default",
  "reference_number" varchar COLLATE "pg_catalog"."default",
  "code" varchar COLLATE "pg_catalog"."default",
  "sub_account" varchar COLLATE "pg_catalog"."default",
  "bank_account_id" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "payment"."sepay_transaction" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table manual_payments
-- ----------------------------
CREATE UNIQUE INDEX "manual_payments_lark_record_id_key" ON "payment"."manual_payments" USING btree (
  "lark_record_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "manual_payments_uuid_idx" ON "payment"."manual_payments" USING btree (
  "uuid" "pg_catalog"."uuid_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table manual_payments
-- ----------------------------
ALTER TABLE "payment"."manual_payments" ADD CONSTRAINT "manual_payments_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table sepay_transaction
-- ----------------------------
ALTER TABLE "payment"."sepay_transaction" ADD CONSTRAINT "sepay_transaction_pkey" PRIMARY KEY ("id");
