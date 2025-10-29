DROP EXTENSION IF EXISTS "timescaledb" CASCADE;
CREATE EXTENSION IF NOT EXISTS "timescaledb";

DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP EXTENSION IF EXISTS "vector" CASCADE;
CREATE EXTENSION IF NOT EXISTS "vector";

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

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : bizflycrm

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:07
*/
CREATE SCHEMA IF NOT EXISTS "bizflycrm";



-- ----------------------------
-- Table structure for allocations
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."allocations";
CREATE TABLE "bizflycrm"."allocations" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "total_amount" numeric(36,8),
  "allocation_amount" numeric(36,8),
  "allocation_amount_percent" numeric(36,8),
  "allocation_date" timestamp(6),
  "sale" jsonb,
  "order" jsonb,
  "customer" jsonb,
  "contract" jsonb,
  "created_by" jsonb,
  "status" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_at_system" timestamp(6),
  "_auto_id" int8,
  "sale_team" jsonb,
  "_related_department" jsonb,
  "piece" float8,
  "total_pieces" float8,
  "ngay_phan_bo" timestamp(6),
  "source" jsonb,
  "payload" jsonb,
  "order_id" varchar(50) COLLATE "pg_catalog"."default",
  "customer_id" varchar(50) COLLATE "pg_catalog"."default",
  "sale_id" varchar(50) COLLATE "pg_catalog"."default",
  "sale_name" varchar(255) COLLATE "pg_catalog"."default",
  "sale_team_id" varchar(50) COLLATE "pg_catalog"."default",
  "sale_team_value" varchar(255) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."allocations" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for calls
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."calls";
CREATE TABLE "bizflycrm"."calls" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "action" varchar COLLATE "pg_catalog"."default",
  "answer_time" timestamp(6),
  "bizfly_project_token" varchar COLLATE "pg_catalog"."default",
  "call_id" varchar COLLATE "pg_catalog"."default",
  "call_status" jsonb,
  "call_status_type" jsonb,
  "callee" jsonb,
  "caller" jsonb,
  "collection_key" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "created_at_system" timestamp(6),
  "customer_id" varchar COLLATE "pg_catalog"."default",
  "customer_phones" jsonb,
  "end_time" timestamp(6),
  "note" varchar COLLATE "pg_catalog"."default",
  "phone_call_id" varchar COLLATE "pg_catalog"."default",
  "project_id" varchar COLLATE "pg_catalog"."default",
  "related_id" jsonb,
  "run" int4,
  "sale" jsonb,
  "sale_phones" jsonb,
  "sale_team" jsonb,
  "status" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "payload" jsonb,
  "callee_value" varchar COLLATE "pg_catalog"."default",
  "caller_value" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."calls" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."customers";
CREATE TABLE "bizflycrm"."customers" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "_first_order" timestamp(6),
  "_last_order" timestamp(6),
  "_number_order" int4,
  "_order_value" numeric(36,8),
  "_order_value_in_year" numeric(36,8),
  "_paid_value" numeric(36,8),
  "_total_order_data_item" int4,
  "address1" varchar COLLATE "pg_catalog"."default",
  "bank_account_number" varchar(50) COLLATE "pg_catalog"."default",
  "bank_address" jsonb,
  "bank_branch" varchar COLLATE "pg_catalog"."default",
  "bank_name" varchar COLLATE "pg_catalog"."default",
  "city_name" varchar COLLATE "pg_catalog"."default",
  "company_address" varchar COLLATE "pg_catalog"."default",
  "company_name" varchar COLLATE "pg_catalog"."default",
  "country_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "created_at_system" timestamp(6),
  "cumulative_tov_buyback" numeric(36,8),
  "cumulative_tov_in_last_12mos" numeric(36,8),
  "cumulative_tov_lifetime" numeric(36,8),
  "cumulative_tov_recorded" numeric(36,8),
  "customer_rank" jsonb,
  "customer_type" jsonb,
  "customer_types" jsonb,
  "customer_vat_email" jsonb,
  "date_of_issuance" timestamp(6),
  "district_name" varchar COLLATE "pg_catalog"."default",
  "emails" jsonb,
  "first_channel" jsonb,
  "haravan_id" varchar COLLATE "pg_catalog"."default",
  "haravan_retailer" varchar COLLATE "pg_catalog"."default",
  "instagram_sender_id" varchar COLLATE "pg_catalog"."default",
  "link_blank" varchar COLLATE "pg_catalog"."default",
  "lists" jsonb,
  "loai_qua_tang" jsonb,
  "ma_khach_hang" varchar COLLATE "pg_catalog"."default",
  "ma_kich_hoat" varchar COLLATE "pg_catalog"."default",
  "name" jsonb,
  "ngay_tao_tai_khoan" timestamp(6),
  "past_order_value" numeric(36,8),
  "personal_id" varchar COLLATE "pg_catalog"."default",
  "phones" jsonb,
  "place_of_issuance" jsonb,
  "rd_address" varchar COLLATE "pg_catalog"."default",
  "rd_bizfly_bot_id" varchar COLLATE "pg_catalog"."default",
  "rd_first_assign_for" timestamp(6),
  "rd_first_phone_time" timestamp(6),
  "rd_gender" varchar COLLATE "pg_catalog"."default",
  "rd_last_phone_update_time" timestamp(6),
  "sale" jsonb,
  "source" jsonb,
  "status" varchar COLLATE "pg_catalog"."default",
  "tags" jsonb,
  "tax_code" varchar COLLATE "pg_catalog"."default",
  "tong_gia_tri_thu_mua_2" numeric(36,8),
  "updated_at" timestamp(6),
  "user_spam" bool,
  "utm_first_utm_source" jsonb,
  "ward_name" varchar COLLATE "pg_catalog"."default",
  "website" varchar COLLATE "pg_catalog"."default",
  "xung_ho" jsonb,
  "zalo_sender_id" varchar COLLATE "pg_catalog"."default",
  "_date_sinh_nhat" timestamp(6),
  "customer_passport" varchar COLLATE "pg_catalog"."default",
  "gioi_tinh" jsonb,
  "link_facebook" varchar COLLATE "pg_catalog"."default",
  "passport_date_of_issuance" timestamp(6),
  "passport_place_of_issuance" jsonb,
  "sinh_nhat" timestamp(6),
  "customer_journey" jsonb,
  "account" jsonb,
  "customer_referral" jsonb,
  "dia_chi" varchar COLLATE "pg_catalog"."default",
  "files" jsonb,
  "note" varchar COLLATE "pg_catalog"."default",
  "owner" jsonb,
  "rd_addresses" varchar COLLATE "pg_catalog"."default",
  "rd_tags" jsonb,
  "sale_team" jsonb,
  "utm_campaign" jsonb,
  "utm_content" jsonb,
  "utm_medium" jsonb,
  "utm_referer" jsonb,
  "utm_source" jsonb,
  "utm_term" jsonb,
  "app_first_login_date" timestamp(6),
  "_last_activity_time" timestamp(6),
  "_last_note_time" timestamp(6),
  "_utm_all" jsonb,
  "facebook_id_fp" varchar COLLATE "pg_catalog"."default",
  "facebook_sender_id" varchar COLLATE "pg_catalog"."default",
  "is_merge_item" bool,
  "linking_fanpage" jsonb,
  "rd_conversation_id" varchar COLLATE "pg_catalog"."default",
  "rd_first_fb_message_time" timestamp(6),
  "rd_first_name" varchar COLLATE "pg_catalog"."default",
  "rd_first_support_assign_for" varchar COLLATE "pg_catalog"."default",
  "rd_full_name" varchar COLLATE "pg_catalog"."default",
  "rd_last_fb_message_messenger_time" timestamp(6),
  "rd_owner_time" timestamp(6),
  "rd_user_id" varchar COLLATE "pg_catalog"."default",
  "rd_username" varchar COLLATE "pg_catalog"."default",
  "_first_time_assign_main_sale" timestamp(6),
  "_last_call_in_time" timestamp(6),
  "_last_call_out_time" timestamp(6),
  "_last_time_assign_main_sale" timestamp(6),
  "_related_department" jsonb,
  "chien_dich" varchar COLLATE "pg_catalog"."default",
  "created_by" jsonb,
  "customer_care_employee" jsonb,
  "customer_related" jsonb,
  "product" jsonb,
  "rd_last_assign_for" timestamp(6),
  "rd_last_message_time_old_user" timestamp(6),
  "rd_last_name" varchar COLLATE "pg_catalog"."default",
  "ref_types" jsonb,
  "utm_converted_last_utm_campaign" jsonb,
  "utm_converted_last_utm_content" jsonb,
  "utm_converted_last_utm_medium" jsonb,
  "utm_converted_last_utm_referer" jsonb,
  "utm_converted_last_utm_source" jsonb,
  "utm_converted_last_utm_term" jsonb,
  "utm_converted_utm_campaign" jsonb,
  "utm_converted_utm_medium" jsonb,
  "utm_converted_utm_referer" jsonb,
  "utm_converted_utm_source" jsonb,
  "utm_converted_utm_term" jsonb,
  "utm_first_utm_campaign" jsonb,
  "utm_first_utm_content" jsonb,
  "utm_first_utm_medium" jsonb,
  "utm_first_utm_referer" jsonb,
  "utm_first_utm_term" jsonb,
  "utm_last_utm_campaign" jsonb,
  "utm_last_utm_content" jsonb,
  "utm_last_utm_medium" jsonb,
  "utm_last_utm_referer" jsonb,
  "utm_last_utm_source" jsonb,
  "utm_last_utm_term" jsonb,
  "cumulative_tov_referral" numeric(36,8),
  "demotion_date" timestamp(6),
  "customer_status" jsonb,
  "sale_history" jsonb,
  "age_group" jsonb,
  "facebook_id" jsonb,
  "rd_fb_user_id" varchar COLLATE "pg_catalog"."default",
  "_recent_sale" jsonb,
  "_total_call_in" int4,
  "cumulative_tov_in_last_12_months" numeric(36,8),
  "cumulative_tov_unrecorded" numeric(36,8),
  "customer_birthday_update_pwa" timestamp(6),
  "customer_email_update_pwa" varchar COLLATE "pg_catalog"."default",
  "customer_vat_types" jsonb,
  "rd_last_zalo_messages_time" timestamp(6),
  "rd_page_active" varchar COLLATE "pg_catalog"."default",
  "tmp_unique" varchar COLLATE "pg_catalog"."default",
  "rd_ref_facebook" jsonb,
  "chi_tiet_don_hang_gioi_thieu" jsonb,
  "ads" jsonb,
  "_is_converted" int4,
  "customer_rank_label" varchar COLLATE "pg_catalog"."default",
  "customer_type_label" varchar COLLATE "pg_catalog"."default",
  "customer_types_label" varchar COLLATE "pg_catalog"."default",
  "first_channel_label" varchar COLLATE "pg_catalog"."default",
  "gioi_tinh_label" varchar COLLATE "pg_catalog"."default",
  "name_value" varchar COLLATE "pg_catalog"."default",
  "phone_value" varchar COLLATE "pg_catalog"."default",
  "owner_name" varchar COLLATE "pg_catalog"."default",
  "owner_id" varchar COLLATE "pg_catalog"."default",
  "sale_name" varchar COLLATE "pg_catalog"."default",
  "sale_id" varchar COLLATE "pg_catalog"."default",
  "age_group_label" varchar COLLATE "pg_catalog"."default",
  "place_of_issuance_label" varchar COLLATE "pg_catalog"."default",
  "customer_care_employee_name" varchar COLLATE "pg_catalog"."default",
  "passport_place_of_issuance_label" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "customer_opportunities" jsonb
)
;
ALTER TABLE "bizflycrm"."customers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for departments
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."departments";
CREATE TABLE "bizflycrm"."departments" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "_auto_id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_at_system" timestamp(6),
  "key" varchar COLLATE "pg_catalog"."default",
  "numerical_order" varchar COLLATE "pg_catalog"."default",
  "_first_time_assign_main_sale" varchar COLLATE "pg_catalog"."default",
  "_first_time_assign_sale" varchar COLLATE "pg_catalog"."default",
  "_last_time_assign_main_sale" varchar COLLATE "pg_catalog"."default",
  "_last_time_assign_sale" varchar COLLATE "pg_catalog"."default",
  "created_by" jsonb,
  "level_department" jsonb,
  "name" jsonb,
  "sale" jsonb,
  "list_sale" jsonb,
  "related_department_value" varchar COLLATE "pg_catalog"."default",
  "name_value" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."departments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for kpis
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."kpis";
CREATE TABLE "bizflycrm"."kpis" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "_auto_id" int4,
  "created_at" timestamp(6),
  "created_at_system" timestamp(6),
  "start_time" timestamp(6),
  "end_time" timestamp(6),
  "updated_at" timestamp(6),
  "_first_time_assign_main_sale" timestamp(6),
  "_first_time_assign_sale" timestamp(6),
  "_last_time_assign_main_sale" timestamp(6),
  "_last_time_assign_sale" timestamp(6),
  "sale_team" jsonb,
  "created_by" jsonb,
  "description" jsonb,
  "name" jsonb,
  "sale" jsonb,
  "sale_used" jsonb,
  "_related_department" jsonb,
  "norm_data_item" jsonb,
  "sale_data_item" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."kpis" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for line_items
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."line_items";
CREATE TABLE "bizflycrm"."line_items" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "order_id" varchar(50) COLLATE "pg_catalog"."default",
  "price_sale" numeric(36,8),
  "variant_id" varchar COLLATE "pg_catalog"."default",
  "bien_the_san_pham" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "sku" varchar COLLATE "pg_catalog"."default",
  "quantity" int8,
  "item_name" varchar COLLATE "pg_catalog"."default",
  "item_id" varchar COLLATE "pg_catalog"."default",
  "applied_discount" jsonb,
  "invoice_discount" jsonb,
  "amount" numeric(36,8),
  "order_detail_diamond" varchar COLLATE "pg_catalog"."default",
  "ten_sphd" varchar COLLATE "pg_catalog"."default",
  "thong_tin_size_tam" jsonb,
  "purity" jsonb,
  "unit" jsonb,
  "setting_weight" varchar COLLATE "pg_catalog"."default",
  "discount_percent" float8,
  "discount_value" numeric(36,8),
  "setting_color" jsonb,
  "promotion" jsonb,
  "product_status" jsonb,
  "buyback_price" numeric(36,8),
  "item_code" varchar COLLATE "pg_catalog"."default",
  "note" varchar COLLATE "pg_catalog"."default",
  "product_name" varchar COLLATE "pg_catalog"."default",
  "vat" float8,
  "other_price" numeric(36,8),
  "chitiet_goidichvu" jsonb,
  "goi_dichvu" jsonb,
  "discount" float8,
  "product_status_value" varchar COLLATE "pg_catalog"."default",
  "promotion_value" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "price" numeric(36,8),
  "serial_number" jsonb,
  "serial_number_value" varchar COLLATE "pg_catalog"."default",
  "serial_number_id" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "bizflycrm"."line_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."orders";
CREATE TABLE "bizflycrm"."orders" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "_allocation_value" numeric(36,8),
  "_auto_id" int8,
  "_first_time_assign_main_sale" timestamp(6),
  "_first_time_assign_sale" timestamp(6),
  "_last_note_time" timestamp(6),
  "_last_time_assign_main_sale" timestamp(6),
  "_last_time_assign_sale" timestamp(6),
  "_total_data_item" int4,
  "address1" varchar COLLATE "pg_catalog"."default",
  "allocated" int4,
  "bao_hanh" jsonb,
  "bonus_thanh_tien" numeric(36,8),
  "buyback_amount" numeric(36,8),
  "buyback_items" jsonb,
  "buyback_type" jsonb,
  "cancel_reason" varchar COLLATE "pg_catalog"."default",
  "cancelled_at" timestamp(6),
  "cancelled_status" jsonb,
  "channel" varchar COLLATE "pg_catalog"."default",
  "chiet_khau_san_pham" numeric(36,8),
  "chinh_sach_bao_hanh" jsonb,
  "city_name" varchar COLLATE "pg_catalog"."default",
  "confirm_order" varchar COLLATE "pg_catalog"."default",
  "consult_date" timestamp(6),
  "country_name" varchar COLLATE "pg_catalog"."default",
  "ward_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "created_at_system" timestamp(6),
  "customer" jsonb,
  "customer_type" jsonb,
  "da_thanh_toan" numeric(36,8),
  "delivered_date" timestamp(6),
  "delivery_location" jsonb,
  "delivery_locations" jsonb,
  "deposit_origination" jsonb,
  "district_name" varchar COLLATE "pg_catalog"."default",
  "expected_delivery_date" timestamp(6),
  "expected_payment_date" timestamp(6),
  "financial_complete_date" timestamp(6),
  "financial_status" jsonb,
  "fulfillment_status" jsonb,
  "haravan_confirmed_by" varchar(50) COLLATE "pg_catalog"."default",
  "haravan_created_by" varchar(50) COLLATE "pg_catalog"."default",
  "haravan_id" varchar(50) COLLATE "pg_catalog"."default",
  "haravan_retailer" varchar COLLATE "pg_catalog"."default",
  "is_bought_back" varchar COLLATE "pg_catalog"."default",
  "link_blank" varchar COLLATE "pg_catalog"."default",
  "location_name" varchar COLLATE "pg_catalog"."default",
  "ngay_tao_tai_khoan" timestamp(6),
  "note" text COLLATE "pg_catalog"."default",
  "order_amount" numeric(36,8),
  "order_channel" jsonb,
  "order_code" varchar COLLATE "pg_catalog"."default",
  "order_created_on" timestamp(6),
  "order_data_item" jsonb,
  "order_discount" numeric(36,8),
  "order_left_amount" numeric(36,8),
  "order_paid_amount" numeric(36,8),
  "order_pretax" numeric(36,8),
  "order_promotion" jsonb,
  "order_status" jsonb,
  "order_tax" numeric(36,8),
  "order_type" jsonb,
  "original_order" jsonb,
  "paid_amount_percentage" float8,
  "payload" jsonb,
  "payment_method_order" jsonb,
  "payment_status" jsonb,
  "phi_van_chuyen" numeric(36,8),
  "phieu_thu_mua" jsonb,
  "phone" jsonb,
  "phuong_thuc_thanh_toan" jsonb,
  "product_category" jsonb,
  "purpose" jsonb,
  "real_created_at" timestamp(6),
  "receipt_status" jsonb,
  "ref_order_date" timestamp(6),
  "ref_order_id" varchar(50) COLLATE "pg_catalog"."default",
  "ref_order_number" varchar COLLATE "pg_catalog"."default",
  "ref_reward" jsonb,
  "rule_trigger" jsonb,
  "sale" jsonb,
  "sale_team" jsonb,
  "shipping_address_company" varchar COLLATE "pg_catalog"."default",
  "shipping_address_name" varchar COLLATE "pg_catalog"."default",
  "source" jsonb,
  "status" varchar COLLATE "pg_catalog"."default",
  "tags" jsonb,
  "thoi_gian_giao_hang" timestamp(6),
  "tong_da_thanh_toan" numeric(36,8),
  "tong_gia_tri_don_hang" numeric(36,8),
  "tong_tien_hang" numeric(36,8),
  "total_discounts" numeric(36,8),
  "total_original_price" numeric(36,8),
  "updated_at" timestamp(6),
  "nguoi_gioi_thieu" jsonb,
  "bao_hanh_value" varchar COLLATE "pg_catalog"."default",
  "cancelled_status_value" varchar COLLATE "pg_catalog"."default",
  "customer_id" varchar(50) COLLATE "pg_catalog"."default",
  "customer_type_value" varchar COLLATE "pg_catalog"."default",
  "delivery_location_value" varchar COLLATE "pg_catalog"."default",
  "deposit_origination_value" varchar COLLATE "pg_catalog"."default",
  "financial_status_value" varchar COLLATE "pg_catalog"."default",
  "fulfillment_status_value" varchar COLLATE "pg_catalog"."default",
  "order_channel_value" varchar COLLATE "pg_catalog"."default",
  "order_status_value" varchar COLLATE "pg_catalog"."default",
  "order_type_label" varchar COLLATE "pg_catalog"."default",
  "order_type_value" varchar COLLATE "pg_catalog"."default",
  "order_type_id" varchar(50) COLLATE "pg_catalog"."default",
  "original_order_value" varchar COLLATE "pg_catalog"."default",
  "payment_method_order_value" varchar COLLATE "pg_catalog"."default",
  "payment_status_value" varchar COLLATE "pg_catalog"."default",
  "phone_value" varchar COLLATE "pg_catalog"."default",
  "phone_hide" varchar COLLATE "pg_catalog"."default",
  "phuong_thuc_thanh_toan_value" varchar COLLATE "pg_catalog"."default",
  "purpose_label" varchar COLLATE "pg_catalog"."default",
  "receipt_status_value" varchar COLLATE "pg_catalog"."default",
  "ref_reward_value" varchar COLLATE "pg_catalog"."default",
  "main_sale_id" varchar(50) COLLATE "pg_catalog"."default",
  "main_sale_name" varchar COLLATE "pg_catalog"."default",
  "nguoi_gioi_thieu_id" varchar(50) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "product_category_label" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "bizflycrm"."orders" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for orders_receipts
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."orders_receipts";
CREATE TABLE "bizflycrm"."orders_receipts" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "purchasing_order_erp_id" varchar(50) COLLATE "pg_catalog"."default",
  "customer" jsonb,
  "name" jsonb,
  "purchasing_types" jsonb,
  "purchasing_reason" jsonb,
  "purchasing_total" numeric(36,8),
  "purchasing_total_transfer" numeric(36,8),
  "purchasing_status" jsonb,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "thoi_gian_khach_ban_giao" timestamp(6),
  "chi_tiet_san_pham" jsonb,
  "created_at_system" timestamp(6),
  "status" varchar COLLATE "pg_catalog"."default",
  "created_by" jsonb,
  "source" jsonb,
  "_auto_id" int8,
  "order" jsonb,
  "purchasing_order_id" jsonb,
  "reference_order" varchar COLLATE "pg_catalog"."default",
  "sale" jsonb,
  "total_exchange_value" numeric(36,8),
  "payload" jsonb,
  "customer_value" varchar COLLATE "pg_catalog"."default",
  "customer_id" varchar COLLATE "pg_catalog"."default",
  "name_value" varchar COLLATE "pg_catalog"."default",
  "purchasing_types_label" varchar COLLATE "pg_catalog"."default",
  "purchasing_reason_value" varchar COLLATE "pg_catalog"."default",
  "purchasing_status_label" varchar COLLATE "pg_catalog"."default",
  "order_name" varchar COLLATE "pg_catalog"."default",
  "order_id" varchar COLLATE "pg_catalog"."default",
  "purchasing_order_id_value" varchar COLLATE "pg_catalog"."default",
  "purchasing_order_id_id" varchar COLLATE "pg_catalog"."default",
  "sale_id" varchar COLLATE "pg_catalog"."default",
  "sale_name" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."orders_receipts" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for payments
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."payments";
CREATE TABLE "bizflycrm"."payments" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "payment_amount" numeric(36,8),
  "payment_date" timestamp(6),
  "payment_method" jsonb,
  "order" jsonb,
  "customer" jsonb,
  "sale" jsonb,
  "sale_team" jsonb,
  "status" varchar COLLATE "pg_catalog"."default",
  "_auto_id" int8,
  "created_at" timestamp(6),
  "created_at_system" timestamp(6),
  "created_by" jsonb,
  "files" jsonb,
  "la_khoan_dat_coc_" jsonb,
  "updated_at" timestamp(6),
  "_related_department" jsonb,
  "payload" jsonb,
  "order_id" varchar(50) COLLATE "pg_catalog"."default",
  "customer_id" varchar(50) COLLATE "pg_catalog"."default",
  "sale_id" varchar(50) COLLATE "pg_catalog"."default",
  "sale_name" varchar(255) COLLATE "pg_catalog"."default",
  "sale_team_id" varchar(50) COLLATE "pg_catalog"."default",
  "sale_team_value" varchar(255) COLLATE "pg_catalog"."default",
  "files_link" varchar(255) COLLATE "pg_catalog"."default",
  "la_khoan_dat_coc_label" varchar(255) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."payments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for promotions
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."promotions";
CREATE TABLE "bizflycrm"."promotions" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "status" varchar(50) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_at_system" timestamp(6),
  "created_by" jsonb,
  "discount_percentage" float8,
  "promotion_description" jsonb,
  "sale" jsonb,
  "sale_team" jsonb,
  "type_of_promotion" jsonb,
  "customer" jsonb,
  "files" jsonb,
  "lists" jsonb,
  "name" jsonb,
  "priority_order" jsonb,
  "discount_group" jsonb,
  "discount_month" jsonb,
  "discount_duration" jsonb,
  "promotion_scope" jsonb,
  "discount_amount" int8,
  "department" jsonb,
  "start_date" timestamp(6),
  "end_date" timestamp(6),
  "promotion_description_value" text COLLATE "pg_catalog"."default",
  "sale_name" varchar COLLATE "pg_catalog"."default",
  "type_of_promotion_value" varchar COLLATE "pg_catalog"."default",
  "name_value" varchar COLLATE "pg_catalog"."default",
  "priority_order_label" varchar COLLATE "pg_catalog"."default",
  "discount_group_label" varchar COLLATE "pg_catalog"."default",
  "discount_month_label" varchar COLLATE "pg_catalog"."default",
  "discount_duration_label" varchar COLLATE "pg_catalog"."default",
  "department_label" varchar COLLATE "pg_catalog"."default",
  "promotion_scope_label" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."promotions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for serial_numbers
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."serial_numbers";
CREATE TABLE "bizflycrm"."serial_numbers" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "customer" jsonb,
  "status" varchar COLLATE "pg_catalog"."default",
  "_auto_id" int8,
  "availability" jsonb,
  "created_at" timestamp(6),
  "created_at_system" timestamp(6),
  "created_by" jsonb,
  "serial_number" varchar(50) COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "sale" jsonb,
  "sale_team" jsonb,
  "_first_time_assign_main_sale" timestamp(6),
  "_first_time_assign_sale" timestamp(6),
  "_last_time_assign_main_sale" timestamp(6),
  "_last_time_assign_sale" timestamp(6),
  "sku" varchar(50) COLLATE "pg_catalog"."default",
  "sub_sku" varchar(50) COLLATE "pg_catalog"."default",
  "availability_value" varchar(50) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."serial_numbers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "bizflycrm"."users";
CREATE TABLE "bizflycrm"."users" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "project_id" varchar COLLATE "pg_catalog"."default",
  "member_id" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "email" varchar COLLATE "pg_catalog"."default",
  "line" int4,
  "phone" varchar COLLATE "pg_catalog"."default",
  "member" jsonb,
  "my_id" varchar COLLATE "pg_catalog"."default",
  "is_root" int4,
  "blocked_by" varchar COLLATE "pg_catalog"."default",
  "stringee" varchar COLLATE "pg_catalog"."default",
  "vcc_call_center_hotline" varchar COLLATE "pg_catalog"."default",
  "vcc_call_center_number" varchar COLLATE "pg_catalog"."default",
  "group_role" jsonb,
  "group_role_new" jsonb,
  "selected_line" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "bizflycrm"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table allocations
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_allocations_id" ON "bizflycrm"."allocations" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table allocations
-- ----------------------------
ALTER TABLE "bizflycrm"."allocations" ADD CONSTRAINT "allocations_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table calls
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_calls_id" ON "bizflycrm"."calls" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table calls
-- ----------------------------
ALTER TABLE "bizflycrm"."calls" ADD CONSTRAINT "calls_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table customers
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_customers_id" ON "bizflycrm"."customers" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table customers
-- ----------------------------
ALTER TABLE "bizflycrm"."customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table departments
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_departments_id" ON "bizflycrm"."departments" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table departments
-- ----------------------------
ALTER TABLE "bizflycrm"."departments" ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table kpis
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_kpis_id" ON "bizflycrm"."kpis" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table kpis
-- ----------------------------
ALTER TABLE "bizflycrm"."kpis" ADD CONSTRAINT "kpis_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table line_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_line_items_id" ON "bizflycrm"."line_items" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table line_items
-- ----------------------------
ALTER TABLE "bizflycrm"."line_items" ADD CONSTRAINT "line_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table orders
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_orders_id" ON "bizflycrm"."orders" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table orders
-- ----------------------------
ALTER TABLE "bizflycrm"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table orders_receipts
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_orders_receipts_id" ON "bizflycrm"."orders_receipts" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table orders_receipts
-- ----------------------------
ALTER TABLE "bizflycrm"."orders_receipts" ADD CONSTRAINT "orders_receipts_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table payments
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_payments_id" ON "bizflycrm"."payments" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payments
-- ----------------------------
ALTER TABLE "bizflycrm"."payments" ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table promotions
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_promotions_id" ON "bizflycrm"."promotions" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table promotions
-- ----------------------------
ALTER TABLE "bizflycrm"."promotions" ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table serial_numbers
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_serial_numbers_id" ON "bizflycrm"."serial_numbers" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table serial_numbers
-- ----------------------------
ALTER TABLE "bizflycrm"."serial_numbers" ADD CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "ix_bizflycrm_users_id" ON "bizflycrm"."users" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "bizflycrm"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uuid");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : conversation_rate

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:12
*/
CREATE SCHEMA IF NOT EXISTS "conversation_rate";

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : crm_dashboard

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:17
*/

CREATE SCHEMA IF NOT EXISTS "crm_dashboard";

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : dashboard_reporting

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:22
*/

CREATE SCHEMA IF NOT EXISTS "dashboard_reporting";


-- ----------------------------
-- Sequence structure for time_dim_col_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "dashboard_reporting"."time_dim_col_seq";
CREATE SEQUENCE "dashboard_reporting"."time_dim_col_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "dashboard_reporting"."time_dim_col_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for time_dim
-- ----------------------------
DROP TABLE IF EXISTS "dashboard_reporting"."time_dim";
CREATE TABLE "dashboard_reporting"."time_dim" (
  "col" int4 NOT NULL DEFAULT nextval('"dashboard_reporting".time_dim_col_seq'::regclass),
  "day" timestamp(6)
)
;
ALTER TABLE "dashboard_reporting"."time_dim" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "dashboard_reporting"."time_dim_col_seq"
OWNED BY "dashboard_reporting"."time_dim"."col";
SELECT setval('"dashboard_reporting"."time_dim_col_seq"', 16074, true);

-- ----------------------------
-- Primary Key structure for table time_dim
-- ----------------------------
ALTER TABLE "dashboard_reporting"."time_dim" ADD CONSTRAINT "time_dim_pkey" PRIMARY KEY ("col");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : data_2024

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:26
*/

CREATE SCHEMA IF NOT EXISTS "data_2024";


-- ----------------------------
-- Table structure for hrv_inventory_locations
-- ----------------------------
DROP TABLE IF EXISTS "data_2024"."hrv_inventory_locations";
CREATE TABLE "data_2024"."hrv_inventory_locations" (
  "id" int4,
  "loc_id" int4,
  "product_id" int4,
  "variant_id" int4,
  "qty_onhand" int4,
  "qty_commited" int4,
  "qty_incoming" int4,
  "qty_available" int4,
  "updated_at" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "data_2024"."hrv_inventory_locations" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for mapping_first_channel
-- ----------------------------
DROP TABLE IF EXISTS "data_2024"."mapping_first_channel";
CREATE TABLE "data_2024"."mapping_first_channel" (
  "a" varchar(255) COLLATE "pg_catalog"."default",
  "b" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "data_2024"."mapping_first_channel" OWNER TO "neondb_owner";

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : ecom

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:31
*/

CREATE SCHEMA IF NOT EXISTS "ecom";


-- ----------------------------
-- Sequence structure for leads_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "ecom"."leads_id_seq";
CREATE SEQUENCE "ecom"."leads_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "ecom"."leads_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for leads
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."leads";
CREATE TABLE "ecom"."leads" (
  "id" int4 NOT NULL DEFAULT nextval('"ecom".leads_id_seq'::regclass),
  "raw_data" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "custom_uuid" text COLLATE "pg_catalog"."default" DEFAULT (gen_random_uuid())::text
)
;
ALTER TABLE "ecom"."leads" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."products";
CREATE TABLE "ecom"."products" (
  "haravan_product_id" int8,
  "haravan_product_type" text COLLATE "pg_catalog"."default",
  "design_id" int8,
  "handle" varchar COLLATE "pg_catalog"."default",
  "workplace_id" int4,
  "category" text COLLATE "pg_catalog"."default",
  "title" text COLLATE "pg_catalog"."default",
  "min_price" numeric,
  "max_price" numeric,
  "qty_onhand" int8,
  "image_updated_at" timestamp(6),
  "wedding_ring_id" int4,
  "primary_collection" text COLLATE "pg_catalog"."default",
  "primary_collection_handle" text COLLATE "pg_catalog"."default",
  "pages" text COLLATE "pg_catalog"."default",
  "max_price_18" int4,
  "max_price_14" int4
)
;
ALTER TABLE "ecom"."products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for qr_generator
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."qr_generator";
CREATE TABLE "ecom"."qr_generator" (
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "bank_code" varchar COLLATE "pg_catalog"."default",
  "bank_account_number" varchar COLLATE "pg_catalog"."default",
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "customer_phone_number" varchar COLLATE "pg_catalog"."default",
  "transfer_amount" int8,
  "transfer_note" varchar COLLATE "pg_catalog"."default",
  "transfer_status" varchar COLLATE "pg_catalog"."default",
  "haravan_order_number" varchar COLLATE "pg_catalog"."default",
  "haravan_order_status" varchar COLLATE "pg_catalog"."default",
  "haravan_order_id" int8,
  "haravan_order_total_price" int8,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamp(6),
  "is_deleted" bool,
  "qr_url" text COLLATE "pg_catalog"."default",
  "lark_record_id" varchar(255) COLLATE "pg_catalog"."default",
  "all_lark_record_id" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "ecom"."qr_generator" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variants
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."variants";
CREATE TABLE "ecom"."variants" (
  "hararvan_product_id" int8,
  "haravan_variant_id" int8,
  "sku" varchar COLLATE "pg_catalog"."default",
  "price" numeric,
  "price_compare_at" numeric(36,8),
  "material_color" text COLLATE "pg_catalog"."default",
  "fineness" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "haravan_product_id" int4
)
;
ALTER TABLE "ecom"."variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for wedding_rings
-- ----------------------------
DROP TABLE IF EXISTS "ecom"."wedding_rings";
CREATE TABLE "ecom"."wedding_rings" (
  "id" int4,
  "title" text COLLATE "pg_catalog"."default",
  "max_price" numeric,
  "min_price" numeric,
  "image_updated_at" timestamp(6)
)
;
ALTER TABLE "ecom"."wedding_rings" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "ecom"."leads_id_seq"
OWNED BY "ecom"."leads"."id";
SELECT setval('"ecom"."leads_id_seq"', 1977, true);

-- ----------------------------
-- Uniques structure for table leads
-- ----------------------------
ALTER TABLE "ecom"."leads" ADD CONSTRAINT "leads_custom_uuid_key" UNIQUE ("custom_uuid");

-- ----------------------------
-- Primary Key structure for table leads
-- ----------------------------
ALTER TABLE "ecom"."leads" ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table products
-- ----------------------------
ALTER TABLE "ecom"."products" ADD CONSTRAINT "products_unique_haravan_id" UNIQUE ("haravan_product_id");

-- ----------------------------
-- Indexes structure for table qr_generator
-- ----------------------------
CREATE INDEX "ix_ecom_qr_generator_id" ON "ecom"."qr_generator" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table qr_generator
-- ----------------------------
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table variants
-- ----------------------------
ALTER TABLE "ecom"."variants" ADD CONSTRAINT "unique_haravan_variant_id" UNIQUE ("haravan_variant_id");

-- ----------------------------
-- Uniques structure for table wedding_rings
-- ----------------------------
ALTER TABLE "ecom"."wedding_rings" ADD CONSTRAINT "wedding_rings_id_key" UNIQUE ("id");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : ecommerce

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:35
*/

CREATE SCHEMA IF NOT EXISTS "ecommerce";


-- ----------------------------
-- Table structure for order_tracking
-- ----------------------------
DROP TABLE IF EXISTS "ecommerce"."order_tracking";
CREATE TABLE "ecommerce"."order_tracking" (
  "uuid" uuid NOT NULL,
  "haravan_order_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "haravan_order_status" text COLLATE "pg_catalog"."default" NOT NULL
)
;
ALTER TABLE "ecommerce"."order_tracking" OWNER TO "neondb_owner";

-- ----------------------------
-- Uniques structure for table order_tracking
-- ----------------------------
ALTER TABLE "ecommerce"."order_tracking" ADD CONSTRAINT "order_tracking_haravan_order_id_key" UNIQUE ("haravan_order_id", "haravan_order_status");

-- ----------------------------
-- Primary Key structure for table order_tracking
-- ----------------------------
ALTER TABLE "ecommerce"."order_tracking" ADD CONSTRAINT "order_tracking_pkey" PRIMARY KEY ("uuid");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : erpnext

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:39
*/

CREATE SCHEMA IF NOT EXISTS "erpnext";


-- ----------------------------
-- Table structure for addresses
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."addresses";
CREATE TABLE "erpnext"."addresses" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "address_type" varchar(255) COLLATE "pg_catalog"."default",
  "address_name" varchar(255) COLLATE "pg_catalog"."default",
  "phone" varchar(255) COLLATE "pg_catalog"."default",
  "email_id" varchar(255) COLLATE "pg_catalog"."default",
  "address_line2" text COLLATE "pg_catalog"."default",
  "address_title" varchar(255) COLLATE "pg_catalog"."default",
  "city" varchar(255) COLLATE "pg_catalog"."default",
  "county" varchar(255) COLLATE "pg_catalog"."default",
  "state" varchar(255) COLLATE "pg_catalog"."default",
  "pincode" varchar(255) COLLATE "pg_catalog"."default",
  "country" varchar(255) COLLATE "pg_catalog"."default",
  "province" varchar(255) COLLATE "pg_catalog"."default",
  "district" varchar(255) COLLATE "pg_catalog"."default",
  "ward" varchar(255) COLLATE "pg_catalog"."default",
  "address_line1" text COLLATE "pg_catalog"."default",
  "fax" varchar(255) COLLATE "pg_catalog"."default",
  "tax_category" varchar(255) COLLATE "pg_catalog"."default",
  "is_primary_address" int4,
  "is_shipping_address" int4,
  "disabled" int4,
  "haravan_id" varchar(255) COLLATE "pg_catalog"."default",
  "is_your_company_address" int4,
  "links" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."addresses" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for contacts
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."contacts";
CREATE TABLE "erpnext"."contacts" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "salutation" varchar(50) COLLATE "pg_catalog"."default",
  "first_name" varchar(255) COLLATE "pg_catalog"."default",
  "address" varchar(255) COLLATE "pg_catalog"."default",
  "gender" varchar(20) COLLATE "pg_catalog"."default",
  "sync_with_google_contacts" int4,
  "middle_name" varchar(255) COLLATE "pg_catalog"."default",
  "full_name" varchar(255) COLLATE "pg_catalog"."default",
  "last_name" varchar(255) COLLATE "pg_catalog"."default",
  "user" varchar(255) COLLATE "pg_catalog"."default",
  "inserted_at" timestamp(6),
  "updated_at" timestamp(6),
  "haravan_customer_id" varchar(255) COLLATE "pg_catalog"."default",
  "lead_owner" varchar(255) COLLATE "pg_catalog"."default",
  "source_group" varchar(255) COLLATE "pg_catalog"."default",
  "source" varchar(255) COLLATE "pg_catalog"."default",
  "status" varchar(50) COLLATE "pg_catalog"."default",
  "designation" varchar(255) COLLATE "pg_catalog"."default",
  "phone" varchar(20) COLLATE "pg_catalog"."default",
  "email_id" varchar(255) COLLATE "pg_catalog"."default",
  "mobile_no" varchar(20) COLLATE "pg_catalog"."default",
  "company_name" varchar(255) COLLATE "pg_catalog"."default",
  "image" varchar(255) COLLATE "pg_catalog"."default",
  "source_name" varchar(255) COLLATE "pg_catalog"."default",
  "type" varchar(50) COLLATE "pg_catalog"."default",
  "first_message_time" timestamp(6),
  "last_message_time" timestamp(6),
  "phone_number_provided_time" timestamp(6),
  "department" varchar(255) COLLATE "pg_catalog"."default",
  "unsubscribed" int4,
  "last_outgoing_call_time" timestamp(6),
  "last_incoming_call_time" timestamp(6),
  "last_summarize_time" timestamp(6),
  "is_replied" int4,
  "pancake_conversation_id" varchar(255) COLLATE "pg_catalog"."default",
  "pancake_inserted_at" timestamp(6),
  "pancake_updated_at" timestamp(6),
  "pancake_customer_id" varchar(255) COLLATE "pg_catalog"."default",
  "thread_id" varchar(255) COLLATE "pg_catalog"."default",
  "psid" varchar(255) COLLATE "pg_catalog"."default",
  "can_inbox" int4,
  "pancake_page_id" varchar(255) COLLATE "pg_catalog"."default",
  "custom_uuid" varchar(255) COLLATE "pg_catalog"."default",
  "page_url" varchar(255) COLLATE "pg_catalog"."default",
  "user_agent" varchar(255) COLLATE "pg_catalog"."default",
  "remote_ip" varchar(255) COLLATE "pg_catalog"."default",
  "form_id" varchar(255) COLLATE "pg_catalog"."default",
  "form_name" varchar(255) COLLATE "pg_catalog"."default",
  "form_inserted_at" timestamp(6),
  "form_updated_at" timestamp(6),
  "stringee_id" varchar(255) COLLATE "pg_catalog"."default",
  "stringee_to_number" varchar(50) COLLATE "pg_catalog"."default",
  "stringee_from_number" varchar(50) COLLATE "pg_catalog"."default",
  "stringee_start_time" timestamp(6),
  "stringee_end_time" timestamp(6),
  "stringee_from_internal" int4,
  "stringee_to_internal" int4,
  "stringee_recorded" int4,
  "video_call" int4,
  "google_contacts" varchar(255) COLLATE "pg_catalog"."default",
  "google_contacts_id" varchar(255) COLLATE "pg_catalog"."default",
  "pulled_from_google_contacts" int4,
  "is_primary_contact" int4,
  "is_billing_contact" int4,
  "links" jsonb,
  "phone_numbers" jsonb,
  "phone_nos" jsonb,
  "emails" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."contacts" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."customers";
CREATE TABLE "erpnext"."customers" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "naming_series" varchar(255) COLLATE "pg_catalog"."default",
  "salutation" varchar(255) COLLATE "pg_catalog"."default",
  "customer_name" varchar(255) COLLATE "pg_catalog"."default",
  "customer_group" varchar(255) COLLATE "pg_catalog"."default",
  "bizfly_customer_number" varchar(255) COLLATE "pg_catalog"."default",
  "is_internal_customer" int4,
  "customer_type" varchar(255) COLLATE "pg_catalog"."default",
  "customer_rank" varchar(255) COLLATE "pg_catalog"."default",
  "account_manager" varchar(255) COLLATE "pg_catalog"."default",
  "lead_name" varchar(255) COLLATE "pg_catalog"."default",
  "opportunity_name" varchar(255) COLLATE "pg_catalog"."default",
  "territory" varchar(255) COLLATE "pg_catalog"."default",
  "prospect_name" varchar(255) COLLATE "pg_catalog"."default",
  "company_name" varchar(255) COLLATE "pg_catalog"."default",
  "no_of_employees" int4,
  "industry" varchar(255) COLLATE "pg_catalog"."default",
  "market_segment" varchar(255) COLLATE "pg_catalog"."default",
  "tax_number" varchar(255) COLLATE "pg_catalog"."default",
  "ceo_name" varchar(255) COLLATE "pg_catalog"."default",
  "personal_document_type" varchar(255) COLLATE "pg_catalog"."default",
  "birth_date" timestamp(6),
  "gender" varchar(255) COLLATE "pg_catalog"."default",
  "personal_id" varchar(255) COLLATE "pg_catalog"."default",
  "place_of_issuance" varchar(255) COLLATE "pg_catalog"."default",
  "person_name" varchar(255) COLLATE "pg_catalog"."default",
  "date_of_issuance" timestamp(6),
  "first_source" varchar(255) COLLATE "pg_catalog"."default",
  "customer_website" varchar(255) COLLATE "pg_catalog"."default",
  "customer_journey" varchar(255) COLLATE "pg_catalog"."default",
  "default_currency" varchar(255) COLLATE "pg_catalog"."default",
  "default_bank_account" varchar(255) COLLATE "pg_catalog"."default",
  "default_price_list" varchar(255) COLLATE "pg_catalog"."default",
  "represents_company" int4,
  "customer_pos_id" varchar(255) COLLATE "pg_catalog"."default",
  "website" varchar(255) COLLATE "pg_catalog"."default",
  "language" varchar(255) COLLATE "pg_catalog"."default",
  "customer_details" varchar(255) COLLATE "pg_catalog"."default",
  "customer_primary_address" varchar(255) COLLATE "pg_catalog"."default",
  "primary_address" varchar(1024) COLLATE "pg_catalog"."default",
  "image" varchar(255) COLLATE "pg_catalog"."default",
  "customer_primary_contact" varchar(255) COLLATE "pg_catalog"."default",
  "primary_contact" varchar(255) COLLATE "pg_catalog"."default",
  "mobile_no" varchar(255) COLLATE "pg_catalog"."default",
  "email_id" varchar(255) COLLATE "pg_catalog"."default",
  "phone" varchar(255) COLLATE "pg_catalog"."default",
  "invoice_type" varchar(255) COLLATE "pg_catalog"."default",
  "vat_email" varchar(255) COLLATE "pg_catalog"."default",
  "vat_name" varchar(255) COLLATE "pg_catalog"."default",
  "vat_address" varchar(255) COLLATE "pg_catalog"."default",
  "personal_tax_id" varchar(255) COLLATE "pg_catalog"."default",
  "bank_account" varchar(255) COLLATE "pg_catalog"."default",
  "payment_terms" varchar(255) COLLATE "pg_catalog"."default",
  "loyalty_program" varchar(255) COLLATE "pg_catalog"."default",
  "loyalty_program_tier" varchar(255) COLLATE "pg_catalog"."default",
  "rank" varchar(255) COLLATE "pg_catalog"."default",
  "purchase_amount_last_12_months" numeric(18,6),
  "rank_expired_date" timestamp(6),
  "priority_login_date" timestamp(6),
  "cumulative_revenue" numeric(18,6),
  "cashback" numeric(18,6),
  "true_cumulative_revenue" numeric(18,6),
  "withdraw_cashback" numeric(18,6),
  "referrals_revenue" numeric(18,6),
  "pending_cashback" numeric(18,6),
  "priority_bank_account" varchar(255) COLLATE "pg_catalog"."default",
  "default_sales_partner" varchar(255) COLLATE "pg_catalog"."default",
  "default_commission_rate" numeric(18,6),
  "so_required" int4,
  "dn_required" int4,
  "is_frozen" int4,
  "disabled" int2,
  "haravan_id" varchar(255) COLLATE "pg_catalog"."default",
  "bizfly_id" varchar(255) COLLATE "pg_catalog"."default",
  "tax_id" varchar(255) COLLATE "pg_catalog"."default",
  "tax_category" varchar(255) COLLATE "pg_catalog"."default",
  "tax_withholding_category" varchar(255) COLLATE "pg_catalog"."default",
  "account" jsonb,
  "portal_users" jsonb,
  "companies" jsonb,
  "sales_team" jsonb,
  "coupon_table" jsonb,
  "credit_limits" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."customers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for employees
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."employees";
CREATE TABLE "erpnext"."employees" (
  "uuid" uuid NOT NULL,
  "name" text COLLATE "pg_catalog"."default",
  "user_id" text COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "department" text COLLATE "pg_catalog"."default",
  "employee_name" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "modified" timestamp(6),
  "modified_by" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "erpnext"."employees" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lead_budgets
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."lead_budgets";
CREATE TABLE "erpnext"."lead_budgets" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "budget_label" varchar(255) COLLATE "pg_catalog"."default",
  "budget_from" numeric(18,6),
  "budget_to" numeric(18,6),
  "database_created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."lead_budgets" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lead_demands
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."lead_demands";
CREATE TABLE "erpnext"."lead_demands" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "demand_label" varchar(255) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."lead_demands" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for lead_sources
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."lead_sources";
CREATE TABLE "erpnext"."lead_sources" (
  "uuid" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "pancake_page_id" varchar COLLATE "pg_catalog"."default",
  "pancake_platform" varchar COLLATE "pg_catalog"."default",
  "source_name" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "erpnext"."lead_sources" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for leads
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."leads";
CREATE TABLE "erpnext"."leads" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "naming_series" varchar(255) COLLATE "pg_catalog"."default",
  "type" varchar(255) COLLATE "pg_catalog"."default",
  "salutation" varchar(255) COLLATE "pg_catalog"."default",
  "first_name" varchar(255) COLLATE "pg_catalog"."default",
  "middle_name" varchar(255) COLLATE "pg_catalog"."default",
  "territory" varchar(255) COLLATE "pg_catalog"."default",
  "lead_stage" varchar(100) COLLATE "pg_catalog"."default",
  "phone" varchar(20) COLLATE "pg_catalog"."default",
  "email_id" varchar(255) COLLATE "pg_catalog"."default",
  "job_title" varchar(255) COLLATE "pg_catalog"."default",
  "last_name" varchar(255) COLLATE "pg_catalog"."default",
  "gender" varchar(10) COLLATE "pg_catalog"."default",
  "qualified_lead_date" timestamp(6),
  "first_reach_at" timestamp(6),
  "lead_owner" varchar(255) COLLATE "pg_catalog"."default",
  "source" varchar(255) COLLATE "pg_catalog"."default",
  "status" varchar(50) COLLATE "pg_catalog"."default",
  "customer" varchar(255) COLLATE "pg_catalog"."default",
  "request_type" varchar(100) COLLATE "pg_catalog"."default",
  "lead_name" varchar(255) COLLATE "pg_catalog"."default",
  "lead_received_date" timestamp(6),
  "lead_source_name" varchar(255) COLLATE "pg_catalog"."default",
  "lead_source_platform" varchar(255) COLLATE "pg_catalog"."default",
  "qualification_status" varchar(255) COLLATE "pg_catalog"."default",
  "qualified_by" varchar(255) COLLATE "pg_catalog"."default",
  "qualified_on" timestamp(6),
  "purpose_lead" varchar(255) COLLATE "pg_catalog"."default",
  "expected_delivery_date" date,
  "budget_lead" varchar(255) COLLATE "pg_catalog"."default",
  "province" varchar(255) COLLATE "pg_catalog"."default",
  "region" varchar(255) COLLATE "pg_catalog"."default",
  "company_name" varchar(255) COLLATE "pg_catalog"."default",
  "no_of_employees" varchar(20) COLLATE "pg_catalog"."default",
  "annual_revenue" numeric,
  "industry" varchar(255) COLLATE "pg_catalog"."default",
  "market_segment" varchar(255) COLLATE "pg_catalog"."default",
  "fax" varchar(255) COLLATE "pg_catalog"."default",
  "tax_number" varchar(255) COLLATE "pg_catalog"."default",
  "ceo_name" varchar(255) COLLATE "pg_catalog"."default",
  "birth_date" date,
  "address" text COLLATE "pg_catalog"."default",
  "personal_tax_id" varchar(255) COLLATE "pg_catalog"."default",
  "first_channel" varchar(255) COLLATE "pg_catalog"."default",
  "personal_id" varchar(255) COLLATE "pg_catalog"."default",
  "place_of_issuance" varchar(255) COLLATE "pg_catalog"."default",
  "date_of_issuance" date,
  "website" varchar(255) COLLATE "pg_catalog"."default",
  "bank_name" varchar(255) COLLATE "pg_catalog"."default",
  "bank_branch" varchar(255) COLLATE "pg_catalog"."default",
  "account_number" varchar(255) COLLATE "pg_catalog"."default",
  "bank_province" varchar(255) COLLATE "pg_catalog"."default",
  "bank_district" varchar(255) COLLATE "pg_catalog"."default",
  "bank_ward" varchar(255) COLLATE "pg_catalog"."default",
  "campaign_name" varchar(255) COLLATE "pg_catalog"."default",
  "company" varchar(255) COLLATE "pg_catalog"."default",
  "website_from_data" varchar(255) COLLATE "pg_catalog"."default",
  "language" varchar(10) COLLATE "pg_catalog"."default",
  "image" text COLLATE "pg_catalog"."default",
  "title" varchar(255) COLLATE "pg_catalog"."default",
  "disabled" int4,
  "unsubscribed" int4,
  "blog_subscriber" int4,
  "mobile_no" varchar(20) COLLATE "pg_catalog"."default",
  "whatsapp_no" varchar(20) COLLATE "pg_catalog"."default",
  "phone_ext" varchar(20) COLLATE "pg_catalog"."default",
  "check_duplicate" varchar(255) COLLATE "pg_catalog"."default",
  "doctype" varchar(50) COLLATE "pg_catalog"."default",
  "notes" jsonb,
  "user_tags" jsonb,
  "preferred_product_type" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."leads" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for product_categories
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."product_categories";
CREATE TABLE "erpnext"."product_categories" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "title" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "erpnext"."product_categories" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for promotions
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."promotions";
CREATE TABLE "erpnext"."promotions" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "title" varchar(255) COLLATE "pg_catalog"."default",
  "scope" varchar(255) COLLATE "pg_catalog"."default",
  "is_active" int4,
  "is_expired" int4,
  "priority" varchar(255) COLLATE "pg_catalog"."default",
  "discount_type" varchar(255) COLLATE "pg_catalog"."default",
  "discount_amount" numeric(18,6),
  "discount_percent" numeric(18,6),
  "start_date" date,
  "end_date" date,
  "description" text COLLATE "pg_catalog"."default",
  "bizfly_id" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "erpnext"."promotions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for provinces
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."provinces";
CREATE TABLE "erpnext"."provinces" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "province_name" varchar(255) COLLATE "pg_catalog"."default",
  "region" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "database_created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."provinces" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_purposes
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."purchase_purposes";
CREATE TABLE "erpnext"."purchase_purposes" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "modified_by" varchar(255) COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "title" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "erpnext"."purchase_purposes" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for regions
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."regions";
CREATE TABLE "erpnext"."regions" (
  "uuid" uuid NOT NULL,
  "name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "owner" varchar(255) COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "modified" timestamp(6),
  "region_name" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "database_created_at" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "erpnext"."regions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for sales_order_notification_tracking
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."sales_order_notification_tracking";
CREATE TABLE "erpnext"."sales_order_notification_tracking" (
  "uuid" uuid NOT NULL,
  "order_name" text COLLATE "pg_catalog"."default" NOT NULL,
  "haravan_order_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "lark_message_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "database_created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(3) NOT NULL,
  "order_data" jsonb
)
;
ALTER TABLE "erpnext"."sales_order_notification_tracking" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for sales_orders
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."sales_orders";
CREATE TABLE "erpnext"."sales_orders" (
  "uuid" uuid NOT NULL,
  "name" text COLLATE "pg_catalog"."default",
  "owner" text COLLATE "pg_catalog"."default",
  "creation" timestamp(3),
  "modified" timestamp(3),
  "modified_by" text COLLATE "pg_catalog"."default",
  "docstatus" int4,
  "idx" int4,
  "title" text COLLATE "pg_catalog"."default",
  "naming_series" text COLLATE "pg_catalog"."default",
  "tax_id" text COLLATE "pg_catalog"."default",
  "order_type" text COLLATE "pg_catalog"."default",
  "skip_delivery_note" int4,
  "delivery_date" timestamp(3),
  "po_no" text COLLATE "pg_catalog"."default",
  "po_date" timestamp(3),
  "company" text COLLATE "pg_catalog"."default",
  "amended_from" text COLLATE "pg_catalog"."default",
  "customer_name" text COLLATE "pg_catalog"."default",
  "order_number" text COLLATE "pg_catalog"."default",
  "transaction_date" timestamp(3),
  "real_order_date" timestamp(3),
  "cancelled_status" text COLLATE "pg_catalog"."default",
  "financial_status" text COLLATE "pg_catalog"."default",
  "fulfillment_status" text COLLATE "pg_catalog"."default",
  "expected_delivery_date" timestamp(3),
  "cost_center" text COLLATE "pg_catalog"."default",
  "project" text COLLATE "pg_catalog"."default",
  "currency" text COLLATE "pg_catalog"."default",
  "conversion_rate" float8,
  "selling_price_list" text COLLATE "pg_catalog"."default",
  "price_list_currency" text COLLATE "pg_catalog"."default",
  "plc_conversion_rate" float8,
  "ignore_pricing_rule" int4,
  "scan_barcode" text COLLATE "pg_catalog"."default",
  "set_warehouse" text COLLATE "pg_catalog"."default",
  "reserve_stock" int4,
  "apply_discount_on" text COLLATE "pg_catalog"."default",
  "base_discount_amount" numeric(18,6),
  "coupon_code" text COLLATE "pg_catalog"."default",
  "additional_discount_percentage" numeric(18,6),
  "total_qty" int4,
  "total" numeric(18,6),
  "discount_amount" numeric(18,6),
  "grand_total" numeric(18,6),
  "base_total" numeric(18,6),
  "base_net_total" numeric(18,6),
  "total_net_weight" numeric(18,6),
  "net_total" numeric(18,6),
  "tax_category" text COLLATE "pg_catalog"."default",
  "taxes_and_charges" text COLLATE "pg_catalog"."default",
  "shipping_rule" text COLLATE "pg_catalog"."default",
  "incoterm" text COLLATE "pg_catalog"."default",
  "named_place" text COLLATE "pg_catalog"."default",
  "base_total_taxes_and_charges" numeric(18,6),
  "total_taxes_and_charges" numeric(18,6),
  "base_grand_total" numeric(18,6),
  "base_rounding_adjustment" numeric(18,6),
  "base_rounded_total" numeric(18,6),
  "base_in_words" text COLLATE "pg_catalog"."default",
  "rounding_adjustment" numeric(18,6),
  "rounded_total" numeric(18,6),
  "in_words" text COLLATE "pg_catalog"."default",
  "advance_paid" numeric(18,6),
  "disable_rounded_total" int4,
  "other_charges_calculation" text COLLATE "pg_catalog"."default",
  "contact_person" text COLLATE "pg_catalog"."default",
  "contact_display" text COLLATE "pg_catalog"."default",
  "contact_phone" text COLLATE "pg_catalog"."default",
  "contact_mobile" text COLLATE "pg_catalog"."default",
  "contact_email" text COLLATE "pg_catalog"."default",
  "customer_address" text COLLATE "pg_catalog"."default",
  "address_display" text COLLATE "pg_catalog"."default",
  "customer_group" text COLLATE "pg_catalog"."default",
  "territory" text COLLATE "pg_catalog"."default",
  "shipping_address_name" text COLLATE "pg_catalog"."default",
  "shipping_address" text COLLATE "pg_catalog"."default",
  "customer" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "customer_type" text COLLATE "pg_catalog"."default",
  "customer_personal_id" text COLLATE "pg_catalog"."default",
  "birth_date" timestamp(3),
  "date_of_issuance" timestamp(3),
  "dispatch_address" text COLLATE "pg_catalog"."default",
  "place_of_issuance" text COLLATE "pg_catalog"."default",
  "dispatch_address_name" text COLLATE "pg_catalog"."default",
  "company_address" text COLLATE "pg_catalog"."default",
  "company_address_display" text COLLATE "pg_catalog"."default",
  "company_contact_person" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default",
  "delivery_status" text COLLATE "pg_catalog"."default",
  "per_delivered" numeric(18,6),
  "per_billed" numeric(18,6),
  "per_picked" numeric(18,6),
  "billing_status" text COLLATE "pg_catalog"."default",
  "sales_partner" text COLLATE "pg_catalog"."default",
  "amount_eligible_for_commission" numeric(18,6),
  "commission_rate" numeric(18,6),
  "total_commission" numeric(18,6),
  "loyalty_points" int4,
  "loyalty_amount" numeric(18,6),
  "from_date" timestamp(3),
  "to_date" timestamp(3),
  "auto_repeat" text COLLATE "pg_catalog"."default",
  "letter_head" text COLLATE "pg_catalog"."default",
  "group_same_items" int4,
  "select_print_heading" text COLLATE "pg_catalog"."default",
  "language" text COLLATE "pg_catalog"."default",
  "is_internal_customer" int4,
  "represents_company" text COLLATE "pg_catalog"."default",
  "source" text COLLATE "pg_catalog"."default",
  "inter_company_order_reference" text COLLATE "pg_catalog"."default",
  "campaign" text COLLATE "pg_catalog"."default",
  "party_account_currency" text COLLATE "pg_catalog"."default",
  "total_amount" numeric(18,6),
  "expected_payment_date" timestamp(3),
  "paid_amount" numeric(18,6),
  "balance" numeric(18,6),
  "payment_terms_template" text COLLATE "pg_catalog"."default",
  "tc_name" text COLLATE "pg_catalog"."default",
  "terms" text COLLATE "pg_catalog"."default",
  "haravan_order_id" text COLLATE "pg_catalog"."default",
  "haravan_ref_order_id" text COLLATE "pg_catalog"."default",
  "haravan_created_at" timestamp(3),
  "source_name" text COLLATE "pg_catalog"."default",
  "sales_team" jsonb,
  "ref_sales_orders" jsonb,
  "promotions" jsonb,
  "product_categories" jsonb,
  "packed_items" jsonb,
  "taxes" jsonb,
  "pricing_rules" jsonb,
  "payment_records" jsonb,
  "payment_schedule" jsonb,
  "policies" jsonb,
  "items" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6),
  "consultation_date" date,
  "primary_sales_person" text COLLATE "pg_catalog"."default",
  "sales_order_purposes" jsonb,
  "debt_histories" jsonb
)
;
ALTER TABLE "erpnext"."sales_orders" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for sales_persons
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."sales_persons";
CREATE TABLE "erpnext"."sales_persons" (
  "uuid" uuid NOT NULL,
  "name" text COLLATE "pg_catalog"."default",
  "employee" text COLLATE "pg_catalog"."default",
  "bizfly_id" text COLLATE "pg_catalog"."default",
  "creation" timestamp(6),
  "department" text COLLATE "pg_catalog"."default",
  "enabled" int2,
  "is_group" int2,
  "modified" timestamp(6),
  "modified_by" text COLLATE "pg_catalog"."default",
  "old_parent" text COLLATE "pg_catalog"."default",
  "parent_sales_person" text COLLATE "pg_catalog"."default",
  "sales_person_name" text COLLATE "pg_catalog"."default",
  "sales_region" text COLLATE "pg_catalog"."default",
  "targets" jsonb
)
;
ALTER TABLE "erpnext"."sales_persons" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "erpnext"."users";
CREATE TABLE "erpnext"."users" (
  "uuid" uuid NOT NULL,
  "name" text COLLATE "pg_catalog"."default",
  "email" text COLLATE "pg_catalog"."default",
  "birth_date" timestamp(3),
  "creation" timestamp(6),
  "enabled" int2,
  "full_name" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "language" text COLLATE "pg_catalog"."default",
  "location" text COLLATE "pg_catalog"."default",
  "modified" timestamp(6),
  "modified_by" text COLLATE "pg_catalog"."default",
  "pancake_id" text COLLATE "pg_catalog"."default",
  "role_profile" text COLLATE "pg_catalog"."default",
  "time_zone" text COLLATE "pg_catalog"."default",
  "user_image" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "erpnext"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table addresses
-- ----------------------------
CREATE UNIQUE INDEX "addresses_name_key" ON "erpnext"."addresses" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table addresses
-- ----------------------------
ALTER TABLE "erpnext"."addresses" ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table contacts
-- ----------------------------
CREATE INDEX "contacts_name_idx" ON "erpnext"."contacts" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "contacts_name_key" ON "erpnext"."contacts" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table contacts
-- ----------------------------
ALTER TABLE "erpnext"."contacts" ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table customers
-- ----------------------------
CREATE INDEX "customers_customer_name_idx" ON "erpnext"."customers" USING btree (
  "customer_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "customers_haravan_id_idx" ON "erpnext"."customers" USING btree (
  "haravan_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "customers_name_idx" ON "erpnext"."customers" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "customers_name_key" ON "erpnext"."customers" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table customers
-- ----------------------------
ALTER TABLE "erpnext"."customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table employees
-- ----------------------------
CREATE UNIQUE INDEX "employees_name_key" ON "erpnext"."employees" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table employees
-- ----------------------------
ALTER TABLE "erpnext"."employees" ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table lead_budgets
-- ----------------------------
CREATE INDEX "lead_budgets_name_idx" ON "erpnext"."lead_budgets" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "lead_budgets_name_key" ON "erpnext"."lead_budgets" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table lead_budgets
-- ----------------------------
ALTER TABLE "erpnext"."lead_budgets" ADD CONSTRAINT "lead_budgets_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table lead_demands
-- ----------------------------
CREATE INDEX "lead_demands_name_idx" ON "erpnext"."lead_demands" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "lead_demands_name_key" ON "erpnext"."lead_demands" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table lead_demands
-- ----------------------------
ALTER TABLE "erpnext"."lead_demands" ADD CONSTRAINT "lead_demands_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Uniques structure for table lead_sources
-- ----------------------------
ALTER TABLE "erpnext"."lead_sources" ADD CONSTRAINT "lead_sources_name_key" UNIQUE ("name");

-- ----------------------------
-- Primary Key structure for table lead_sources
-- ----------------------------
ALTER TABLE "erpnext"."lead_sources" ADD CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table leads
-- ----------------------------
CREATE INDEX "leads_name_idx" ON "erpnext"."leads" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "leads_name_key" ON "erpnext"."leads" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table leads
-- ----------------------------
ALTER TABLE "erpnext"."leads" ADD CONSTRAINT "leads_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table product_categories
-- ----------------------------
CREATE INDEX "product_categories_name_idx" ON "erpnext"."product_categories" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "product_categories_name_key" ON "erpnext"."product_categories" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table product_categories
-- ----------------------------
ALTER TABLE "erpnext"."product_categories" ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table promotions
-- ----------------------------
CREATE INDEX "promotions_name_idx" ON "erpnext"."promotions" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "promotions_name_key" ON "erpnext"."promotions" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table promotions
-- ----------------------------
ALTER TABLE "erpnext"."promotions" ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table provinces
-- ----------------------------
CREATE INDEX "provinces_name_idx" ON "erpnext"."provinces" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "provinces_name_key" ON "erpnext"."provinces" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table provinces
-- ----------------------------
ALTER TABLE "erpnext"."provinces" ADD CONSTRAINT "provinces_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_purposes
-- ----------------------------
CREATE INDEX "purchase_purposes_name_idx" ON "erpnext"."purchase_purposes" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "purchase_purposes_name_key" ON "erpnext"."purchase_purposes" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_purposes
-- ----------------------------
ALTER TABLE "erpnext"."purchase_purposes" ADD CONSTRAINT "purchase_purposes_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table regions
-- ----------------------------
CREATE INDEX "regions_name_idx" ON "erpnext"."regions" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "regions_name_key" ON "erpnext"."regions" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table regions
-- ----------------------------
ALTER TABLE "erpnext"."regions" ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table sales_order_notification_tracking
-- ----------------------------
CREATE INDEX "sales_order_notification_tracking_haravan_order_id_idx" ON "erpnext"."sales_order_notification_tracking" USING btree (
  "haravan_order_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_order_notification_tracking_order_name_idx" ON "erpnext"."sales_order_notification_tracking" USING btree (
  "order_name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table sales_order_notification_tracking
-- ----------------------------
ALTER TABLE "erpnext"."sales_order_notification_tracking" ADD CONSTRAINT "sales_order_notification_tracking_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table sales_orders
-- ----------------------------
CREATE INDEX "sales_orders_cancelled_status_idx" ON "erpnext"."sales_orders" USING btree (
  "cancelled_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_customer_idx" ON "erpnext"."sales_orders" USING btree (
  "customer" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_customer_transaction_date_idx" ON "erpnext"."sales_orders" USING btree (
  "customer" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "transaction_date" "pg_catalog"."timestamp_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_delivery_status_idx" ON "erpnext"."sales_orders" USING btree (
  "delivery_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_financial_status_idx" ON "erpnext"."sales_orders" USING btree (
  "financial_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_fulfillment_status_idx" ON "erpnext"."sales_orders" USING btree (
  "fulfillment_status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_haravan_order_id_idx" ON "erpnext"."sales_orders" USING btree (
  "haravan_order_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "sales_orders_name_key" ON "erpnext"."sales_orders" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_order_number_idx" ON "erpnext"."sales_orders" USING btree (
  "order_number" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "sales_orders_status_idx" ON "erpnext"."sales_orders" USING btree (
  "status" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table sales_orders
-- ----------------------------
ALTER TABLE "erpnext"."sales_orders" ADD CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table sales_persons
-- ----------------------------
CREATE UNIQUE INDEX "sales_persons_name_key" ON "erpnext"."sales_persons" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table sales_persons
-- ----------------------------
ALTER TABLE "erpnext"."sales_persons" ADD CONSTRAINT "sales_persons_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "users_name_key" ON "erpnext"."users" USING btree (
  "name" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "erpnext"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uuid");

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

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : haravan

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:48
*/

CREATE SCHEMA IF NOT EXISTS "haravan";

-- ----------------------------
-- Sequence structure for test_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "haravan"."test_id_seq";
CREATE SEQUENCE "haravan"."test_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "haravan"."test_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for tests_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "haravan"."tests_id_seq";
CREATE SEQUENCE "haravan"."tests_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "haravan"."tests_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for collection_product
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."collection_product";
CREATE TABLE "haravan"."collection_product" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "collection_id" int8,
  "created_at" timestamp(6),
  "featured" bool,
  "position" int4,
  "product_id" int8,
  "sort_value" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."collection_product" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for custom_collections
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."custom_collections";
CREATE TABLE "haravan"."custom_collections" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "body_html" text COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "image" jsonb,
  "published" bool,
  "published_at" timestamp(6),
  "published_scope" varchar COLLATE "pg_catalog"."default",
  "sort_order" varchar COLLATE "pg_catalog"."default",
  "template_suffix" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "products_count" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."custom_collections" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."customers";
CREATE TABLE "haravan"."customers" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "accepts_marketing" bool,
  "default_address" jsonb,
  "addresses" jsonb,
  "address_address1" varchar COLLATE "pg_catalog"."default",
  "address_address2" varchar COLLATE "pg_catalog"."default",
  "address_city" varchar COLLATE "pg_catalog"."default",
  "address_company" varchar COLLATE "pg_catalog"."default",
  "address_country" varchar COLLATE "pg_catalog"."default",
  "address_country_code" varchar COLLATE "pg_catalog"."default",
  "address_id" int8,
  "address_first_name" varchar COLLATE "pg_catalog"."default",
  "address_last_name" varchar COLLATE "pg_catalog"."default",
  "address_phone" varchar COLLATE "pg_catalog"."default",
  "address_province" varchar COLLATE "pg_catalog"."default",
  "address_province_code" varchar COLLATE "pg_catalog"."default",
  "address_zip" varchar COLLATE "pg_catalog"."default",
  "address_name" varchar COLLATE "pg_catalog"."default",
  "address_default" bool,
  "address_district" varchar COLLATE "pg_catalog"."default",
  "address_district_code" varchar COLLATE "pg_catalog"."default",
  "address_ward" varchar COLLATE "pg_catalog"."default",
  "address_ward_code" varchar COLLATE "pg_catalog"."default",
  "email" varchar COLLATE "pg_catalog"."default",
  "phone" varchar COLLATE "pg_catalog"."default",
  "first_name" varchar COLLATE "pg_catalog"."default",
  "last_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "multipass_identifier" bool,
  "last_order_id" int8,
  "last_order_name" varchar COLLATE "pg_catalog"."default",
  "published" bool,
  "note" varchar COLLATE "pg_catalog"."default",
  "orders_count" int4,
  "state" varchar COLLATE "pg_catalog"."default",
  "tags" varchar COLLATE "pg_catalog"."default",
  "total_spent" numeric(36,8),
  "total_paid" numeric(36,8),
  "verified_email" bool,
  "group_name" varchar COLLATE "pg_catalog"."default",
  "birthday" timestamp(6),
  "gender" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."customers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for fulfillments
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."fulfillments";
CREATE TABLE "haravan"."fulfillments" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "order_id" int8,
  "status" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "tracking_company" varchar COLLATE "pg_catalog"."default",
  "tracking_company_code" varchar COLLATE "pg_catalog"."default",
  "tracking_numbers" jsonb,
  "tracking_number" varchar COLLATE "pg_catalog"."default",
  "tracking_url" varchar COLLATE "pg_catalog"."default",
  "tracking_urls" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."fulfillments" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for images
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."images";
CREATE TABLE "haravan"."images" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8 NOT NULL,
  "product_id" int4 NOT NULL,
  "src" varchar COLLATE "pg_catalog"."default",
  "position" int4,
  "filename" varchar COLLATE "pg_catalog"."default",
  "variant_ids" jsonb,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."images" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for inventory_logs
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."inventory_logs";
CREATE TABLE "haravan"."inventory_logs" (
  "id" int8 NOT NULL,
  "storeid" int8,
  "typeid" int8,
  "locid" int8,
  "refid" int8,
  "reflineid" int8,
  "refnumber" varchar COLLATE "pg_catalog"."default",
  "productid" int8,
  "variantid" int8,
  "qty_onhand" numeric,
  "qty_commited" numeric,
  "qty_incoming" numeric,
  "last_qty_onhand" numeric,
  "last_qty_onhand_loc" numeric,
  "last_qty_onhand_lot" numeric,
  "last_qty_commited" numeric,
  "last_qty_commited_loc" numeric,
  "last_macostamount" numeric,
  "costamount" numeric,
  "trandate" timestamp(6),
  "createddate" timestamp(6),
  "createduser" int8,
  "createdusername" varchar COLLATE "pg_catalog"."default",
  "locationname" varchar COLLATE "pg_catalog"."default",
  "trannumber" varchar COLLATE "pg_catalog"."default",
  "lotno" varchar COLLATE "pg_catalog"."default",
  "lotexpiredate" timestamp(6),
  "sku" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "producttypename" varchar COLLATE "pg_catalog"."default",
  "productvendorname" varchar COLLATE "pg_catalog"."default",
  "productname" varchar COLLATE "pg_catalog"."default",
  "optionvalue" varchar COLLATE "pg_catalog"."default",
  "reasonid" int8,
  "varianttitle" varchar COLLATE "pg_catalog"."default",
  "typename" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "haravan"."inventory_logs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for line_items
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."line_items";
CREATE TABLE "haravan"."line_items" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "order_id" int4,
  "fulfillable_quantity" int4,
  "fulfillment_service" varchar COLLATE "pg_catalog"."default",
  "fulfillment_status" varchar COLLATE "pg_catalog"."default",
  "grams" float8,
  "price" numeric(36,8),
  "price_original" numeric(36,8),
  "price_promotion" numeric(36,8),
  "product_id" int8,
  "quantity" int4,
  "requires_shipping" bool,
  "sku" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "variant_id" int8,
  "variant_title" varchar COLLATE "pg_catalog"."default",
  "vendor" varchar COLLATE "pg_catalog"."default",
  "type" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "gift_card" bool,
  "taxable" bool,
  "tax_lines" jsonb,
  "product_exists" bool,
  "barcode" varchar COLLATE "pg_catalog"."default",
  "properties" jsonb,
  "total_discount" numeric(36,8),
  "applied_discounts" jsonb,
  "image" jsonb,
  "not_allow_promotion" bool,
  "ma_cost_amount" float8,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."line_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."orders";
CREATE TABLE "haravan"."orders" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "billing_address_id" int8,
  "billing_address_address1" varchar COLLATE "pg_catalog"."default",
  "billing_address_address2" varchar COLLATE "pg_catalog"."default",
  "billing_address_city" varchar COLLATE "pg_catalog"."default",
  "billing_address_company" varchar COLLATE "pg_catalog"."default",
  "billing_address_country" varchar COLLATE "pg_catalog"."default",
  "billing_address_first_name" varchar COLLATE "pg_catalog"."default",
  "billing_address_last_name" varchar COLLATE "pg_catalog"."default",
  "billing_address_phone" varchar COLLATE "pg_catalog"."default",
  "billing_address_province" varchar COLLATE "pg_catalog"."default",
  "billing_address_zip" varchar COLLATE "pg_catalog"."default",
  "billing_address_name" varchar COLLATE "pg_catalog"."default",
  "billing_address_province_code" varchar COLLATE "pg_catalog"."default",
  "billing_address_country_code" varchar COLLATE "pg_catalog"."default",
  "billing_address_default" bool,
  "billing_address_district" varchar COLLATE "pg_catalog"."default",
  "billing_address_district_code" varchar COLLATE "pg_catalog"."default",
  "billing_address_ward" varchar COLLATE "pg_catalog"."default",
  "billing_address_ward_code" varchar COLLATE "pg_catalog"."default",
  "browser_ip" varchar COLLATE "pg_catalog"."default",
  "buyer_accepts_marketing" bool,
  "cancel_reason" varchar COLLATE "pg_catalog"."default",
  "cancelled_at" timestamp(6),
  "cart_token" varchar COLLATE "pg_catalog"."default",
  "checkout_token" varchar COLLATE "pg_catalog"."default",
  "client_details_accept_language" varchar COLLATE "pg_catalog"."default",
  "client_details_browser_height" int8,
  "client_details_browser_width" int8,
  "client_details_session_hash" varchar COLLATE "pg_catalog"."default",
  "client_details_user_agent" varchar COLLATE "pg_catalog"."default",
  "client_details_browser_ip" varchar COLLATE "pg_catalog"."default",
  "closed_at" timestamp(6),
  "created_at" timestamp(6),
  "currency" varchar COLLATE "pg_catalog"."default",
  "customer_id" int8,
  "customer_email" varchar COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "customer_first_name" varchar COLLATE "pg_catalog"."default",
  "customer_last_name" varchar COLLATE "pg_catalog"."default",
  "customer_multipass_identifier" varchar COLLATE "pg_catalog"."default",
  "customer_last_order_id" int8,
  "customer_last_order_name" varchar COLLATE "pg_catalog"."default",
  "customer_note" text COLLATE "pg_catalog"."default",
  "customer_order_count" int4,
  "customer_state" varchar COLLATE "pg_catalog"."default",
  "customer_tags" varchar COLLATE "pg_catalog"."default",
  "customer_total_spent" numeric(36,8),
  "customer_updated_at" timestamp(6),
  "customer_verified_email" bool,
  "customer_send_email_invite" bool,
  "customer_send_email_welcome" bool,
  "customer_password" varchar COLLATE "pg_catalog"."default",
  "customer_password_confirmation" varchar COLLATE "pg_catalog"."default",
  "customer_group_name" varchar COLLATE "pg_catalog"."default",
  "customer_birthday" varchar COLLATE "pg_catalog"."default",
  "customer_gender" varchar COLLATE "pg_catalog"."default",
  "customer_last_order_date" timestamp(6),
  "customer_default_address_id" int8,
  "customer_default_address_address1" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_address2" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_city" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_company" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_country" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_province" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_first_name" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_last_name" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_phone" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_province_code" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_country_code" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_default" bool,
  "customer_default_address_district" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_district_code" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_ward" varchar COLLATE "pg_catalog"."default",
  "customer_default_address_ward_code" varchar COLLATE "pg_catalog"."default",
  "discount_codes" jsonb,
  "email" varchar COLLATE "pg_catalog"."default",
  "financial_status" varchar COLLATE "pg_catalog"."default",
  "fulfillment_status" varchar COLLATE "pg_catalog"."default",
  "tags" varchar COLLATE "pg_catalog"."default",
  "gateway" varchar COLLATE "pg_catalog"."default",
  "gateway_code" varchar COLLATE "pg_catalog"."default",
  "landing_site" varchar COLLATE "pg_catalog"."default",
  "landing_site_ref" varchar COLLATE "pg_catalog"."default",
  "source" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "number" int4,
  "order_number" varchar COLLATE "pg_catalog"."default",
  "processing_method" varchar COLLATE "pg_catalog"."default",
  "shipping_address_address1" varchar COLLATE "pg_catalog"."default",
  "shipping_address_address2" varchar COLLATE "pg_catalog"."default",
  "shipping_address_city" varchar COLLATE "pg_catalog"."default",
  "shipping_address_company" varchar COLLATE "pg_catalog"."default",
  "shipping_address_country" varchar COLLATE "pg_catalog"."default",
  "shipping_address_first_name" varchar COLLATE "pg_catalog"."default",
  "shipping_address_last_name" varchar COLLATE "pg_catalog"."default",
  "shipping_address_latitude" float8,
  "shipping_address_longitude" float8,
  "shipping_address_phone" varchar COLLATE "pg_catalog"."default",
  "shipping_address_province" varchar COLLATE "pg_catalog"."default",
  "shipping_address_zip" varchar COLLATE "pg_catalog"."default",
  "shipping_address_name" varchar COLLATE "pg_catalog"."default",
  "shipping_address_province_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_country_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_district_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_district" varchar COLLATE "pg_catalog"."default",
  "shipping_address_ward_code" varchar COLLATE "pg_catalog"."default",
  "shipping_address_ward" varchar COLLATE "pg_catalog"."default",
  "shipping_lines" jsonb,
  "source_name" varchar COLLATE "pg_catalog"."default",
  "subtotal_price" numeric(36,8),
  "tax_lines" varchar COLLATE "pg_catalog"."default",
  "taxes_included" bool,
  "token" varchar COLLATE "pg_catalog"."default",
  "total_discounts" numeric(36,8),
  "total_line_items_price" numeric(36,8),
  "total_price" numeric(36,8),
  "total_tax" numeric(36,8),
  "total_weight" float8,
  "updated_at" timestamp(6),
  "note_attributes" jsonb,
  "confirmed_at" timestamp(6),
  "closed_status" varchar COLLATE "pg_catalog"."default",
  "cancelled_status" varchar COLLATE "pg_catalog"."default",
  "confirmed_status" varchar COLLATE "pg_catalog"."default",
  "assigned_location_id" int8,
  "assigned_location_name" varchar COLLATE "pg_catalog"."default",
  "assigned_location_at" timestamp(6),
  "exported_confirm_at" timestamp(6),
  "user_id" int8,
  "device_id" int8,
  "location_id" int8,
  "location_name" varchar COLLATE "pg_catalog"."default",
  "ref_order_id" int8,
  "ref_order_date" timestamp(6),
  "ref_order_number" varchar COLLATE "pg_catalog"."default",
  "utm_source" varchar COLLATE "pg_catalog"."default",
  "utm_medium" varchar COLLATE "pg_catalog"."default",
  "utm_campaign" varchar COLLATE "pg_catalog"."default",
  "utm_term" varchar COLLATE "pg_catalog"."default",
  "utm_content" varchar COLLATE "pg_catalog"."default",
  "payment_url" varchar COLLATE "pg_catalog"."default",
  "contact_email" varchar COLLATE "pg_catalog"."default",
  "order_processing_status" varchar COLLATE "pg_catalog"."default",
  "prev_order_id" int8,
  "prev_order_number" varchar COLLATE "pg_catalog"."default",
  "prev_order_date" timestamp(6),
  "redeem_model" varchar COLLATE "pg_catalog"."default",
  "confirm_user" int8,
  "risk_level" varchar COLLATE "pg_catalog"."default",
  "discount_applications" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."orders" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."products";
CREATE TABLE "haravan"."products" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "published_at" timestamp(6),
  "published_scope" varchar COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "product_type" varchar COLLATE "pg_catalog"."default",
  "images" jsonb,
  "tags" varchar COLLATE "pg_catalog"."default",
  "template_suffix" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "variants" jsonb,
  "only_hide_from_list" bool,
  "not_allow_promotion" bool,
  "options" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_receives
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."purchase_receives";
CREATE TABLE "haravan"."purchase_receives" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "receive_number" varchar COLLATE "pg_catalog"."default",
  "supplier" jsonb,
  "supplier_id" int8,
  "supplier_name" varchar COLLATE "pg_catalog"."default",
  "location" jsonb,
  "location_id" int8,
  "location_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "received_at" timestamp(6),
  "notes" text COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "total" numeric(36,8),
  "total_cost" numeric(36,8),
  "tags" varchar COLLATE "pg_catalog"."default",
  "ref_purchase_order_id" varchar COLLATE "pg_catalog"."default",
  "ref_number" varchar COLLATE "pg_catalog"."default",
  "line_items" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."purchase_receives" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_receives_items
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."purchase_receives_items";
CREATE TABLE "haravan"."purchase_receives_items" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "purchase_receive_id" int8,
  "purchase_receive_number" varchar COLLATE "pg_catalog"."default",
  "product_id" int8,
  "product_name" varchar COLLATE "pg_catalog"."default",
  "product_variant_id" int8,
  "variant_title" varchar COLLATE "pg_catalog"."default",
  "sku" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "original_cost" numeric(36,8),
  "discount_amount" numeric(36,8),
  "cost" numeric(36,8),
  "product_quantity" int4,
  "total_cost" numeric(36,8),
  "variant_unit" jsonb,
  "lots" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."purchase_receives_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for refunds
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."refunds";
CREATE TABLE "haravan"."refunds" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "order_id" int8,
  "created_at" timestamp(6),
  "note" varchar COLLATE "pg_catalog"."default",
  "refund_line_items" jsonb,
  "restock" bool,
  "user_id" int8,
  "location_id" int8,
  "transactions" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."refunds" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."transactions";
CREATE TABLE "haravan"."transactions" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "order_id" int8,
  "amount" numeric(36,8),
  "authorization" varchar(50) COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "device_id" int8,
  "gateway" varchar(100) COLLATE "pg_catalog"."default",
  "kind" varchar(10) COLLATE "pg_catalog"."default",
  "receipt" varchar(255) COLLATE "pg_catalog"."default",
  "status" varchar(10) COLLATE "pg_catalog"."default",
  "test" bool,
  "user_id" int8,
  "location_id" int8,
  "currency" varchar COLLATE "pg_catalog"."default",
  "is_cod_gateway" bool,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."transactions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."users";
CREATE TABLE "haravan"."users" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "email" varchar COLLATE "pg_catalog"."default",
  "first_name" varchar COLLATE "pg_catalog"."default",
  "last_name" varchar COLLATE "pg_catalog"."default",
  "phone" varchar COLLATE "pg_catalog"."default",
  "account_owner" bool,
  "bio" text COLLATE "pg_catalog"."default",
  "im" text COLLATE "pg_catalog"."default",
  "receive_announcements" int4,
  "url" text COLLATE "pg_catalog"."default",
  "user_type" varchar COLLATE "pg_catalog"."default",
  "permissions" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variants
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."variants";
CREATE TABLE "haravan"."variants" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "product_id" int8,
  "published_scope" varchar COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "product_type" varchar COLLATE "pg_catalog"."default",
  "template_suffix" varchar COLLATE "pg_catalog"."default",
  "product_title" varchar COLLATE "pg_catalog"."default",
  "product_vendor" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "compare_at_price" numeric(36,8),
  "created_at" timestamp(6),
  "fulfillment_service" varchar COLLATE "pg_catalog"."default",
  "grams" int4,
  "inventory_management" varchar COLLATE "pg_catalog"."default",
  "inventory_policy" varchar COLLATE "pg_catalog"."default",
  "inventory_quantity" int4,
  "position" int4,
  "price" numeric(36,8),
  "requires_shipping" bool,
  "sku" varchar COLLATE "pg_catalog"."default",
  "taxable" bool,
  "title" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "image_id" int8,
  "option1" varchar COLLATE "pg_catalog"."default",
  "option2" varchar COLLATE "pg_catalog"."default",
  "option3" varchar COLLATE "pg_catalog"."default",
  "qty_onhand" int4,
  "qty_commited" int4,
  "qty_available" int4,
  "qty_incoming" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for warehouse_inventories
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."warehouse_inventories";
CREATE TABLE "haravan"."warehouse_inventories" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int8,
  "loc_id" int8,
  "product_id" int8,
  "variant_id" int8,
  "qty_onhand" int8,
  "qty_committed" int8,
  "qty_available" int8,
  "qty_incoming" int8,
  "updated_at" timestamp(6),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "haravan"."warehouse_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for warehouses
-- ----------------------------
DROP TABLE IF EXISTS "haravan"."warehouses";
CREATE TABLE "haravan"."warehouses" (
  "id" int4 NOT NULL,
  "name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "haravan"."warehouses" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for get_real_created_at
-- ----------------------------
DROP FUNCTION IF EXISTS "haravan"."get_real_created_at"("order_id_input" int4);
CREATE FUNCTION "haravan"."get_real_created_at"("order_id_input" int4)
  RETURNS "pg_catalog"."timestamp" AS $BODY$
DECLARE
    current_order_id INT := order_id_input;
    current_created_at TIMESTAMP;
    ref_order_id INT;
BEGIN
    -- Lấy thông tin của đơn hàng hiện tại
    SELECT ho.created_at, ho.ref_order_id INTO current_created_at, ref_order_id
    FROM haravan.orders as ho 
    WHERE ho.id = current_order_id;

    -- Vòng lặp: tiếp tục truy ngược khi có ref_order_id
    WHILE ref_order_id != 0  LOOP
        -- Cập nhật current_order_id để kiểm tra bản ghi trước đó
        current_order_id := ref_order_id;

        -- Lấy thông tin của bản ghi trước đó (cha)
        SELECT ho.created_at, ho.ref_order_id INTO current_created_at, ref_order_id
        FROM haravan.orders as ho
        WHERE ho.id = current_order_id;  -- Chỉnh sửa ở đây để lấy bản ghi trước đó
    END LOOP;

    -- Trả về created_at của bản ghi gốc
    RETURN current_created_at;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "haravan"."get_real_created_at"("order_id_input" int4) OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"haravan"."test_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"haravan"."tests_id_seq"', 1, false);

-- ----------------------------
-- Indexes structure for table collection_product
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_collection_product_id" ON "haravan"."collection_product" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_collection_product_uuid" ON "haravan"."collection_product" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table collection_product
-- ----------------------------
ALTER TABLE "haravan"."collection_product" ADD CONSTRAINT "collection_product_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table custom_collections
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_custom_collections_id" ON "haravan"."custom_collections" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_custom_collections_uuid" ON "haravan"."custom_collections" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table custom_collections
-- ----------------------------
ALTER TABLE "haravan"."custom_collections" ADD CONSTRAINT "custom_collections_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table customers
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_customers_id" ON "haravan"."customers" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_customers_uuid" ON "haravan"."customers" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table customers
-- ----------------------------
ALTER TABLE "haravan"."customers" ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table fulfillments
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_fulfillments_id" ON "haravan"."fulfillments" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table fulfillments
-- ----------------------------
ALTER TABLE "haravan"."fulfillments" ADD CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Uniques structure for table images
-- ----------------------------
ALTER TABLE "haravan"."images" ADD CONSTRAINT "unique_id" UNIQUE ("id");

-- ----------------------------
-- Primary Key structure for table images
-- ----------------------------
ALTER TABLE "haravan"."images" ADD CONSTRAINT "images_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table inventory_logs
-- ----------------------------
ALTER TABLE "haravan"."inventory_logs" ADD CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table line_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_line_items_id" ON "haravan"."line_items" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table line_items
-- ----------------------------
ALTER TABLE "haravan"."line_items" ADD CONSTRAINT "line_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table orders
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_orders_id" ON "haravan"."orders" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table orders
-- ----------------------------
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table products
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_products_id" ON "haravan"."products" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_products_uuid" ON "haravan"."products" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table products
-- ----------------------------
ALTER TABLE "haravan"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_receives
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_id" ON "haravan"."purchase_receives" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_uuid" ON "haravan"."purchase_receives" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_receives
-- ----------------------------
ALTER TABLE "haravan"."purchase_receives" ADD CONSTRAINT "purchase_receives_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_receives_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_items_id" ON "haravan"."purchase_receives_items" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_items_product_id" ON "haravan"."purchase_receives_items" USING btree (
  "product_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_items_purchase_receive_id" ON "haravan"."purchase_receives_items" USING btree (
  "purchase_receive_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_purchase_receives_items_uuid" ON "haravan"."purchase_receives_items" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_receives_items
-- ----------------------------
ALTER TABLE "haravan"."purchase_receives_items" ADD CONSTRAINT "purchase_receives_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table refunds
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_refunds_id" ON "haravan"."refunds" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table refunds
-- ----------------------------
ALTER TABLE "haravan"."refunds" ADD CONSTRAINT "refunds_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table transactions
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_transactions_id" ON "haravan"."transactions" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table transactions
-- ----------------------------
ALTER TABLE "haravan"."transactions" ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_users_id" ON "haravan"."users" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_users_uuid" ON "haravan"."users" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "haravan"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table variants
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_variants_id" ON "haravan"."variants" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_variants_product_id" ON "haravan"."variants" USING btree (
  "product_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_variants_uuid" ON "haravan"."variants" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table variants
-- ----------------------------
ALTER TABLE "haravan"."variants" ADD CONSTRAINT "variants_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table warehouse_inventories
-- ----------------------------
CREATE UNIQUE INDEX "ix_haravan_warehouse_inventories_id" ON "haravan"."warehouse_inventories" USING btree (
  "id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "ix_haravan_warehouse_inventories_uuid" ON "haravan"."warehouse_inventories" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table warehouse_inventories
-- ----------------------------
ALTER TABLE "haravan"."warehouse_inventories" ADD CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table warehouses
-- ----------------------------
ALTER TABLE "haravan"."warehouses" ADD CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : inventory_cms

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:58
*/

CREATE SCHEMA IF NOT EXISTS "inventory_cms";

-- ----------------------------
-- Table structure for inventory_check_lines
-- ----------------------------
DROP TABLE IF EXISTS "inventory_cms"."inventory_check_lines";
CREATE TABLE "inventory_cms"."inventory_check_lines" (
  "uuid" uuid NOT NULL,
  "id" int4 NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "sort" text COLLATE "pg_catalog"."default",
  "user_created" text COLLATE "pg_catalog"."default",
  "date_created" timestamp(3),
  "user_updated" text COLLATE "pg_catalog"."default",
  "date_updated" timestamp(3),
  "product_name" text COLLATE "pg_catalog"."default",
  "product_id" text COLLATE "pg_catalog"."default",
  "variant_id" int4,
  "count_in_book" int4,
  "count_for_real" int4,
  "checked_status" text COLLATE "pg_catalog"."default",
  "sheet_id" int4,
  "variant_name" text COLLATE "pg_catalog"."default",
  "product_image" text COLLATE "pg_catalog"."default",
  "sku" text COLLATE "pg_catalog"."default",
  "count_extra_for_real" int4,
  "barcode" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default",
  "count_in_ordered" text COLLATE "pg_catalog"."default",
  "rfid_tags" jsonb
)
;
ALTER TABLE "inventory_cms"."inventory_check_lines" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for inventory_check_sheets
-- ----------------------------
DROP TABLE IF EXISTS "inventory_cms"."inventory_check_sheets";
CREATE TABLE "inventory_cms"."inventory_check_sheets" (
  "uuid" uuid NOT NULL,
  "id" int4 NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "sort" text COLLATE "pg_catalog"."default",
  "user_created" text COLLATE "pg_catalog"."default",
  "date_created" timestamp(3),
  "user_updated" text COLLATE "pg_catalog"."default",
  "date_updated" timestamp(3),
  "warehouse" text COLLATE "pg_catalog"."default",
  "staff" int4,
  "result" text COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default",
  "warehouse_id" text COLLATE "pg_catalog"."default",
  "count_in_book" int4,
  "count_for_real" int4,
  "extra" int4,
  "lines" jsonb
)
;
ALTER TABLE "inventory_cms"."inventory_check_sheets" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table inventory_check_lines
-- ----------------------------
CREATE UNIQUE INDEX "inventory_check_lines_id_key" ON "inventory_cms"."inventory_check_lines" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table inventory_check_lines
-- ----------------------------
ALTER TABLE "inventory_cms"."inventory_check_lines" ADD CONSTRAINT "inventory_check_lines_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table inventory_check_sheets
-- ----------------------------
CREATE UNIQUE INDEX "inventory_check_sheets_id_key" ON "inventory_cms"."inventory_check_sheets" USING btree (
  "id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table inventory_check_sheets
-- ----------------------------
ALTER TABLE "inventory_cms"."inventory_check_sheets" ADD CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("uuid");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : inventory_report

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:02
*/

CREATE SCHEMA IF NOT EXISTS "inventory_report";

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : inventory

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:22:53
*/

CREATE SCHEMA IF NOT EXISTS "inventory";

-- ----------------------------
-- Table structure for inventory_check_sheets
-- ----------------------------
DROP TABLE IF EXISTS "inventory"."inventory_check_sheets";
CREATE TABLE "inventory"."inventory_check_sheets" (
  "id" uuid NOT NULL,
  "staff" numeric,
  "count_in_book" numeric,
  "count_for_real" numeric,
  "extra" numeric,
  "lines" jsonb,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "warehouse" varchar(255) COLLATE "pg_catalog"."default",
  "warehouse_id" numeric,
  "code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "inventory"."inventory_check_sheets" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for inventory_check_sheets_2024
-- ----------------------------
DROP TABLE IF EXISTS "inventory"."inventory_check_sheets_2024";
CREATE TABLE "inventory"."inventory_check_sheets_2024" (
  "id" uuid,
  "staff" numeric,
  "count_in_book" numeric,
  "count_for_real" numeric,
  "extra" numeric,
  "lines" jsonb,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "warehouse" varchar(255) COLLATE "pg_catalog"."default",
  "warehouse_id" numeric,
  "code" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "inventory"."inventory_check_sheets_2024" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for rfid_tags_warehouse
-- ----------------------------
DROP TABLE IF EXISTS "inventory"."rfid_tags_warehouse";
CREATE TABLE "inventory"."rfid_tags_warehouse" (
  "id" uuid NOT NULL,
  "rfid_tag" varchar COLLATE "pg_catalog"."default",
  "warehouse" varchar COLLATE "pg_catalog"."default",
  "warehouse_id" numeric,
  "product_id" numeric,
  "varient_id" numeric,
  "count_in_book" numeric,
  "count_for_real" numeric,
  "count_extra_for_real" numeric,
  "varient_name" varchar COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "inventory"."rfid_tags_warehouse" OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table inventory_check_sheets
-- ----------------------------
ALTER TABLE "inventory"."inventory_check_sheets" ADD CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table rfid_tags_warehouse
-- ----------------------------
ALTER TABLE "inventory"."rfid_tags_warehouse" ADD CONSTRAINT "rfid_tags_warehouse_pkey" PRIMARY KEY ("id");

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

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : misa

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:20
*/

CREATE SCHEMA IF NOT EXISTS "misa";

-- ----------------------------
-- Table structure for inventory_items
-- ----------------------------
DROP TABLE IF EXISTS "misa"."inventory_items";
CREATE TABLE "misa"."inventory_items" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "sku" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."inventory_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for items
-- ----------------------------
DROP TABLE IF EXISTS "misa"."items";
CREATE TABLE "misa"."items" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar(50) COLLATE "pg_catalog"."default",
  "dictionary_type" int4,
  "inventory_item_name" varchar COLLATE "pg_catalog"."default",
  "inventory_item_code" varchar COLLATE "pg_catalog"."default",
  "inventory_item_type" int4,
  "minimum_stock" float8,
  "inventory_item_category_code_list" varchar COLLATE "pg_catalog"."default",
  "inventory_item_category_name_list" varchar COLLATE "pg_catalog"."default",
  "inventory_item_category_id_list" varchar COLLATE "pg_catalog"."default",
  "inventory_item_category_misa_code_list" varchar COLLATE "pg_catalog"."default",
  "branch_id" varchar COLLATE "pg_catalog"."default",
  "discount_type" int4,
  "inventory_item_cost_method" int4,
  "unit_id" varchar COLLATE "pg_catalog"."default",
  "is_unit_price_after_tax" bool,
  "is_system" bool,
  "inactive" bool,
  "is_follow_serial_number" bool,
  "is_allow_duplicate_serial_number" bool,
  "purchase_discount_rate" float8,
  "unit_price" numeric(36,8),
  "sale_price1" numeric(36,8),
  "sale_price2" numeric(36,8),
  "sale_price3" numeric(36,8),
  "fixed_sale_price" numeric(36,8),
  "import_tax_rate" float8,
  "export_tax_rate" float8,
  "fixed_unit_price" numeric(36,8),
  "description" text COLLATE "pg_catalog"."default",
  "inventory_account" varchar COLLATE "pg_catalog"."default",
  "cogs_account" varchar COLLATE "pg_catalog"."default",
  "sale_account" varchar COLLATE "pg_catalog"."default",
  "unit_list" jsonb,
  "unit_name" varchar COLLATE "pg_catalog"."default",
  "reftype" int4,
  "reftype_category" int4,
  "quantityBarCode" int4,
  "allocation_type" int4,
  "allocation_time" int4,
  "tax_reduction_type" int4,
  "purchase_last_unit_price" numeric(36,8),
  "is_specific_inventory_item" bool,
  "has_delete_fixed_unit_price" bool,
  "has_delete_unit_price" bool,
  "has_delete_discount" bool,
  "has_delete_unit_convert" bool,
  "has_delete_norm" bool,
  "has_delete_serial_type" bool,
  "is_edit_multiple" bool,
  "is_not_sync_crm" bool,
  "isUpdateRebundant" bool,
  "is_special_inv" bool,
  "isCustomPrimaryKey" bool,
  "isFromProcessBalance" bool,
  "is_drug" bool,
  "status_sync_medicine_national" int4,
  "is_sync_corp" bool,
  "convert_rate" float8,
  "is_update_main_unit" bool,
  "is_image_duplicate" bool,
  "is_group" bool,
  "discount_value" numeric(36,8),
  "is_set_discount" bool,
  "index_unit_convert" int4,
  "excel_row_index" int4,
  "is_valid" bool,
  "created_date" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "modified_date" timestamp(6),
  "modified_by" varchar COLLATE "pg_catalog"."default",
  "auto_refno" bool,
  "force_update" bool,
  "state" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_voucher_details
-- ----------------------------
DROP TABLE IF EXISTS "misa"."purchase_voucher_details";
CREATE TABLE "misa"."purchase_voucher_details" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "ref_detail_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "refid" varchar(36) COLLATE "pg_catalog"."default",
  "inventory_item_id" varchar(36) COLLATE "pg_catalog"."default",
  "inventory_item_name" varchar COLLATE "pg_catalog"."default",
  "stock_id" varchar(36) COLLATE "pg_catalog"."default",
  "unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "pu_invoice_refid" varchar(36) COLLATE "pg_catalog"."default",
  "main_unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "purchase_purpose_id" varchar(36) COLLATE "pg_catalog"."default",
  "organization_unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "sort_order" int4,
  "inventory_resale_type_id" int4,
  "inv_date" timestamp(6),
  "date_enough_tax_payment" timestamp(6),
  "un_resonable_cost" bool,
  "quantity" float8,
  "unit_price" numeric(36,8),
  "amount_oc" numeric(36,8),
  "amount" numeric(36,8),
  "discount_rate" float8,
  "discount_amount_oc" numeric(36,8),
  "import_charge_before_custom_amount_oc" numeric(36,8),
  "import_charge_before_custom_amount" numeric(36,8),
  "import_charge_before_custom_amount_main_currency" numeric(36,8),
  "allocation_rate_import_origin_currency" float8,
  "import_charge_before_custom_amount_allocated" numeric(36,8),
  "cash_out_exchange_rate_management" float8,
  "allocation_rate" float8,
  "allocation_rate_import" float8,
  "unit_price_after_tax" numeric(36,8),
  "import_charge_exchange_rate" numeric(36,8),
  "cash_out_diff_vat_amount_finance" numeric(36,8),
  "cash_out_amount_management" numeric(36,8),
  "cash_out_diff_amount_management" numeric(36,8),
  "cash_out_vat_amount_management" numeric(36,8),
  "cash_out_diff_vat_amount_management" numeric(36,8),
  "cash_out_exchange_rate_finance" float8,
  "special_consume_tax_amount" numeric(36,8),
  "environmental_tax_amount" numeric(36,8),
  "environmental_tax_amount_oc" numeric(36,8),
  "cash_out_amount_finance" numeric(36,8),
  "cash_out_diff_amount_finance" numeric(36,8),
  "cash_out_vat_amount_finance" numeric(36,8),
  "import_tax_rate_price" numeric(36,8),
  "import_tax_rate" float8,
  "import_tax_amount_oc" numeric(36,8),
  "import_tax_amount" numeric(36,8),
  "anti_dumping_tax_rate" float8,
  "anti_dumping_tax_amount" numeric(36,8),
  "anti_dumping_tax_amount_oc" numeric(36,8),
  "anti_dumping_tax_account" varchar COLLATE "pg_catalog"."default",
  "special_consume_tax_rate" float8,
  "special_consume_tax_amount_oc" numeric(36,8),
  "vat_rate" float8,
  "vat_amount_oc" numeric(36,8),
  "vat_amount" numeric(36,8),
  "fob_amount_oc" numeric(36,8),
  "fob_amount" numeric(36,8),
  "import_charge_amount" numeric(36,8),
  "discount_amount" numeric(36,8),
  "freight_amount" numeric(36,8),
  "inward_amount" numeric(36,8),
  "main_convert_rate" float8,
  "main_quantity" float8,
  "main_unit_price" numeric(36,8),
  "description" text COLLATE "pg_catalog"."default",
  "debit_account" varchar COLLATE "pg_catalog"."default",
  "credit_account" varchar COLLATE "pg_catalog"."default",
  "exchange_rate_operator" varchar COLLATE "pg_catalog"."default",
  "vat_account" varchar COLLATE "pg_catalog"."default",
  "inv_no" varchar COLLATE "pg_catalog"."default",
  "import_tax_account" varchar COLLATE "pg_catalog"."default",
  "special_consume_tax_account" varchar COLLATE "pg_catalog"."default",
  "environmental_tax_account" varchar COLLATE "pg_catalog"."default",
  "vat_description" text COLLATE "pg_catalog"."default",
  "stock_code" varchar COLLATE "pg_catalog"."default",
  "inventory_item_code" varchar COLLATE "pg_catalog"."default",
  "main_unit_name" varchar COLLATE "pg_catalog"."default",
  "organization_unit_code" varchar COLLATE "pg_catalog"."default",
  "organization_unit_name" varchar COLLATE "pg_catalog"."default",
  "unit_name" varchar COLLATE "pg_catalog"."default",
  "edit_version" int8,
  "purchase_purpose_code" varchar COLLATE "pg_catalog"."default",
  "inventory_item_type" int4,
  "purchase_purpose_name" text COLLATE "pg_catalog"."default",
  "pu_order_refno" varchar COLLATE "pg_catalog"."default",
  "pu_order_code" varchar COLLATE "pg_catalog"."default",
  "is_follow_serial_number" bool,
  "is_allow_duplicate_serial_number" bool,
  "is_description" bool,
  "panel_height_quantity" float8,
  "panel_length_quantity" float8,
  "panel_quantity" float8,
  "panel_radius_quantity" float8,
  "panel_width_quantity" float8,
  "inventory_item_cogs_account" varchar COLLATE "pg_catalog"."default",
  "inventory_account" varchar COLLATE "pg_catalog"."default",
  "unit_list" text COLLATE "pg_catalog"."default",
  "import_tax_rate_price_origin" numeric(36,8),
  "quantity_product_produce" float8,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."purchase_voucher_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for purchase_vouchers
-- ----------------------------
DROP TABLE IF EXISTS "misa"."purchase_vouchers";
CREATE TABLE "misa"."purchase_vouchers" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "refid" varchar(50) COLLATE "pg_catalog"."default",
  "branch_id" varchar(36) COLLATE "pg_catalog"."default",
  "account_object_id" varchar(36) COLLATE "pg_catalog"."default",
  "reftype" int4,
  "display_on_book" int4,
  "refdate" timestamp(6),
  "posted_date" timestamp(6),
  "caba_refdate" timestamp(6),
  "caba_posted_date" timestamp(6),
  "created_date" timestamp(6),
  "modified_date" timestamp(6),
  "is_posted_finance" bool,
  "is_posted_management" bool,
  "is_posted_cash_book_finance" bool,
  "is_posted_cash_book_management" bool,
  "is_posted_inventory_book_finance" bool,
  "is_posted_inventory_book_management" bool,
  "total_amount_oc" numeric(36,8),
  "total_amount" numeric(36,8),
  "total_import_tax_amount_oc" numeric(36,8),
  "total_import_tax_amount" numeric(36,8),
  "total_vat_amount_oc" numeric(36,8),
  "total_special_consume_tax_amount" numeric(36,8),
  "total_custom_before_amount" numeric(36,8),
  "caba_amount_oc" numeric(36,8),
  "caba_amount" numeric(36,8),
  "total_vat_amount" numeric(36,8),
  "total_discount_amount_oc" numeric(36,8),
  "total_discount_amount" numeric(36,8),
  "total_freight_amount" numeric(36,8),
  "total_inward_amount" numeric(36,8),
  "total_special_consume_tax_amount_oc" numeric(36,8),
  "total_payment_amount" numeric(36,8),
  "total_payment_amount_oc" numeric(36,8),
  "total_environmental_tax_amount" numeric(36,8),
  "refno_finance" varchar COLLATE "pg_catalog"."default",
  "account_object_name" varchar COLLATE "pg_catalog"."default",
  "account_object_address" varchar COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "modified_by" varchar COLLATE "pg_catalog"."default",
  "journal_memo" text COLLATE "pg_catalog"."default",
  "account_object_code" varchar COLLATE "pg_catalog"."default",
  "paid_status" int4,
  "include_invoice" int4,
  "branch_name" varchar COLLATE "pg_catalog"."default",
  "edit_version" int8,
  "currency_id" varchar COLLATE "pg_catalog"."default",
  "exchange_rate" float8,
  "account_object_tax_code" varchar COLLATE "pg_catalog"."default",
  "is_freight_service" bool,
  "employee_id" varchar(36) COLLATE "pg_catalog"."default",
  "in_outward_refno" varchar COLLATE "pg_catalog"."default",
  "status_sync_medicine_national" int4,
  "discount_type" int4,
  "employee_name" varchar COLLATE "pg_catalog"."default",
  "employee_code" varchar COLLATE "pg_catalog"."default",
  "total_anti_dumping_tax_amount" numeric(36,8),
  "total_anti_dumping_tax_amount_oc" numeric(36,8),
  "wesign_document_text" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."purchase_vouchers" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "misa"."users";
CREATE TABLE "misa"."users" (
  "uuid" uuid NOT NULL,
  "employee_code" varchar(255) COLLATE "pg_catalog"."default",
  "haravan_id" int8 NOT NULL,
  "email" varchar(255) COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(3) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(3)
)
;
ALTER TABLE "misa"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for warehouse_inventories
-- ----------------------------
DROP TABLE IF EXISTS "misa"."warehouse_inventories";
CREATE TABLE "misa"."warehouse_inventories" (
  "uuid" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "inventory_item_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "inventory_item_code" varchar(50) COLLATE "pg_catalog"."default",
  "inventory_item_name" varchar(255) COLLATE "pg_catalog"."default",
  "stock_id" varchar(36) COLLATE "pg_catalog"."default" NOT NULL,
  "stock_code" varchar(50) COLLATE "pg_catalog"."default",
  "stock_name" varchar(255) COLLATE "pg_catalog"."default",
  "organization_unit_id" varchar(36) COLLATE "pg_catalog"."default",
  "organization_unit_code" varchar(50) COLLATE "pg_catalog"."default",
  "organization_unit_name" varchar(255) COLLATE "pg_catalog"."default",
  "quantity_balance" float8,
  "amount_balance" numeric(36,2),
  "unit_price" numeric(36,2),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "misa"."warehouse_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table inventory_items
-- ----------------------------
CREATE UNIQUE INDEX "ix_misa_inventory_items_sku" ON "misa"."inventory_items" USING btree (
  "sku" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_misa_inventory_items_uuid" ON "misa"."inventory_items" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table inventory_items
-- ----------------------------
ALTER TABLE "misa"."inventory_items" ADD CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table items
-- ----------------------------
CREATE UNIQUE INDEX "ix_misa_items_id" ON "misa"."items" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table items
-- ----------------------------
ALTER TABLE "misa"."items" ADD CONSTRAINT "items_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table purchase_voucher_details
-- ----------------------------
CREATE INDEX "ix_misa_purchase_voucher_details_refid" ON "misa"."purchase_voucher_details" USING btree (
  "refid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Uniques structure for table purchase_voucher_details
-- ----------------------------
ALTER TABLE "misa"."purchase_voucher_details" ADD CONSTRAINT "purchase_voucher_details_ref_detail_id_key" UNIQUE ("ref_detail_id");

-- ----------------------------
-- Primary Key structure for table purchase_voucher_details
-- ----------------------------
ALTER TABLE "misa"."purchase_voucher_details" ADD CONSTRAINT "purchase_voucher_details_pkey" PRIMARY KEY ("uuid", "ref_detail_id");

-- ----------------------------
-- Indexes structure for table purchase_vouchers
-- ----------------------------
CREATE UNIQUE INDEX "ix_misa_purchase_vouchers_refid" ON "misa"."purchase_vouchers" USING btree (
  "refid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table purchase_vouchers
-- ----------------------------
ALTER TABLE "misa"."purchase_vouchers" ADD CONSTRAINT "purchase_vouchers_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE UNIQUE INDEX "users_employee_code_key" ON "misa"."users" USING btree (
  "employee_code" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "users_haravan_id_key" ON "misa"."users" USING btree (
  "haravan_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "misa"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table warehouse_inventories
-- ----------------------------
ALTER TABLE "misa"."warehouse_inventories" ADD CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("inventory_item_id", "stock_id");

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : pancake

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:26
*/

CREATE SCHEMA IF NOT EXISTS "pancake";

-- ----------------------------
-- Table structure for conversation
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."conversation";
CREATE TABLE "pancake"."conversation" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default",
  "customer_id" varchar COLLATE "pg_catalog"."default",
  "type" varchar COLLATE "pg_catalog"."default",
  "inserted_at" timestamp(6),
  "page_id" varchar COLLATE "pg_catalog"."default",
  "has_phone" bool,
  "post_id" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "assignee_histories" jsonb,
  "added_users" jsonb,
  "added_user_id" varchar COLLATE "pg_catalog"."default",
  "added_user_name" varchar COLLATE "pg_catalog"."default",
  "added_user_email" varchar COLLATE "pg_catalog"."default",
  "added_user_fb_id" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "last_sent_at" timestamp(6),
  "avatar_url" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "pancake"."conversation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for conversation_page_customer
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."conversation_page_customer";
CREATE TABLE "pancake"."conversation_page_customer" (
  "uuid" varchar COLLATE "pg_catalog"."default",
  "customer_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "conversation_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "pancake"."conversation_page_customer" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for conversation_tag
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."conversation_tag";
CREATE TABLE "pancake"."conversation_tag" (
  "uuid" varchar COLLATE "pg_catalog"."default",
  "conversation_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "page_id" varchar COLLATE "pg_catalog"."default",
  "customer_id" varchar COLLATE "pg_catalog"."default",
  "inserted_at" timestamp(6) NOT NULL,
  "post_id" varchar COLLATE "pg_catalog"."default",
  "has_phone" bool,
  "tag_page_id" int4 NOT NULL,
  "tag_label" varchar COLLATE "pg_catalog"."default",
  "tag_description" varchar COLLATE "pg_catalog"."default",
  "action" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "pancake"."conversation_tag" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for frappe_lead_conversation
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."frappe_lead_conversation";
CREATE TABLE "pancake"."frappe_lead_conversation" (
  "conversation_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "frappe_name_id" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "created_at" timestamp(6)
)
;
ALTER TABLE "pancake"."frappe_lead_conversation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for frappe_lead_conversation_stag
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."frappe_lead_conversation_stag";
CREATE TABLE "pancake"."frappe_lead_conversation_stag" (
  "conversation_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "frappe_name_id" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "created_at" timestamp(6)
)
;
ALTER TABLE "pancake"."frappe_lead_conversation_stag" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."messages";
CREATE TABLE "pancake"."messages" (
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "message" varchar COLLATE "pg_catalog"."default",
  "type" varchar COLLATE "pg_catalog"."default",
  "seen" bool,
  "show_info" bool,
  "from_id" varchar COLLATE "pg_catalog"."default",
  "from_name" varchar COLLATE "pg_catalog"."default",
  "attachments" json,
  "inserted_at" timestamp(6),
  "page_id" varchar COLLATE "pg_catalog"."default",
  "conversation_id" varchar COLLATE "pg_catalog"."default",
  "has_phone" bool,
  "is_removed" bool,
  "can_hide" bool,
  "comment_count" int4,
  "like_count" int4,
  "parent_id" varchar COLLATE "pg_catalog"."default",
  "is_hidden" bool,
  "rich_message" varchar COLLATE "pg_catalog"."default",
  "edit_history" varchar COLLATE "pg_catalog"."default",
  "message_tags" json,
  "is_parent_hidden" bool,
  "can_comment" bool,
  "can_like" bool,
  "can_remove" bool,
  "can_reply_privately" bool,
  "is_livestream_order" bool,
  "is_parent" bool,
  "phone_info" json,
  "original_message" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "pancake"."messages" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for page
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."page";
CREATE TABLE "pancake"."page" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default",
  "inserted_at" timestamp(6),
  "connected" bool,
  "is_activated" bool,
  "name" varchar COLLATE "pg_catalog"."default",
  "platform" varchar COLLATE "pg_catalog"."default",
  "timezone" varchar COLLATE "pg_catalog"."default",
  "settings" jsonb,
  "platform_extra_info" jsonb,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "page_access_token" varchar(255) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "pancake"."page" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for page_customer
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."page_customer";
CREATE TABLE "pancake"."page_customer" (
  "uuid" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default",
  "birthday" varchar COLLATE "pg_catalog"."default",
  "can_inbox" bool,
  "customer_id" varchar COLLATE "pg_catalog"."default",
  "gender" varchar COLLATE "pg_catalog"."default",
  "inserted_at" timestamp(6),
  "lives_in" varchar COLLATE "pg_catalog"."default",
  "name" varchar COLLATE "pg_catalog"."default",
  "page_id" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "phone_numbers" jsonb,
  "notes" jsonb,
  "phone" varchar(255) COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6)
)
;
ALTER TABLE "pancake"."page_customer" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for pancake_user
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."pancake_user";
CREATE TABLE "pancake"."pancake_user" (
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "name" varchar COLLATE "pg_catalog"."default",
  "status" varchar COLLATE "pg_catalog"."default",
  "fb_id" varchar COLLATE "pg_catalog"."default",
  "page_permissions" jsonb,
  "status_round_robin" varchar COLLATE "pg_catalog"."default",
  "status_in_page" varchar COLLATE "pg_catalog"."default",
  "is_online" bool,
  "database_updated_at" timestamp(6),
  "database_created_at" timestamp(6)
)
;
ALTER TABLE "pancake"."pancake_user" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for tag_page
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."tag_page";
CREATE TABLE "pancake"."tag_page" (
  "page_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "id" int4 NOT NULL,
  "tag_label" varchar COLLATE "pg_catalog"."default",
  "description" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "pancake"."tag_page" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "pancake"."users";
CREATE TABLE "pancake"."users" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "enterprise_email" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "pancake"."users" OWNER TO "neondb_owner";

-- ----------------------------
-- Indexes structure for table conversation
-- ----------------------------
CREATE UNIQUE INDEX "conversation_id_page_idx" ON "pancake"."conversation" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "page_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_conversation_page_id" ON "pancake"."conversation" USING btree (
  "page_id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "idx_id" ON "pancake"."conversation" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "ix_pancake_conversation_id" ON "pancake"."conversation" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_pancake_conversation_uuid" ON "pancake"."conversation" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table conversation
-- ----------------------------
ALTER TABLE "pancake"."conversation" ADD CONSTRAINT "conversation_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Uniques structure for table conversation_page_customer
-- ----------------------------
ALTER TABLE "pancake"."conversation_page_customer" ADD CONSTRAINT "conversation_page_customer_uuid_key" UNIQUE ("uuid");

-- ----------------------------
-- Primary Key structure for table conversation_page_customer
-- ----------------------------
ALTER TABLE "pancake"."conversation_page_customer" ADD CONSTRAINT "conversation_page_customer_pkey" PRIMARY KEY ("customer_id", "conversation_id");

-- ----------------------------
-- Uniques structure for table conversation_tag
-- ----------------------------
ALTER TABLE "pancake"."conversation_tag" ADD CONSTRAINT "conversation_tag_uuid_key" UNIQUE ("uuid");

-- ----------------------------
-- Primary Key structure for table conversation_tag
-- ----------------------------
ALTER TABLE "pancake"."conversation_tag" ADD CONSTRAINT "conversation_tag_pkey" PRIMARY KEY ("conversation_id", "inserted_at", "tag_page_id", "action");

-- ----------------------------
-- Primary Key structure for table frappe_lead_conversation
-- ----------------------------
ALTER TABLE "pancake"."frappe_lead_conversation" ADD CONSTRAINT "frappe_lead_conversation_pkey" PRIMARY KEY ("conversation_id");

-- ----------------------------
-- Primary Key structure for table frappe_lead_conversation_stag
-- ----------------------------
ALTER TABLE "pancake"."frappe_lead_conversation_stag" ADD CONSTRAINT "frappe_lead_conversation_stag_pkey" PRIMARY KEY ("conversation_id");

-- ----------------------------
-- Primary Key structure for table messages
-- ----------------------------
ALTER TABLE "pancake"."messages" ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table page
-- ----------------------------
CREATE INDEX "idx_page_id" ON "pancake"."page" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "ix_pancake_page_id" ON "pancake"."page" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_pancake_page_uuid" ON "pancake"."page" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table page
-- ----------------------------
ALTER TABLE "pancake"."page" ADD CONSTRAINT "page_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Indexes structure for table page_customer
-- ----------------------------
CREATE UNIQUE INDEX "ix_pancake_page_customer_id" ON "pancake"."page_customer" USING btree (
  "id" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "ix_pancake_page_customer_uuid" ON "pancake"."page_customer" USING btree (
  "uuid" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table page_customer
-- ----------------------------
ALTER TABLE "pancake"."page_customer" ADD CONSTRAINT "page_customer_pkey" PRIMARY KEY ("uuid");

-- ----------------------------
-- Primary Key structure for table pancake_user
-- ----------------------------
ALTER TABLE "pancake"."pancake_user" ADD CONSTRAINT "pancake_user_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table tag_page
-- ----------------------------
ALTER TABLE "pancake"."tag_page" ADD CONSTRAINT "tag_page_pkey" PRIMARY KEY ("page_id", "id");

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "pancake"."users" ADD CONSTRAINT "users_enterprise_email_key" UNIQUE ("enterprise_email");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "pancake"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

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

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : policy

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:23:37
*/

CREATE SCHEMA IF NOT EXISTS "policy";

-- ----------------------------
-- Table structure for purchase_exchange_policy
-- ----------------------------
DROP TABLE IF EXISTS "policy"."purchase_exchange_policy";
CREATE TABLE "policy"."purchase_exchange_policy" (
  "order_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "item_id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "order_code" varchar(50) COLLATE "pg_catalog"."default",
  "sku" varchar(50) COLLATE "pg_catalog"."default",
  "item_name" varchar(255) COLLATE "pg_catalog"."default",
  "barcode" varchar(50) COLLATE "pg_catalog"."default",
  "policy_id" varchar(50) COLLATE "pg_catalog"."default",
  "policy_name" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "policy"."purchase_exchange_policy" OWNER TO "neondb_owner";

-- ----------------------------
-- Primary Key structure for table purchase_exchange_policy
-- ----------------------------
ALTER TABLE "policy"."purchase_exchange_policy" ADD CONSTRAINT "purchase_exchange_policy_pkey" PRIMARY KEY ("order_id", "item_id");

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

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : workplace

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:24:14
*/

CREATE SCHEMA IF NOT EXISTS "workplace";

-- ----------------------------
-- Sequence structure for collections_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."collections_id_seq";
CREATE SEQUENCE "workplace"."collections_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."collections_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_details_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_details_id_seq";
CREATE SEQUENCE "workplace"."design_details_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_details_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_images_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_images_id_seq";
CREATE SEQUENCE "workplace"."design_images_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_images_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_melee_details_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_melee_details_id_seq";
CREATE SEQUENCE "workplace"."design_melee_details_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_melee_details_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_price_estimation_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_price_estimation_id_seq";
CREATE SEQUENCE "workplace"."design_price_estimation_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_price_estimation_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_products_id_seq";
CREATE SEQUENCE "workplace"."design_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_products_id_seq1
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_products_id_seq1";
CREATE SEQUENCE "workplace"."design_products_id_seq1" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_products_id_seq1" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for design_set_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."design_set_id_seq";
CREATE SEQUENCE "workplace"."design_set_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."design_set_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for diamomds_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."diamomds_id_seq";
CREATE SEQUENCE "workplace"."diamomds_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."diamomds_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for diamond_price_list_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."diamond_price_list_id_seq";
CREATE SEQUENCE "workplace"."diamond_price_list_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."diamond_price_list_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for ecom_360_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."ecom_360_id_seq";
CREATE SEQUENCE "workplace"."ecom_360_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."ecom_360_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for ecom_old_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."ecom_old_products_id_seq";
CREATE SEQUENCE "workplace"."ecom_old_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."ecom_old_products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for hrv_locations_1_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."hrv_locations_1_id_seq";
CREATE SEQUENCE "workplace"."hrv_locations_1_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."hrv_locations_1_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for jewelries_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."jewelries_id_seq";
CREATE SEQUENCE "workplace"."jewelries_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."jewelries_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for materials_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."materials_id_seq";
CREATE SEQUENCE "workplace"."materials_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."materials_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for melee_diamonds_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."melee_diamonds_id_seq";
CREATE SEQUENCE "workplace"."melee_diamonds_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."melee_diamonds_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for moissanite_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."moissanite_id_seq";
CREATE SEQUENCE "workplace"."moissanite_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."moissanite_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for moissanite_serials_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."moissanite_serials_id_seq";
CREATE SEQUENCE "workplace"."moissanite_serials_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."moissanite_serials_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for product_collections_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."product_collections_id_seq";
CREATE SEQUENCE "workplace"."product_collections_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."product_collections_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."products_id_seq";
CREATE SEQUENCE "workplace"."products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for promotions_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."promotions_id_seq";
CREATE SEQUENCE "workplace"."promotions_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."promotions_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for sets_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."sets_id_seq";
CREATE SEQUENCE "workplace"."sets_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."sets_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for size_details_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."size_details_id_seq";
CREATE SEQUENCE "workplace"."size_details_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."size_details_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for submitted_codes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."submitted_codes_id_seq";
CREATE SEQUENCE "workplace"."submitted_codes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."submitted_codes_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for temporary_products_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."temporary_products_id_seq";
CREATE SEQUENCE "workplace"."temporary_products_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."temporary_products_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for temporary_products_web_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."temporary_products_web_id_seq";
CREATE SEQUENCE "workplace"."temporary_products_web_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 9223372036854775807
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."temporary_products_web_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for variant_serials_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."variant_serials_id_seq";
CREATE SEQUENCE "workplace"."variant_serials_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."variant_serials_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for variants_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."variants_id_seq";
CREATE SEQUENCE "workplace"."variants_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."variants_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Sequence structure for wedding_rings_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "workplace"."wedding_rings_id_seq";
CREATE SEQUENCE "workplace"."wedding_rings_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "workplace"."wedding_rings_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for _nc_m2m_haravan_collect_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."_nc_m2m_haravan_collect_products";
CREATE TABLE "workplace"."_nc_m2m_haravan_collect_products" (
  "products_id" int4 NOT NULL,
  "haravan_collections_id" int4 NOT NULL
)
;
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for collections
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."collections";
CREATE TABLE "workplace"."collections" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".collections_id_seq'::regclass),
  "collection_name" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "air" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."collections" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_details
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_details";
CREATE TABLE "workplace"."design_details" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_details_id_seq'::regclass),
  "gold_weight" numeric NOT NULL DEFAULT 0,
  "labour_cost" numeric NOT NULL DEFAULT 0,
  "shape_of_main_stone" text COLLATE "pg_catalog"."default",
  "main_stone_length" numeric,
  "main_stone_width" numeric,
  "melee_total_price" numeric
)
;
ALTER TABLE "workplace"."design_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_images
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_images";
CREATE TABLE "workplace"."design_images" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_images_id_seq'::regclass),
  "design_id" int4,
  "material_color" text COLLATE "pg_catalog"."default" DEFAULT 'Vàng Trắng'::text,
  "retouch" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "tick_sync_to_haravan" bool DEFAULT false,
  "note" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."design_images" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_melee_details
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_melee_details";
CREATE TABLE "workplace"."design_melee_details" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_melee_details_id_seq'::regclass),
  "design_detail_id" int4 NOT NULL,
  "quantity" int4 NOT NULL
)
;
ALTER TABLE "workplace"."design_melee_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_price_estimation
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_price_estimation";
CREATE TABLE "workplace"."design_price_estimation" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_price_estimation_id_seq'::regclass),
  "code" text COLLATE "pg_catalog"."default",
  "ref_price" numeric,
  "discount_ref_price" numeric,
  "design_id" int4
)
;
ALTER TABLE "workplace"."design_price_estimation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_set
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."design_set";
CREATE TABLE "workplace"."design_set" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_set_id_seq'::regclass),
  "design_id" int4,
  "set_id" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "workplace"."design_set" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for designs
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."designs";
CREATE TABLE "workplace"."designs" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".design_products_id_seq1'::regclass),
  "code" text COLLATE "pg_catalog"."default",
  "erp_code" text COLLATE "pg_catalog"."default",
  "backup_code" text COLLATE "pg_catalog"."default",
  "design_type" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "design_year" text COLLATE "pg_catalog"."default" DEFAULT '2025'::text,
  "design_seq" int8,
  "usage_status" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "folder_summary" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "link_render" text COLLATE "pg_catalog"."default",
  "link_retouch" text COLLATE "pg_catalog"."default",
  "ring_band_type" text COLLATE "pg_catalog"."default",
  "ring_band_style" text COLLATE "pg_catalog"."default",
  "ring_head_style" text COLLATE "pg_catalog"."default",
  "jewelry_rd_style" text COLLATE "pg_catalog"."default",
  "shape_of_main_stone" text COLLATE "pg_catalog"."default",
  "product_line" text COLLATE "pg_catalog"."default",
  "social_post" bool DEFAULT false,
  "website" bool DEFAULT false,
  "RENDER" bool,
  "RETOUCH" bool DEFAULT false,
  "gold_weight" numeric,
  "main_stone" text COLLATE "pg_catalog"."default",
  "stone_quantity" text COLLATE "pg_catalog"."default",
  "stone_weight" text COLLATE "pg_catalog"."default",
  "diamond_holder" text COLLATE "pg_catalog"."default",
  "source" text COLLATE "pg_catalog"."default",
  "variant_number" int8 DEFAULT 1,
  "collections_id" int4,
  "image_4view" text COLLATE "pg_catalog"."default",
  "image_render" text COLLATE "pg_catalog"."default",
  "image_retouch" text COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "collection_name" text COLLATE "pg_catalog"."default",
  "auto_create_folder" bool,
  "design_code" text COLLATE "pg_catalog"."default",
  "ecom_showed" bool DEFAULT false,
  "tag" text COLLATE "pg_catalog"."default",
  "stock_locations" text COLLATE "pg_catalog"."default",
  "wedding_ring_id" int4,
  "reference_code" text COLLATE "pg_catalog"."default",
  "design_status" text COLLATE "pg_catalog"."default" DEFAULT 'active'::text,
  "erp_code_duplicated" bool DEFAULT false,
  "max_seq" int4,
  "last_synced_render" text COLLATE "pg_catalog"."default",
  "last_synced_4view" text COLLATE "pg_catalog"."default" DEFAULT ''::text,
  "pick_up" date,
  "created_date" date
)
;
ALTER TABLE "workplace"."designs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for designs_temporary_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."designs_temporary_products";
CREATE TABLE "workplace"."designs_temporary_products" (
  "id" int4 NOT NULL,
  "design_code" text COLLATE "pg_catalog"."default",
  "design_type" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "cover" text COLLATE "pg_catalog"."default",
  "link_render" text COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default",
  "erp_code" text COLLATE "pg_catalog"."default",
  "backup_code" text COLLATE "pg_catalog"."default",
  "lark_record_id" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."designs_temporary_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_price_list
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."diamond_price_list";
CREATE TABLE "workplace"."diamond_price_list" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".diamond_price_list_id_seq'::regclass),
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "size" numeric,
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "carat" text COLLATE "pg_catalog"."default",
  "price" numeric
)
;
ALTER TABLE "workplace"."diamond_price_list" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamonds
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."diamonds";
CREATE TABLE "workplace"."diamonds" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".diamomds_id_seq'::regclass),
  "barcode" text COLLATE "pg_catalog"."default",
  "report_lab" text COLLATE "pg_catalog"."default",
  "report_no" int8,
  "price" numeric,
  "cogs" numeric,
  "product_group" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default",
  "cut" text COLLATE "pg_catalog"."default",
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "edge_size_1" float4,
  "edge_size_2" float4,
  "carat" numeric,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "auto_create_haravan_product" bool DEFAULT false,
  "product_id" int8,
  "variant_id" int8,
  "promotions" text COLLATE "pg_catalog"."default" DEFAULT 'CT nền giảm KCV 8%'::text,
  "link_haravan" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "vendor" text COLLATE "pg_catalog"."default",
  "published_scope" text COLLATE "pg_catalog"."default" DEFAULT 'global'::text,
  "qty_onhand" float4,
  "qty_available" float4,
  "qty_commited" float4,
  "qty_incoming" float4,
  "printing_batch" text COLLATE "pg_catalog"."default",
  "g1_collection_id" int4
)
;
ALTER TABLE "workplace"."diamonds" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for ecom_360
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."ecom_360";
CREATE TABLE "workplace"."ecom_360" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".ecom_360_id_seq'::regclass),
  "product_id" int4,
  "path" text COLLATE "pg_catalog"."default" DEFAULT 'https://90814f99c119cd5dc08362580f81a76f.r2.cloudflarestorage.com/jemmia-images/glb/'::text,
  "file_name" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."ecom_360" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for ecom_old_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."ecom_old_products";
CREATE TABLE "workplace"."ecom_old_products" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".ecom_old_products_id_seq'::regclass),
  "product_id" int4,
  "variant_id" int4,
  "published_scope" varchar(50) COLLATE "pg_catalog"."default",
  "product_type" varchar(50) COLLATE "pg_catalog"."default",
  "template_suffix" varchar(50) COLLATE "pg_catalog"."default",
  "title" varchar(64) COLLATE "pg_catalog"."default",
  "code" varchar(50) COLLATE "pg_catalog"."default",
  "shape" varchar(50) COLLATE "pg_catalog"."default",
  "color" varchar(50) COLLATE "pg_catalog"."default",
  "material" varchar(50) COLLATE "pg_catalog"."default",
  "band" varchar(50) COLLATE "pg_catalog"."default",
  "design_id" int4
)
;
ALTER TABLE "workplace"."ecom_old_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for haravan_collections
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."haravan_collections";
CREATE TABLE "workplace"."haravan_collections" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".product_collections_id_seq'::regclass),
  "collection_type" text COLLATE "pg_catalog"."default" DEFAULT 'custom_collection'::text,
  "title" text COLLATE "pg_catalog"."default" NOT NULL,
  "products_count" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "haravan_id" int8,
  "auto_create" bool DEFAULT false,
  "auto_add_product_type" text COLLATE "pg_catalog"."default",
  "handle" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."haravan_collections" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for hrv_locations_1
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."hrv_locations_1";
CREATE TABLE "workplace"."hrv_locations_1" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".hrv_locations_1_id_seq'::regclass),
  "name" varchar COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."hrv_locations_1" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelries
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."jewelries";
CREATE TABLE "workplace"."jewelries" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".jewelries_id_seq'::regclass),
  "barcode" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default" DEFAULT 'Trang sức'::text,
  "supplier_code" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric,
  "diamond_weight" numeric,
  "price" numeric,
  "cogs" numeric,
  "quantity" int2,
  "order_code" text COLLATE "pg_catalog"."default",
  "supplier" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "subcategory" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "applique_material" text COLLATE "pg_catalog"."default",
  "fineness" text COLLATE "pg_catalog"."default",
  "material_color" text COLLATE "pg_catalog"."default",
  "size_type" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "storage_size_type" text COLLATE "pg_catalog"."default",
  "storage_size_1" numeric,
  "storage_size_2" numeric,
  "design_id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "product_group" text COLLATE "pg_catalog"."default",
  "product_type" text COLLATE "pg_catalog"."default",
  "type" text COLLATE "pg_catalog"."default",
  "design_code" text COLLATE "pg_catalog"."default",
  "4view" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "supply_product_type" text COLLATE "pg_catalog"."default",
  "stock" int8,
  "printing_batch" text COLLATE "pg_catalog"."default",
  "haravan_product_type" text COLLATE "pg_catalog"."default",
  "vendor" text COLLATE "pg_catalog"."default",
  "promotions" text COLLATE "pg_catalog"."default",
  "auto_create_haravan_product" bool DEFAULT false,
  "variant_id" int8,
  "product_id" int8,
  "link_haravan" text COLLATE "pg_catalog"."default",
  "qty_onhand" float4,
  "qty_commited" float4,
  "qty_incoming" float4,
  "qty_available" float4,
  "published_scope" text COLLATE "pg_catalog"."default",
  "ring_pair_id" int8,
  "infomation" text COLLATE "pg_catalog"."default",
  "code_in_title" text COLLATE "pg_catalog"."default",
  "stored_sku" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."jewelries" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for materials
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."materials";
CREATE TABLE "workplace"."materials" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".materials_id_seq'::regclass),
  "name" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "market_price" numeric NOT NULL,
  "percentage" float8
)
;
ALTER TABLE "workplace"."materials" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for melee_diamonds
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."melee_diamonds";
CREATE TABLE "workplace"."melee_diamonds" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".melee_diamonds_id_seq'::regclass),
  "haravan_product_id" int4,
  "haravan_variant_id" int4,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "length" numeric,
  "width" numeric,
  "sku" text COLLATE "pg_catalog"."default",
  "barcode" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."melee_diamonds" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for moissanite
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."moissanite";
CREATE TABLE "workplace"."moissanite" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".moissanite_id_seq'::regclass),
  "product_group" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default",
  "length" numeric,
  "width" numeric,
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "fluorescence" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "cut" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "polish" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "symmetry" text COLLATE "pg_catalog"."default" DEFAULT 'Không phân loại'::text,
  "haravan_product_id" int8,
  "haravan_variant_id" int8,
  "auto_create" bool DEFAULT false,
  "price" numeric DEFAULT 0,
  "barcode" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."moissanite" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for moissanite_serials
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."moissanite_serials";
CREATE TABLE "workplace"."moissanite_serials" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".moissanite_serials_id_seq'::regclass),
  "final_encoded_rfid" text COLLATE "pg_catalog"."default",
  "moissanite_id" int4,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "workplace"."moissanite_serials" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."products";
CREATE TABLE "workplace"."products" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".products_id_seq'::regclass),
  "haravan_product_id" int8,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "nc_order" numeric,
  "vendor" text COLLATE "pg_catalog"."default" DEFAULT 'Jemmia'::text,
  "haravan_product_type" text COLLATE "pg_catalog"."default",
  "design_id" int8,
  "published_scope" text COLLATE "pg_catalog"."default" DEFAULT 'pos'::text,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "template_suffix" text COLLATE "pg_catalog"."default",
  "handle" text COLLATE "pg_catalog"."default",
  "auto_create_haravan" bool DEFAULT false,
  "note" text COLLATE "pg_catalog"."default",
  "web_url" text COLLATE "pg_catalog"."default",
  "ecom_title" text COLLATE "pg_catalog"."default",
  "g1_promotion" text COLLATE "pg_catalog"."default" DEFAULT '16%'::text,
  "published" text COLLATE "pg_catalog"."default",
  "estimated_gold_weight" numeric,
  "has_360" bool DEFAULT false,
  "diamond_shape" text COLLATE "pg_catalog"."default",
  "stone_min_width" numeric,
  "stone_max_width" numeric,
  "stone_min_length" numeric,
  "stone_max_length" numeric,
  "collections" text COLLATE "pg_catalog"."default",
  "haravan_collections_id" int4
)
;
ALTER TABLE "workplace"."products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for promotions
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."promotions";
CREATE TABLE "workplace"."promotions" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".promotions_id_seq'::regclass),
  "name" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "starts_at" timestamp(6),
  "ends_at" timestamp(6),
  "take_type" text COLLATE "pg_catalog"."default",
  "set_time_active" timestamp(6),
  "status" text COLLATE "pg_catalog"."default",
  "value" int8,
  "products_selection" text COLLATE "pg_catalog"."default",
  "promotion_id" int8,
  "link_to_admind" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."promotions" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for sets
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."sets";
CREATE TABLE "workplace"."sets" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".sets_id_seq'::regclass),
  "set_name" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "design_codes" text COLLATE "pg_catalog"."default",
  "haravan_product_id" int4,
  "haravan_variant_id" int4,
  "note" text COLLATE "pg_catalog"."default",
  "main_image_link" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."sets" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for size_details
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."size_details";
CREATE TABLE "workplace"."size_details" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".size_details_id_seq'::regclass),
  "panel_size_type" text COLLATE "pg_catalog"."default",
  "length" numeric,
  "quantity" int8,
  "jewelry_id" int4,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "width" numeric
)
;
ALTER TABLE "workplace"."size_details" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for submitted_codes
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."submitted_codes";
CREATE TABLE "workplace"."submitted_codes" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".submitted_codes_id_seq'::regclass),
  "codes" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_by" varchar COLLATE "pg_catalog"."default",
  "notes" text COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "tag" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."submitted_codes" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for temporary_products
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."temporary_products";
CREATE TABLE "workplace"."temporary_products" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".temporary_products_id_seq'::regclass),
  "haravan_product_id" int4,
  "haravan_variant_id" int4,
  "customer_name" text COLLATE "pg_catalog"."default",
  "variant_title" text COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "code" text COLLATE "pg_catalog"."default",
  "price" numeric DEFAULT 0,
  "product_information" text COLLATE "pg_catalog"."default",
  "design_id" int4,
  "category" text COLLATE "pg_catalog"."default",
  "applique_material" text COLLATE "pg_catalog"."default",
  "material_color" text COLLATE "pg_catalog"."default",
  "size_type" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "fineness" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "design_code" text COLLATE "pg_catalog"."default",
  "summary" text COLLATE "pg_catalog"."default",
  "lark_base_record_id" text COLLATE "pg_catalog"."default",
  "use_case" text COLLATE "pg_catalog"."default",
  "variant_serial_id" int4,
  "ticket_type" text COLLATE "pg_catalog"."default",
  "product_group" text COLLATE "pg_catalog"."default",
  "gia_report_no" text COLLATE "pg_catalog"."default",
  "ref_design_code" text COLLATE "pg_catalog"."default",
  "request_code" text COLLATE "pg_catalog"."default",
  "is_create_product" text COLLATE "pg_catalog"."default",
  "is_notify_lark_reorder" bool
)
;
ALTER TABLE "workplace"."temporary_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for temporary_products_web
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."temporary_products_web";
CREATE TABLE "workplace"."temporary_products_web" (
  "id" int8 NOT NULL DEFAULT nextval('"workplace".temporary_products_web_id_seq'::regclass),
  "customer_name" varchar COLLATE "pg_catalog"."default",
  "customer_phone" varchar COLLATE "pg_catalog"."default",
  "original_hrv_product_id" varchar COLLATE "pg_catalog"."default",
  "original_hrv_variant_id" varchar COLLATE "pg_catalog"."default",
  "token" varchar COLLATE "pg_catalog"."default",
  "title" varchar COLLATE "pg_catalog"."default",
  "price" int8,
  "line_price" int8,
  "price_original" int8,
  "line_price_orginal" int8,
  "quantity" int4,
  "sku" varchar COLLATE "pg_catalog"."default",
  "grams" float8,
  "product_type" varchar COLLATE "pg_catalog"."default",
  "vendor" varchar COLLATE "pg_catalog"."default",
  "properties" jsonb,
  "gift_card" bool,
  "url" varchar COLLATE "pg_catalog"."default",
  "image" varchar COLLATE "pg_catalog"."default",
  "handle" varchar COLLATE "pg_catalog"."default",
  "requires_shipping" bool,
  "not_allow_promotion" bool,
  "product_title" varchar COLLATE "pg_catalog"."default",
  "barcode" varchar COLLATE "pg_catalog"."default",
  "product_description" varchar COLLATE "pg_catalog"."default",
  "variant_title" varchar COLLATE "pg_catalog"."default",
  "variant_options" jsonb,
  "promotionref" varchar COLLATE "pg_catalog"."default",
  "promotionby" jsonb,
  "haravan_product_id" int8,
  "haravan_variant_id" int8
)
;
ALTER TABLE "workplace"."temporary_products_web" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for temtab
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."temtab";
CREATE TABLE "workplace"."temtab" (
  "design_code" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "column3" varchar(50) COLLATE "pg_catalog"."default",
  "column4" varchar(50) COLLATE "pg_catalog"."default",
  "column5" varchar(50) COLLATE "pg_catalog"."default",
  "column6" varchar(50) COLLATE "pg_catalog"."default",
  "column7" varchar(50) COLLATE "pg_catalog"."default",
  "column8" varchar(50) COLLATE "pg_catalog"."default",
  "column9" varchar(50) COLLATE "pg_catalog"."default",
  "column10" varchar(50) COLLATE "pg_catalog"."default",
  "column11" varchar(50) COLLATE "pg_catalog"."default",
  "column12" varchar(50) COLLATE "pg_catalog"."default",
  "column13" varchar(50) COLLATE "pg_catalog"."default",
  "column14" varchar(50) COLLATE "pg_catalog"."default",
  "column15" varchar(50) COLLATE "pg_catalog"."default",
  "column16" varchar(50) COLLATE "pg_catalog"."default",
  "column17" varchar(50) COLLATE "pg_catalog"."default",
  "column18" varchar(50) COLLATE "pg_catalog"."default",
  "column19" varchar(50) COLLATE "pg_catalog"."default",
  "column20" varchar(50) COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."temtab" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variant_serials
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."variant_serials";
CREATE TABLE "workplace"."variant_serials" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".variant_serials_id_seq'::regclass),
  "variant_id" int8,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "nc_order" numeric,
  "serial_number" text COLLATE "pg_catalog"."default",
  "printing_batch" text COLLATE "pg_catalog"."default",
  "encode_barcode" text COLLATE "pg_catalog"."default",
  "final_encoded_barcode" text COLLATE "pg_catalog"."default",
  "old_encode_barcode" text COLLATE "pg_catalog"."default",
  "old_finnal_encode_barcode" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric,
  "diamond_weight" numeric,
  "old_variant_id" int8,
  "old_product_id" int8,
  "quantity" numeric,
  "supplier" text COLLATE "pg_catalog"."default",
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "cogs" numeric,
  "old_barcode" text COLLATE "pg_catalog"."default",
  "order_on" text COLLATE "pg_catalog"."default",
  "stock_id" int8,
  "order_id" int8,
  "storage_size_type" text COLLATE "pg_catalog"."default",
  "storage_size_1" numeric,
  "storage_size_2" numeric,
  "note" text COLLATE "pg_catalog"."default",
  "stock_at" text COLLATE "pg_catalog"."default",
  "order_reference" text COLLATE "pg_catalog"."default",
  "last_rfid_scan_time" timestamptz(6),
  "fulfillment_status_value" text COLLATE "pg_catalog"."default",
  "lark_record_id" text COLLATE "pg_catalog"."default",
  "arrival_date" date,
  "actual_gold_price" numeric,
  "actual_melee_price" numeric,
  "actual_labor_cost" numeric
)
;
ALTER TABLE "workplace"."variant_serials" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variant_serials_lark
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."variant_serials_lark";
CREATE TABLE "workplace"."variant_serials_lark" (
  "id" int4 NOT NULL,
  "lark_record_id" text COLLATE "pg_catalog"."default",
  "db_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;
ALTER TABLE "workplace"."variant_serials_lark" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for variants
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."variants";
CREATE TABLE "workplace"."variants" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".variants_id_seq'::regclass),
  "haravan_variant_id" int8,
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "nc_order" numeric,
  "product_id" int8,
  "barcode" text COLLATE "pg_catalog"."default",
  "inventory_quantity" int8,
  "old_inventory_quantity" int8,
  "sku" text COLLATE "pg_catalog"."default",
  "qty_available" int8,
  "qty_onhand" int8,
  "qty_commited" int8,
  "qty_incoming" int8,
  "category" text COLLATE "pg_catalog"."default" DEFAULT 'Trang sức'::text,
  "applique_material" text COLLATE "pg_catalog"."default",
  "fineness" text COLLATE "pg_catalog"."default",
  "material_color" text COLLATE "pg_catalog"."default",
  "size_type" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "database_updated_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "database_created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "haravan_product_id" int8,
  "price" numeric,
  "auto_create_variant" bool DEFAULT false,
  "note" text COLLATE "pg_catalog"."default",
  "estimated_gold_weight" float4
)
;
ALTER TABLE "workplace"."variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for wedding_rings
-- ----------------------------
DROP TABLE IF EXISTS "workplace"."wedding_rings";
CREATE TABLE "workplace"."wedding_rings" (
  "id" int4 NOT NULL DEFAULT nextval('"workplace".wedding_rings_id_seq'::regclass),
  "description" text COLLATE "pg_catalog"."default",
  "ecom_title" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "workplace"."wedding_rings" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for insert_design_id_into_design_details
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."insert_design_id_into_design_details"();
CREATE FUNCTION "workplace"."insert_design_id_into_design_details"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Insert a new record into the workplace.design_details table with the new design_id
    INSERT INTO workplace.design_details (design_id)
    VALUES (NEW.id); -- The default values for gold_weight and labour_cost will be used
    
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."insert_design_id_into_design_details"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_archived_update
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_archived_update"();
CREATE FUNCTION "workplace"."prevent_archived_update"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    IF OLD.design_status = 'archived' AND (NEW.design_status <> 'archived' OR NEW.design_status IS NULL) THEN
        RAISE EXCEPTION 'Cannot change design_status from archived to another value';
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_archived_update"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_design_code_attributes_update_on_designs
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_design_code_attributes_update_on_designs"();
CREATE FUNCTION "workplace"."prevent_design_code_attributes_update_on_designs"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    IF EXISTS (SELECT 1 FROM workplace.products WHERE design_id = NEW.id) THEN
        IF NEW.design_type <> OLD.design_type OR
           NEW.gender <> OLD.gender OR
           NEW.design_year <> OLD.design_year OR
           NEW.design_seq <> OLD.design_seq OR
           NEW.source <> OLD.source OR
           NEW.variant_number <> OLD.variant_number OR
           NEW.diamond_holder <> OLD.diamond_holder OR
			NEW.design_type IS NULL OR
			NEW.gender IS NULL OR
			NEW.design_year IS NULL OR
			NEW.source IS NULL OR
			NEW.design_seq IS NULL OR
			NEW.variant_number IS NULL OR
			NEW.diamond_holder IS NULL THEN
            RAISE EXCEPTION 'Update is not allowed on these columns for designs where id exists in products.';
        END IF;
    END IF;
    RETURN NEW; -- Allow the update if conditions are met
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_design_code_attributes_update_on_designs"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_design_details_deletion
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_design_details_deletion"();
CREATE FUNCTION "workplace"."prevent_design_details_deletion"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    RAISE EXCEPTION 'Deleting records from design_details is not allowed';
    RETURN NULL;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_design_details_deletion"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_design_id_update
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_design_id_update"();
CREATE FUNCTION "workplace"."prevent_design_id_update"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Chỉ kiểm tra nếu OLD.design_id khác null
    IF OLD.design_id IS NOT NULL THEN
        -- Kiểm tra xem design_id có thay đổi không
        IF NEW.design_id IS DISTINCT FROM OLD.design_id THEN
            RAISE EXCEPTION 'Updating design_id is not allowed';
        END IF;
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_design_id_update"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_barcode
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_barcode"();
CREATE FUNCTION "workplace"."prevent_update_barcode"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
	IF (OLD.barcode IS NOT NULL AND NEW.barcode IS DISTINCT FROM OLD.barcode) THEN 
		RAISE EXCEPTION 'barcode is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_barcode"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_final_encoded_barcode
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_final_encoded_barcode"();
CREATE FUNCTION "workplace"."prevent_update_final_encoded_barcode"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
--	IF (OLD.final_encoded_barcode IS NOT NULL AND NEW.final_encoded_barcode IS DISTINCT FROM OLD.final_encoded_barcode) THEN 
--		RAISE EXCEPTION 'final_encoded_barcode is not allowed to be updated!';
--	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_final_encoded_barcode"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_serial_number
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_serial_number"();
CREATE FUNCTION "workplace"."prevent_update_serial_number"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
	IF (OLD.serial_number IS NOT NULL AND NEW.serial_number IS DISTINCT FROM OLD.serial_number) THEN 
		RAISE EXCEPTION 'serial_number is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_serial_number"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_sku_attribtes
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_sku_attribtes"();
CREATE FUNCTION "workplace"."prevent_update_sku_attribtes"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
	IF OLD.sku IS NOT NULL THEN
		IF 	(OLD.product_id IS NOT NULL AND OLD.product_id <> NEW.product_id) OR
			(OLD.category IS NOT NULL AND OLD.category <> NEW.category) OR
			(OLD.applique_material IS NOT NULL AND OLD.applique_material <> NEW.applique_material) OR
			(OLD.fineness IS NOT NULL AND OLD.fineness <> NEW.fineness) OR
			(OLD.material_color IS NOT NULL AND OLD.material_color <> NEW.material_color) OR
			(OLD.size_type IS NOT NULL AND OLD.size_type <> NEW.size_type) OR
			(OLD.ring_size IS NOT NULL AND OLD.ring_size <> NEW.ring_size) THEN
				RAISE EXCEPTION 'Update to column(s) not allowed when they are NOT NULL';
		END IF;
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_sku_attribtes"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_variant_id
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_variant_id"();
CREATE FUNCTION "workplace"."prevent_update_variant_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
	IF OLD.variant_id IS NULL THEN
		RETURN NEW;
	END IF;
	IF OLD.variant_id IS NOT NULL AND NEW.variant_id IS DISTINCT FROM OLD.variant_id THEN 
		RAISE EXCEPTION 'variant_id is not allowed to be updated!';
	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_variant_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for prevent_update_variant_serial_id
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."prevent_update_variant_serial_id"();
CREATE FUNCTION "workplace"."prevent_update_variant_serial_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN 
--	IF (NEW.variant_serial_id is null) then 
--		RAISE EXCEPTION 'barcode is not allowed to be updated!';
--	END IF;
--	IF (OLD.variant_serial_id IS NOT NULL AND NEW.variant_serial_id IS DISTINCT FROM OLD.variant_serial_id) THEN 
--		RAISE EXCEPTION 'barcode is not allowed to be updated!';
--	END IF;
	RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."prevent_update_variant_serial_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_serial_number
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."set_serial_number"();
CREATE FUNCTION "workplace"."set_serial_number"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
    current_year_month TEXT;
    max_serial TEXT;
    next_serial INTEGER;
    serial_number TEXT;
BEGIN
    -- Compute the current year and month in YYMM format
    current_year_month := TO_CHAR(NOW(), 'YYMM');

    -- Get the maximum serial number for the current year and month
    SELECT MAX(vs.serial_number) INTO max_serial
    FROM workplace.variant_serials vs
    WHERE vs.serial_number LIKE current_year_month || '%';

    -- Determine the next serial number
    IF max_serial IS NOT NULL THEN
        -- Extract the numeric part, increment, and pad with zeros
        next_serial := CAST(SUBSTRING(max_serial FROM 5) AS INTEGER) + 1;
    ELSE
        -- Start from 6 if no serial exists for the current year and month
        next_serial := 6;
    END IF;

    -- Format the serial number as a 4-digit string
    serial_number := LPAD(next_serial::TEXT, 4, '0');

    -- Combine year_month and serial_number
    NEW.serial_number := current_year_month || serial_number;

    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."set_serial_number"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for to_date_time_safe
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."to_date_time_safe"("value" text, "format" text);
CREATE FUNCTION "workplace"."to_date_time_safe"("value" text, "format" text)
  RETURNS "pg_catalog"."timestamp" AS $BODY$
  BEGIN
    RETURN to_timestamp(value, format);
    EXCEPTION
      WHEN others THEN RETURN NULL;  
  END;
  $BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."to_date_time_safe"("value" text, "format" text) OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_database_updated_at_column
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_database_updated_at_column"();
CREATE FUNCTION "workplace"."update_database_updated_at_column"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.database_updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_database_updated_at_column"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_design_max_seq
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_design_max_seq"();
CREATE FUNCTION "workplace"."update_design_max_seq"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    UPDATE workplace.designs
    SET max_seq = (SELECT MAX(design_seq) 
                   FROM workplace.designs 
                   WHERE design_year = NEW.design_year)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_design_max_seq"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_last_rfid_scan_time
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_last_rfid_scan_time"();
CREATE FUNCTION "workplace"."update_last_rfid_scan_time"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
    UPDATE workplace.variant_serials AS vs
	SET
	stock_at = latest_scan.warehouse,
	last_rfid_scan_time = latest_scan.date_created
	FROM (
	SELECT date_created, warehouse, rfid_tag, serial_number
	FROM (
	    SELECT a.date_created, a.warehouse, b.rfid_tag, c.serial_number, 
	           ROW_NUMBER() OVER (PARTITION BY b.rfid_tag ORDER BY a.date_created DESC) AS rn
	    FROM (
	        SELECT id, date_created, warehouse, jsonb_array_elements(lines)::INT4 AS line_id
	        FROM inventory_cms.inventory_check_sheets
	    ) a
	    JOIN (
	        SELECT id AS line_id, element->>0 AS rfid_tag
	        FROM inventory_cms.inventory_check_lines, jsonb_array_elements(rfid_tags) AS element
	    ) b ON a.line_id = b.line_id
	    LEFT JOIN workplace.variant_serials as c ON c.final_encoded_barcode =  LOWER(b.rfid_tag)
	) sub
	WHERE rn = 1
	
	) AS latest_scan
	WHERE
	vs.final_encoded_barcode = LOWER(latest_scan.rfid_tag);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_last_rfid_scan_time"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_order_references_in_variant_serials
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_order_references_in_variant_serials"();
CREATE FUNCTION "workplace"."update_order_references_in_variant_serials"()
  RETURNS "pg_catalog"."void" AS $BODY$
BEGIN
    UPDATE workplace.variant_serials AS wvs
    SET 
        order_reference = A.order_code,
        fulfillment_status_value = A.fulfillment_status_value
    FROM (
        WITH latest_line_items AS (
            SELECT 
                bli.*,
                ROW_NUMBER() OVER (PARTITION BY bli.serial_number ORDER BY bli.database_updated_at DESC) AS row_num
            FROM 
                bizflycrm.line_items AS bli
        )
        SELECT
            bsn.serial_number AS serial_number,
            serial_number_item ->> 'id' AS id,
            lli.barcode,
            bo.order_code,
            bo.fulfillment_status_value
        FROM
            latest_line_items AS lli
            LEFT JOIN bizflycrm.orders AS bo 
                ON lli.order_id = bo.id
            JOIN LATERAL jsonb_array_elements(
                CASE 
                    WHEN jsonb_typeof(lli.serial_number) = 'array' THEN lli.serial_number
                    WHEN jsonb_typeof(lli.serial_number) = 'object' THEN jsonb_build_array(lli.serial_number)
                    ELSE '[]'::jsonb
                END
            ) AS serial_number_item ON TRUE
            LEFT JOIN bizflycrm.serial_numbers AS bsn
                ON serial_number_item ->> 'id' = bsn.id  
        WHERE 
            bo.cancelled_status_value IN ('chưa', 'chưa hủy đơn hàng')
            AND lli.row_num = 1 
    ) AS A
    WHERE wvs.serial_number = A.serial_number;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_order_references_in_variant_serials"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_total_price
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."update_total_price"();
CREATE FUNCTION "workplace"."update_total_price"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Update the total_price in the designs table
    UPDATE workplace.design_details
    SET melee_total_price = (
        SELECT SUM(md.price * dmd.quantity)
        FROM workplace.design_melee_details dmd
        JOIN workplace.melee_diamonds md ON dmd.melee_diamond_id = md.id
        WHERE dmd.design_detail_id = NEW.design_detail_id
    )
    WHERE id = NEW.design_detail_id;

    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."update_total_price"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for validate_codes_pattern
-- ----------------------------
DROP FUNCTION IF EXISTS "workplace"."validate_codes_pattern"();
CREATE FUNCTION "workplace"."validate_codes_pattern"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Validate the 'codes' column using a regex that allows letters (a-z, A-Z), numbers (0-9), and dashes (-)
    IF NEW.codes !~ '^([a-zA-Z0-9-]+)(\n[a-zA-Z0-9-]+)*$' THEN
        RAISE EXCEPTION 'Invalid codes pattern. Each line must only contain letters (a-z, A-Z), numbers (0-9), or dashes (-).';
    END IF;

    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "workplace"."validate_codes_pattern"() OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."collections_id_seq"
OWNED BY "workplace"."collections"."id";
SELECT setval('"workplace"."collections_id_seq"', 97, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_details_id_seq"
OWNED BY "workplace"."design_details"."id";
SELECT setval('"workplace"."design_details_id_seq"', 3180, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_images_id_seq"
OWNED BY "workplace"."design_images"."id";
SELECT setval('"workplace"."design_images_id_seq"', 1675, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_melee_details_id_seq"
OWNED BY "workplace"."design_melee_details"."id";
SELECT setval('"workplace"."design_melee_details_id_seq"', 156, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_price_estimation_id_seq"
OWNED BY "workplace"."design_price_estimation"."id";
SELECT setval('"workplace"."design_price_estimation_id_seq"', 486, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
SELECT setval('"workplace"."design_products_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_products_id_seq1"
OWNED BY "workplace"."designs"."id";
SELECT setval('"workplace"."design_products_id_seq1"', 9369, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."design_set_id_seq"
OWNED BY "workplace"."design_set"."id";
SELECT setval('"workplace"."design_set_id_seq"', 111, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."diamomds_id_seq"
OWNED BY "workplace"."diamonds"."id";
SELECT setval('"workplace"."diamomds_id_seq"', 13993, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."diamond_price_list_id_seq"
OWNED BY "workplace"."diamond_price_list"."id";
SELECT setval('"workplace"."diamond_price_list_id_seq"', 263, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."ecom_360_id_seq"
OWNED BY "workplace"."ecom_360"."id";
SELECT setval('"workplace"."ecom_360_id_seq"', 188, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."ecom_old_products_id_seq"
OWNED BY "workplace"."ecom_old_products"."id";
SELECT setval('"workplace"."ecom_old_products_id_seq"', 745, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."hrv_locations_1_id_seq"
OWNED BY "workplace"."hrv_locations_1"."id";
SELECT setval('"workplace"."hrv_locations_1_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."jewelries_id_seq"
OWNED BY "workplace"."jewelries"."id";
SELECT setval('"workplace"."jewelries_id_seq"', 12364, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."materials_id_seq"
OWNED BY "workplace"."materials"."id";
SELECT setval('"workplace"."materials_id_seq"', 8, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."melee_diamonds_id_seq"
OWNED BY "workplace"."melee_diamonds"."id";
SELECT setval('"workplace"."melee_diamonds_id_seq"', 63, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."moissanite_id_seq"
OWNED BY "workplace"."moissanite"."id";
SELECT setval('"workplace"."moissanite_id_seq"', 183, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."moissanite_serials_id_seq"
OWNED BY "workplace"."moissanite_serials"."id";
SELECT setval('"workplace"."moissanite_serials_id_seq"', 3, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."product_collections_id_seq"
OWNED BY "workplace"."haravan_collections"."id";
SELECT setval('"workplace"."product_collections_id_seq"', 17, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."products_id_seq"
OWNED BY "workplace"."products"."id";
SELECT setval('"workplace"."products_id_seq"', 6820, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."promotions_id_seq"
OWNED BY "workplace"."promotions"."id";
SELECT setval('"workplace"."promotions_id_seq"', 8, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."sets_id_seq"
OWNED BY "workplace"."sets"."id";
SELECT setval('"workplace"."sets_id_seq"', 32, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."size_details_id_seq"
OWNED BY "workplace"."size_details"."id";
SELECT setval('"workplace"."size_details_id_seq"', 291, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."submitted_codes_id_seq"
OWNED BY "workplace"."submitted_codes"."id";
SELECT setval('"workplace"."submitted_codes_id_seq"', 367, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."temporary_products_id_seq"
OWNED BY "workplace"."temporary_products"."id";
SELECT setval('"workplace"."temporary_products_id_seq"', 1355, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."temporary_products_web_id_seq"
OWNED BY "workplace"."temporary_products_web"."id";
SELECT setval('"workplace"."temporary_products_web_id_seq"', 36, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."variant_serials_id_seq"
OWNED BY "workplace"."variant_serials"."id";
SELECT setval('"workplace"."variant_serials_id_seq"', 7174, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."variants_id_seq"
OWNED BY "workplace"."variants"."id";
SELECT setval('"workplace"."variants_id_seq"', 5396, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "workplace"."wedding_rings_id_seq"
OWNED BY "workplace"."wedding_rings"."id";
SELECT setval('"workplace"."wedding_rings_id_seq"', 433, true);

-- ----------------------------
-- Indexes structure for table _nc_m2m_haravan_collect_products
-- ----------------------------
CREATE INDEX "fk_haravan_co_products_0_kxecf3y_" ON "workplace"."_nc_m2m_haravan_collect_products" USING btree (
  "haravan_collections_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "fk_haravan_co_products_tl93hnbjtq" ON "workplace"."_nc_m2m_haravan_collect_products" USING btree (
  "products_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _nc_m2m_haravan_collect_products
-- ----------------------------
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "_nc_m2m_haravan_collect_products_pkey" PRIMARY KEY ("products_id", "haravan_collections_id");

-- ----------------------------
-- Triggers structure for table collections
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_collections" BEFORE UPDATE ON "workplace"."collections"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table collections
-- ----------------------------
ALTER TABLE "workplace"."collections" ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table design_details
-- ----------------------------
ALTER TABLE "workplace"."design_details" ADD CONSTRAINT "design_details_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table design_images
-- ----------------------------
CREATE TRIGGER "set_updated_at_design_images" BEFORE UPDATE ON "workplace"."design_images"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table design_images
-- ----------------------------
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "unique_design_color" UNIQUE ("design_id", "material_color");

-- ----------------------------
-- Primary Key structure for table design_images
-- ----------------------------
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "design_images_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table design_melee_details
-- ----------------------------
CREATE TRIGGER "trg_update_melee_total_price" AFTER INSERT OR UPDATE ON "workplace"."design_melee_details"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_total_price"();

-- ----------------------------
-- Primary Key structure for table design_melee_details
-- ----------------------------
ALTER TABLE "workplace"."design_melee_details" ADD CONSTRAINT "design_melee_details_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table design_price_estimation
-- ----------------------------
ALTER TABLE "workplace"."design_price_estimation" ADD CONSTRAINT "design_price_estimation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table design_set
-- ----------------------------
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table designs
-- ----------------------------
CREATE INDEX "designs_collections_id_index" ON "workplace"."designs" USING btree (
  "collections_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "unique_combination_constraint_design_code" ON "workplace"."designs" USING btree (
  "design_type" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "gender" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "diamond_holder" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "source" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "design_year" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST,
  "design_seq" "pg_catalog"."int8_ops" ASC NULLS LAST,
  "variant_number" "pg_catalog"."int8_ops" ASC NULLS LAST
) WHERE design_type IS NOT NULL AND gender IS NOT NULL AND diamond_holder IS NOT NULL AND source IS NOT NULL AND design_year IS NOT NULL AND design_seq IS NOT NULL AND variant_number IS NOT NULL;

-- ----------------------------
-- Triggers structure for table designs
-- ----------------------------
CREATE TRIGGER "prevent_archived_status_change" BEFORE UPDATE ON "workplace"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_archived_update"();
CREATE TRIGGER "set_updated_at_workplace_designs" BEFORE UPDATE ON "workplace"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();
CREATE TRIGGER "trg_update_design_max_seq" AFTER INSERT OR UPDATE OF "design_year" ON "workplace"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_design_max_seq"();

-- ----------------------------
-- Uniques structure for table designs
-- ----------------------------
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_design_code" UNIQUE ("code");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_design_code_constraint" UNIQUE ("code");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_id_constraint" UNIQUE ("id");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "unique_code_constraint" UNIQUE ("code");
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "design_code_attributes_unique" UNIQUE ("design_type", "gender", "diamond_holder", "source", "design_year", "design_seq", "variant_number");

-- ----------------------------
-- Primary Key structure for table designs
-- ----------------------------
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "design_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table designs_temporary_products
-- ----------------------------
ALTER TABLE "workplace"."designs_temporary_products" ADD CONSTRAINT "designs_temporary_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table diamond_price_list
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_diamond_price_list" BEFORE UPDATE ON "workplace"."diamond_price_list"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table diamond_price_list
-- ----------------------------
ALTER TABLE "workplace"."diamond_price_list" ADD CONSTRAINT "diamond_price_list_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table diamonds
-- ----------------------------
CREATE INDEX "idx_variant_id_workplace_diamonds" ON "workplace"."diamonds" USING btree (
  "variant_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "unique_variant_id" ON "workplace"."diamonds" USING btree (
  "variant_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table diamonds
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_diamonds" BEFORE UPDATE ON "workplace"."diamonds"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table diamonds
-- ----------------------------
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "unique_diamond_barcode" UNIQUE ("barcode");

-- ----------------------------
-- Primary Key structure for table diamonds
-- ----------------------------
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "diamomds_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ecom_360
-- ----------------------------
ALTER TABLE "workplace"."ecom_360" ADD CONSTRAINT "ecom_360_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ecom_old_products
-- ----------------------------
ALTER TABLE "workplace"."ecom_old_products" ADD CONSTRAINT "ecom_old_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table haravan_collections
-- ----------------------------
ALTER TABLE "workplace"."haravan_collections" ADD CONSTRAINT "product_collections_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table hrv_locations_1
-- ----------------------------
ALTER TABLE "workplace"."hrv_locations_1" ADD CONSTRAINT "hrv_locations_1_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table jewelries
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_jewelries" BEFORE UPDATE ON "workplace"."jewelries"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table jewelries
-- ----------------------------
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "unique_barcode_jewelries" UNIQUE ("barcode");
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "jewelries_unique_variant_id" UNIQUE ("variant_id");

-- ----------------------------
-- Primary Key structure for table jewelries
-- ----------------------------
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "jewelries_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table materials
-- ----------------------------
ALTER TABLE "workplace"."materials" ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table melee_diamonds
-- ----------------------------
ALTER TABLE "workplace"."melee_diamonds" ADD CONSTRAINT "melee_diamonds_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table moissanite
-- ----------------------------
ALTER TABLE "workplace"."moissanite" ADD CONSTRAINT "unique_moissannite_sku_attributes" UNIQUE ("product_group", "shape", "length", "width", "color", "clarity", "fluorescence", "cut", "polish", "symmetry");
ALTER TABLE "workplace"."moissanite" ADD CONSTRAINT "moissanite_barcode_key" UNIQUE ("barcode");

-- ----------------------------
-- Primary Key structure for table moissanite
-- ----------------------------
ALTER TABLE "workplace"."moissanite" ADD CONSTRAINT "moissanite_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table moissanite_serials
-- ----------------------------
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "unique_final_encoded_rfid" UNIQUE ("final_encoded_rfid");

-- ----------------------------
-- Primary Key structure for table moissanite_serials
-- ----------------------------
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "moissanite_serials_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table products
-- ----------------------------
CREATE INDEX "fk_haravan_co_products_v88qytf5oz" ON "workplace"."products" USING btree (
  "haravan_collections_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "products_order_idx" ON "workplace"."products" USING btree (
  "nc_order" "pg_catalog"."numeric_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table products
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_products" BEFORE UPDATE ON "workplace"."products"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Uniques structure for table products
-- ----------------------------
ALTER TABLE "workplace"."products" ADD CONSTRAINT "uniqe_product_id" UNIQUE ("haravan_product_id");
ALTER TABLE "workplace"."products" ADD CONSTRAINT "unique_design_id" UNIQUE ("design_id");

-- ----------------------------
-- Primary Key structure for table products
-- ----------------------------
ALTER TABLE "workplace"."products" ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table promotions
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_promotions" BEFORE UPDATE ON "workplace"."promotions"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table promotions
-- ----------------------------
ALTER TABLE "workplace"."promotions" ADD CONSTRAINT "promotions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table sets
-- ----------------------------
ALTER TABLE "workplace"."sets" ADD CONSTRAINT "sets_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table size_details
-- ----------------------------
CREATE TRIGGER "set_updated_at_workplace_size_details" BEFORE UPDATE ON "workplace"."size_details"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table size_details
-- ----------------------------
ALTER TABLE "workplace"."size_details" ADD CONSTRAINT "size_details_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table submitted_codes
-- ----------------------------
CREATE TRIGGER "check_codes_pattern" BEFORE INSERT OR UPDATE ON "workplace"."submitted_codes"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."validate_codes_pattern"();
CREATE TRIGGER "set_updated_at_workplace_submitted_codes" BEFORE UPDATE ON "workplace"."submitted_codes"
FOR EACH ROW
EXECUTE PROCEDURE "public"."update_database_updated_at_column"();

-- ----------------------------
-- Primary Key structure for table submitted_codes
-- ----------------------------
ALTER TABLE "workplace"."submitted_codes" ADD CONSTRAINT "submitted_codes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table temporary_products
-- ----------------------------
CREATE TRIGGER "prevent_update_variant_serial_id_trigger" BEFORE UPDATE ON "workplace"."temporary_products"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_variant_serial_id"();

-- ----------------------------
-- Uniques structure for table temporary_products
-- ----------------------------
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "unique_lark_base_record_id" UNIQUE ("lark_base_record_id");
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_variant_serial_id_key" UNIQUE ("variant_serial_id");

-- ----------------------------
-- Primary Key structure for table temporary_products
-- ----------------------------
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table temporary_products_web
-- ----------------------------
ALTER TABLE "workplace"."temporary_products_web" ADD CONSTRAINT "temporary_products_web_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table temtab
-- ----------------------------
ALTER TABLE "workplace"."temtab" ADD CONSTRAINT "temtab_design_code_key" UNIQUE ("design_code");

-- ----------------------------
-- Indexes structure for table variant_serials
-- ----------------------------
CREATE INDEX "variant_serials_order_idx" ON "workplace"."variant_serials" USING btree (
  "nc_order" "pg_catalog"."numeric_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table variant_serials
-- ----------------------------
CREATE TRIGGER "prevent_update_final_encoded_barcode" BEFORE UPDATE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_final_encoded_barcode"();
CREATE TRIGGER "prevent_update_serial_number" BEFORE UPDATE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_serial_number"();
CREATE TRIGGER "prevent_update_variant_id" BEFORE DELETE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_variant_id"();
CREATE TRIGGER "set_updated_at_workplace_products" BEFORE UPDATE ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();
CREATE TRIGGER "trigger_set_serial_number" BEFORE INSERT ON "workplace"."variant_serials"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."set_serial_number"();

-- ----------------------------
-- Uniques structure for table variant_serials
-- ----------------------------
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "unique_serial_number" UNIQUE ("serial_number");
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "unique_final_encode_barcode" UNIQUE ("final_encoded_barcode");
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "unique_serial_number_final_encoded_barcode" UNIQUE ("serial_number", "final_encoded_barcode");

-- ----------------------------
-- Primary Key structure for table variant_serials
-- ----------------------------
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "variant_serials_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table variant_serials_lark
-- ----------------------------
ALTER TABLE "workplace"."variant_serials_lark" ADD CONSTRAINT "variant_serials_lark_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table variants
-- ----------------------------
CREATE INDEX "idx_harvan_variant_id_workplace_variants" ON "workplace"."variants" USING btree (
  "haravan_variant_id" "pg_catalog"."int8_ops" ASC NULLS LAST
);
CREATE INDEX "variants_order_idx" ON "workplace"."variants" USING btree (
  "nc_order" "pg_catalog"."numeric_ops" ASC NULLS LAST
);

-- ----------------------------
-- Triggers structure for table variants
-- ----------------------------
CREATE TRIGGER "prevent_update_barcode" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_barcode"();
CREATE TRIGGER "prevent_update_if_not_null_trigger" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."prevent_update_sku_attribtes"();
CREATE TRIGGER "set_updated_at_workplace_products" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "workplace"."update_database_updated_at_column"();
CREATE TRIGGER "trigger_prevent_product_id_update" BEFORE UPDATE ON "workplace"."variants"
FOR EACH ROW
EXECUTE PROCEDURE "public"."prevent_product_id_update"();

-- ----------------------------
-- Uniques structure for table variants
-- ----------------------------
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "uniqe_variant_id" UNIQUE ("haravan_variant_id");
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "unique_sku" UNIQUE ("sku");
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "unique_sku_attributes" UNIQUE ("product_id", "category", "applique_material", "fineness", "material_color", "size_type", "ring_size");
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "unique_barcode" UNIQUE ("barcode");

-- ----------------------------
-- Primary Key structure for table variants
-- ----------------------------
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "variants_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table wedding_rings
-- ----------------------------
ALTER TABLE "workplace"."wedding_rings" ADD CONSTRAINT "wedding_rings_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table _nc_m2m_haravan_collect_products
-- ----------------------------
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "fk_haravan_co_products_8v31fxenpy" FOREIGN KEY ("products_id") REFERENCES "workplace"."products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "fk_haravan_co_products_q3phsaq_nx" FOREIGN KEY ("haravan_collections_id") REFERENCES "workplace"."haravan_collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_images
-- ----------------------------
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "design_images_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_melee_details
-- ----------------------------
ALTER TABLE "workplace"."design_melee_details" ADD CONSTRAINT "fk_design_detail" FOREIGN KEY ("design_detail_id") REFERENCES "workplace"."design_details" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_price_estimation
-- ----------------------------
ALTER TABLE "workplace"."design_price_estimation" ADD CONSTRAINT "design_price_estimation_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table design_set
-- ----------------------------
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "workplace"."sets" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table designs
-- ----------------------------
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "designs_wedding_ring_id_fkey" FOREIGN KEY ("wedding_ring_id") REFERENCES "workplace"."wedding_rings" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "fk_collection_designs_0ry69f9nc6" FOREIGN KEY ("collections_id") REFERENCES "workplace"."collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table diamonds
-- ----------------------------
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "diamonds_g1_collection_id_fkey" FOREIGN KEY ("g1_collection_id") REFERENCES "workplace"."haravan_collections" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ecom_360
-- ----------------------------
ALTER TABLE "workplace"."ecom_360" ADD CONSTRAINT "ecom_360_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "workplace"."products" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table ecom_old_products
-- ----------------------------
ALTER TABLE "workplace"."ecom_old_products" ADD CONSTRAINT "ecom_old_products_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table jewelries
-- ----------------------------
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "fk_designs" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "fk_ring_pairs" FOREIGN KEY ("ring_pair_id") REFERENCES "workplace"."jewelries" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table moissanite_serials
-- ----------------------------
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "moissanite_serials_moissanite_id_fkey" FOREIGN KEY ("moissanite_id") REFERENCES "workplace"."moissanite" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table products
-- ----------------------------
ALTER TABLE "workplace"."products" ADD CONSTRAINT "fk_haravan_co_products_enlvmi264j" FOREIGN KEY ("haravan_collections_id") REFERENCES "workplace"."haravan_collections" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workplace"."products" ADD CONSTRAINT "fk_product_design" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table size_details
-- ----------------------------
ALTER TABLE "workplace"."size_details" ADD CONSTRAINT "fk_jewelries" FOREIGN KEY ("jewelry_id") REFERENCES "workplace"."jewelries" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table temporary_products
-- ----------------------------
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "fk_variant_serial" FOREIGN KEY ("variant_serial_id") REFERENCES "workplace"."variant_serials" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table variant_serials
-- ----------------------------
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "fk_variants_variant_serials" FOREIGN KEY ("variant_id") REFERENCES "workplace"."variants" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table variants
-- ----------------------------
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "fk_variants_products" FOREIGN KEY ("product_id") REFERENCES "workplace"."products" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

/*
 Navicat PostgreSQL Dump SQL

 Source Server         : JEMMIA
 Source Server Type    : PostgreSQL
 Source Server Version : 160009 (160009)
 Source Host           : ep-royal-pond-a13arls2-pooler.ap-southeast-1.aws.neon.tech:5432
 Source Catalog        : jemmia
 Source Schema         : supplychain

 Target Server Type    : PostgreSQL
 Target Server Version : 160009 (160009)
 File Encoding         : 65001

 Date: 29/10/2025 14:24:01
*/

CREATE SCHEMA IF NOT EXISTS "supplychain";

-- ----------------------------
-- Sequence structure for design_melee_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "supplychain"."design_melee_id_seq";
CREATE SEQUENCE "supplychain"."design_melee_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;
ALTER SEQUENCE "supplychain"."design_melee_id_seq" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for buyback_exchange_approval_instances_detail
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."buyback_exchange_approval_instances_detail";
CREATE TABLE "supplychain"."buyback_exchange_approval_instances_detail" (
  "request_no" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "approval_process" text COLLATE "pg_catalog"."default",
  "completed_at" timestamp(6),
  "initiator_department" text COLLATE "pg_catalog"."default",
  "current_assignee" text COLLATE "pg_catalog"."default",
  "approval_steps" text COLLATE "pg_catalog"."default",
  "request_type" text COLLATE "pg_catalog"."default",
  "customer_code" text COLLATE "pg_catalog"."default",
  "receiving_processing_location" text COLLATE "pg_catalog"."default",
  "customer_handover_datetime" timestamp(6),
  "source_id" text COLLATE "pg_catalog"."default",
  "total_transfer_amount" numeric(18,2),
  "transfer_information" text COLLATE "pg_catalog"."default",
  "non_invoice_purchase_list" text COLLATE "pg_catalog"."default",
  "goods_inspection_certificate" text COLLATE "pg_catalog"."default",
  "other_attachments" text COLLATE "pg_catalog"."default",
  "other_information" text COLLATE "pg_catalog"."default",
  "updated_at" timestamp(6),
  "requester_email" text COLLATE "pg_catalog"."default",
  "requester_en_name" text COLLATE "pg_catalog"."default",
  "requester_id" text COLLATE "pg_catalog"."default",
  "requester_name" text COLLATE "pg_catalog"."default",
  "record_id" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."buyback_exchange_approval_instances_detail" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for capture_variants
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."capture_variants";
CREATE TABLE "supplychain"."capture_variants" (
  "nocodb_variant_id" int4 NOT NULL,
  "nocodb_product_id" int4,
  "barcode" text COLLATE "pg_catalog"."default",
  "published_scope" text COLLATE "pg_catalog"."default",
  "price" numeric,
  "capture_date" timestamp(6) DEFAULT now()
)
;
ALTER TABLE "supplychain"."capture_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for design_melee
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."design_melee";
CREATE TABLE "supplychain"."design_melee" (
  "id" int4 NOT NULL DEFAULT nextval('"supplychain".design_melee_id_seq'::regclass),
  "design_id" int4 NOT NULL,
  "shape" text COLLATE "pg_catalog"."default",
  "length" numeric,
  "width" numeric,
  "melee_number" int4,
  "database_created_at" timestamp(6) DEFAULT now(),
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."design_melee" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for designs
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."designs";
CREATE TABLE "supplychain"."designs" (
  "id" int4 NOT NULL,
  "code" text COLLATE "pg_catalog"."default",
  "erp_code" text COLLATE "pg_catalog"."default",
  "backup_code" text COLLATE "pg_catalog"."default",
  "design_type" text COLLATE "pg_catalog"."default",
  "gender" text COLLATE "pg_catalog"."default",
  "design_year" text COLLATE "pg_catalog"."default",
  "design_seq" int8,
  "usage_status" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "folder_summary" text COLLATE "pg_catalog"."default",
  "link_3d" text COLLATE "pg_catalog"."default",
  "link_render" text COLLATE "pg_catalog"."default",
  "link_retouch" text COLLATE "pg_catalog"."default",
  "ring_band_type" text COLLATE "pg_catalog"."default",
  "ring_band_style" text COLLATE "pg_catalog"."default",
  "ring_head_style" text COLLATE "pg_catalog"."default",
  "jewelry_rd_style" text COLLATE "pg_catalog"."default",
  "shape_of_main_stone" text COLLATE "pg_catalog"."default",
  "product_line" text COLLATE "pg_catalog"."default",
  "social_post" bool,
  "website" bool,
  "RENDER" bool,
  "RETOUCH" bool,
  "gold_weight" numeric,
  "main_stone" text COLLATE "pg_catalog"."default",
  "stone_quantity" text COLLATE "pg_catalog"."default",
  "stone_weight" text COLLATE "pg_catalog"."default",
  "diamond_holder" text COLLATE "pg_catalog"."default",
  "source" text COLLATE "pg_catalog"."default",
  "variant_number" int8,
  "collections_id" int4,
  "image_4view" text COLLATE "pg_catalog"."default",
  "image_render" text COLLATE "pg_catalog"."default",
  "image_retouch" text COLLATE "pg_catalog"."default",
  "created_by" varchar COLLATE "pg_catalog"."default",
  "updated_by" varchar COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6),
  "collection_name" text COLLATE "pg_catalog"."default",
  "auto_create_folder" bool,
  "design_code" text COLLATE "pg_catalog"."default",
  "ecom_showed" bool,
  "tag" text COLLATE "pg_catalog"."default",
  "stock_locations" text COLLATE "pg_catalog"."default",
  "wedding_ring_id" int4,
  "reference_code" text COLLATE "pg_catalog"."default",
  "design_status" text COLLATE "pg_catalog"."default",
  "erp_code_duplicated" bool,
  "max_seq" int4,
  "last_synced_render" text COLLATE "pg_catalog"."default",
  "last_synced_4view" text COLLATE "pg_catalog"."default",
  "melee_type" text COLLATE "pg_catalog"."default",
  "database_updated_link_4view_at" timestamp(6),
  "get_melee_status" text COLLATE "pg_catalog"."default" DEFAULT 'Pending'::text,
  "four_view_status" bool,
  "melee_type_update_at" timestamp(6),
  "is_create_auto_variant" bool DEFAULT false
)
;
ALTER TABLE "supplychain"."designs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_attribute
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_attribute";
CREATE TABLE "supplychain"."diamond_attribute" (
  "report_no" text COLLATE "pg_catalog"."default" NOT NULL,
  "report_type" text COLLATE "pg_catalog"."default",
  "report_date" text COLLATE "pg_catalog"."default",
  "shape" text COLLATE "pg_catalog"."default",
  "measurements" text COLLATE "pg_catalog"."default",
  "weight" text COLLATE "pg_catalog"."default",
  "color_grade" text COLLATE "pg_catalog"."default",
  "clarity_grade" text COLLATE "pg_catalog"."default",
  "cut_grade" text COLLATE "pg_catalog"."default",
  "depth" text COLLATE "pg_catalog"."default",
  "table" text COLLATE "pg_catalog"."default",
  "crown_angle" text COLLATE "pg_catalog"."default",
  "crown_height" text COLLATE "pg_catalog"."default",
  "pavilion_angle" text COLLATE "pg_catalog"."default",
  "pavilion_depth" text COLLATE "pg_catalog"."default",
  "star_length" text COLLATE "pg_catalog"."default",
  "lower_half" text COLLATE "pg_catalog"."default",
  "girdle" text COLLATE "pg_catalog"."default",
  "culet" text COLLATE "pg_catalog"."default",
  "polish" text COLLATE "pg_catalog"."default",
  "symmetry" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "clarity_characteristics" text COLLATE "pg_catalog"."default",
  "inscription" text COLLATE "pg_catalog"."default",
  "encrypted_report_no" text COLLATE "pg_catalog"."default",
  "simple_encrypted_report_no" text COLLATE "pg_catalog"."default",
  "is_pdf_available" bool,
  "pdf_url" text COLLATE "pg_catalog"."default",
  "propimg" text COLLATE "pg_catalog"."default",
  "digital_card" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."diamond_attribute" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_purchase
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_purchase";
CREATE TABLE "supplychain"."diamond_purchase" (
  "report_no" text COLLATE "pg_catalog"."default" NOT NULL,
  "rapnet_price_usd" numeric,
  "rapnet_price_usd_source" text COLLATE "pg_catalog"."default",
  "original_diamond_vnd_cost" numeric,
  "tax_cost_vnd" numeric,
  "delivery_cost_vnd" numeric
)
;
ALTER TABLE "supplychain"."diamond_purchase" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_quotation
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_quotation";
CREATE TABLE "supplychain"."diamond_quotation" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "ticket_sent_time" timestamp(6),
  "sender_system" text COLLATE "pg_catalog"."default",
  "stage" text COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "attachment" jsonb,
  "gia_code" text COLLATE "pg_catalog"."default",
  "gia_issue_date" date,
  "cut" text COLLATE "pg_catalog"."default",
  "stone_size" text COLLATE "pg_catalog"."default",
  "weight" numeric,
  "color" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "cut_quality" text COLLATE "pg_catalog"."default",
  "polish_level" text COLLATE "pg_catalog"."default",
  "symmetry" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "clarity_characteristics" text COLLATE "pg_catalog"."default",
  "engraving_code" text COLLATE "pg_catalog"."default",
  "rapnet_price_per_carat" numeric,
  "rapnet_price" numeric,
  "rapnet_discount_price" numeric,
  "purchase_exchange_policy" text COLLATE "pg_catalog"."default",
  "bonus" numeric,
  "final_price_for_sale" numeric,
  "quote_status" text COLLATE "pg_catalog"."default",
  "diamond_specs" text COLLATE "pg_catalog"."default",
  "quote_time" timestamp(6),
  "priority_level" text COLLATE "pg_catalog"."default",
  "customer_phone_hidden" text COLLATE "pg_catalog"."default",
  "customer_name_hidden" text COLLATE "pg_catalog"."default",
  "customer_code" text COLLATE "pg_catalog"."default",
  "customer_phone" text COLLATE "pg_catalog"."default",
  "exchange_rate" numeric,
  "expected_bln" numeric,
  "base_discount" numeric,
  "followers" text COLLATE "pg_catalog"."default",
  "text_status" text COLLATE "pg_catalog"."default",
  "handler" text COLLATE "pg_catalog"."default",
  "ticket_status" text COLLATE "pg_catalog"."default",
  "sender" text COLLATE "pg_catalog"."default",
  "ticket_type" text COLLATE "pg_catalog"."default",
  "customer_description" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default",
  "customer_name" text COLLATE "pg_catalog"."default",
  "sender_direct_manager" text COLLATE "pg_catalog"."default",
  "expected_arrival_date" date,
  "order_code" text COLLATE "pg_catalog"."default",
  "customer_name_update" text COLLATE "pg_catalog"."default",
  "customer_phone_update" text COLLATE "pg_catalog"."default",
  "desired_delivery_date" date,
  "customer_appointment_date" date,
  "accountant" text COLLATE "pg_catalog"."default",
  "supplier_confirm_date" date,
  "sale_note" text COLLATE "pg_catalog"."default",
  "expected_delivery_date" date,
  "main_sale" text COLLATE "pg_catalog"."default",
  "order_status" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."diamond_quotation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for diamond_ticket_quotation
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."diamond_ticket_quotation";
CREATE TABLE "supplychain"."diamond_ticket_quotation" (
  "id" text COLLATE "pg_catalog"."default" NOT NULL,
  "customer_name_hidden" text COLLATE "pg_catalog"."default",
  "accountant" text COLLATE "pg_catalog"."default",
  "customer_code" text COLLATE "pg_catalog"."default",
  "description" text COLLATE "pg_catalog"."default",
  "priority_level" text COLLATE "pg_catalog"."default",
  "quotation_date" timestamp(6),
  "ticket_sent_at" timestamp(6),
  "sender" text COLLATE "pg_catalog"."default",
  "sender_manager" text COLLATE "pg_catalog"."default",
  "sender_system" text COLLATE "pg_catalog"."default",
  "followers" text COLLATE "pg_catalog"."default",
  "handler" text COLLATE "pg_catalog"."default",
  "ticket_status" text COLLATE "pg_catalog"."default",
  "exchange_rate" numeric,
  "attachment" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "rapnet_price" numeric,
  "rapnet_discount" numeric,
  "rapnet_price_per_carat" numeric,
  "text_status" text COLLATE "pg_catalog"."default",
  "weight" numeric,
  "expected_profit_margin" numeric,
  "base_discount" numeric,
  "purchase_exchange_policy" text COLLATE "pg_catalog"."default",
  "cut_quality" text COLLATE "pg_catalog"."default",
  "final_price_for_sale" numeric,
  "cut" text COLLATE "pg_catalog"."default",
  "fluorescence" text COLLATE "pg_catalog"."default",
  "stone_size" text COLLATE "pg_catalog"."default",
  "gia_code" text COLLATE "pg_catalog"."default",
  "engraving_code" text COLLATE "pg_catalog"."default",
  "polish_level" text COLLATE "pg_catalog"."default",
  "gia_cert_issued_at" date,
  "color" text COLLATE "pg_catalog"."default",
  "bonus" text COLLATE "pg_catalog"."default",
  "clarity_characteristics" text COLLATE "pg_catalog"."default",
  "clarity" text COLLATE "pg_catalog"."default",
  "symmetry" text COLLATE "pg_catalog"."default",
  "ticket_type" text COLLATE "pg_catalog"."default",
  "expected_arrival_date" timestamp(6),
  "customer_phone_hidden" text COLLATE "pg_catalog"."default",
  "order_code" text COLLATE "pg_catalog"."default",
  "supplier_confirm_date" timestamp(6),
  "customer_appointment_date" timestamp(6),
  "expected_delivery_date" timestamp(6),
  "customer_phone_update" text COLLATE "pg_catalog"."default",
  "customer_name_update" text COLLATE "pg_catalog"."default",
  "desired_delivery_date" timestamp(6),
  "sale_note" text COLLATE "pg_catalog"."default",
  "main_sale" text COLLATE "pg_catalog"."default",
  "note" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."diamond_ticket_quotation" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for gold_prices
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."gold_prices";
CREATE TABLE "supplychain"."gold_prices" (
  "timestamp" numeric NOT NULL,
  "metal" text COLLATE "pg_catalog"."default",
  "currency" text COLLATE "pg_catalog"."default",
  "exchange" text COLLATE "pg_catalog"."default",
  "symbol" text COLLATE "pg_catalog"."default",
  "prev_close_price" float8,
  "open_price" float8,
  "low_price" float8,
  "high_price" float8,
  "open_time" int4,
  "price" float8,
  "ch" float8,
  "chp" float8,
  "ask" float8,
  "bid" float8,
  "price_gram_24k" float8,
  "price_gram_22k" float8,
  "price_gram_21k" float8,
  "price_gram_20k" float8,
  "price_gram_18k" float8,
  "price_gram_16k" float8,
  "price_gram_14k" float8,
  "price_gram_10k" float8
)
;
ALTER TABLE "supplychain"."gold_prices" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for history_price_ticket
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."history_price_ticket";
CREATE TABLE "supplychain"."history_price_ticket" (
  "ticketname" float8,
  "status" text COLLATE "pg_catalog"."default",
  "date" timestamp(6),
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6),
  "larkrecordid" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."history_price_ticket" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_design_items
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_design_items";
CREATE TABLE "supplychain"."jewelry_design_items" (
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "design_code" text COLLATE "pg_catalog"."default",
  "sku" text COLLATE "pg_catalog"."default",
  "descriptive_attribute" text COLLATE "pg_catalog"."default",
  "material" text COLLATE "pg_catalog"."default",
  "material_applique" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default",
  "color" text COLLATE "pg_catalog"."default",
  "ring_size" numeric,
  "ring_size_type" text COLLATE "pg_catalog"."default",
  "edge_size_1" text COLLATE "pg_catalog"."default",
  "edge_size_2" text COLLATE "pg_catalog"."default",
  "storage_size_type" text COLLATE "pg_catalog"."default",
  "serial_quantity" int4,
  "link_3dm" text COLLATE "pg_catalog"."default",
  "link_4view" text COLLATE "pg_catalog"."default",
  "folder_link" text COLLATE "pg_catalog"."default",
  "status_checked_3dm_4view" bool,
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "record_id_hash" text COLLATE "pg_catalog"."default" GENERATED ALWAYS AS (
md5(record_id)
) STORED
)
;
ALTER TABLE "supplychain"."jewelry_design_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_price
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_price";
CREATE TABLE "supplychain"."jewelry_price" (
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "design_id" int8,
  "design_code" text COLLATE "pg_catalog"."default",
  "is_check_gold_melee" bool,
  "is_price_confirm" bool,
  "material" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric(12,3),
  "melee_number" int4,
  "diamond_cost" numeric(14,0),
  "gold_cost" numeric(14,0),
  "labour_cost" numeric(14,0),
  "bracklet_cost" numeric(14,0),
  "cogs_percent" numeric(5,4),
  "discount" numeric(5,4),
  "proposal_price" numeric(14,0),
  "final_price" numeric(14,0),
  "tag" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."jewelry_price" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_purchase_order_line_items
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_purchase_order_line_items";
CREATE TABLE "supplychain"."jewelry_purchase_order_line_items" (
  "order_product_id" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6),
  "updated_at" timestamp(6),
  "sku_id" text COLLATE "pg_catalog"."default",
  "expected_factory_delivery_date" timestamp(6),
  "expected_customer_delivery_date" timestamp(6),
  "order_quantity" int4,
  "cogs" float8,
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "status" text COLLATE "pg_catalog"."default",
  "stage" text COLLATE "pg_catalog"."default",
  "supplier_gold_cost_per_unit" int8,
  "total_melee_cost" float8,
  "melee_description" text COLLATE "pg_catalog"."default",
  "serial_number" text COLLATE "pg_catalog"."default",
  "supplier_melee_description" text COLLATE "pg_catalog"."default",
  "gold_weight" numeric,
  "labour_cost" float8,
  "melee_weight" numeric,
  "gold_cost" float8,
  "hash_sku_id" text COLLATE "pg_catalog"."default",
  "hash_order_product_id" text COLLATE "pg_catalog"."default",
  "received_date" timestamp(6),
  "product_error" bool,
  "db_update_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."jewelry_purchase_order_line_items" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for jewelry_purchase_orders
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."jewelry_purchase_orders";
CREATE TABLE "supplychain"."jewelry_purchase_orders" (
  "record_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "order_product_id" text COLLATE "pg_catalog"."default",
  "created_at" timestamptz(6),
  "updated_at" timestamptz(6),
  "ticket_name" text COLLATE "pg_catalog"."default",
  "linked_descriptive_id" text COLLATE "pg_catalog"."default",
  "order_type" text COLLATE "pg_catalog"."default",
  "order_date" timestamptz(6),
  "expected_factory_delivery_date" timestamptz(6),
  "expected_customer_delivery_date" timestamptz(6),
  "order_file_url" text COLLATE "pg_catalog"."default",
  "customer_name" text COLLATE "pg_catalog"."default",
  "order_quantity" int4,
  "supplier_name" text COLLATE "pg_catalog"."default",
  "cogs" numeric,
  "status" text COLLATE "pg_catalog"."default",
  "linked_descriptive_id_hash" text COLLATE "pg_catalog"."default" GENERATED ALWAYS AS (
md5(linked_descriptive_id)
) STORED,
  "record_id_hash" text COLLATE "pg_catalog"."default" GENERATED ALWAYS AS (
md5(record_id)
) STORED,
  "urgent_level" text COLLATE "pg_catalog"."default",
  "haravan_order_code" text COLLATE "pg_catalog"."default",
  "db_update_at" timestamp(6)
)
;
ALTER TABLE "supplychain"."jewelry_purchase_orders" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for mapping_cogs
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."mapping_cogs";
CREATE TABLE "supplychain"."mapping_cogs" (
  "haravan_product_id" int8,
  "haravan_variant_id" float8,
  "sku" text COLLATE "pg_catalog"."default",
  "avg_cogs" float8
)
;
ALTER TABLE "supplychain"."mapping_cogs" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for pnj_products
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."pnj_products";
CREATE TABLE "supplychain"."pnj_products" (
  "id" int8 NOT NULL,
  "product_link" text COLLATE "pg_catalog"."default" NOT NULL,
  "category_current" text COLLATE "pg_catalog"."default",
  "sku" text COLLATE "pg_catalog"."default",
  "category" text COLLATE "pg_catalog"."default",
  "brand" text COLLATE "pg_catalog"."default",
  "price" int8,
  "title" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."pnj_products" OWNER TO "neondb_owner";

-- ----------------------------
-- Table structure for ticket_price
-- ----------------------------
DROP TABLE IF EXISTS "supplychain"."ticket_price";
CREATE TABLE "supplychain"."ticket_price" (
  "recordid" text COLLATE "pg_catalog"."default" NOT NULL,
  "ticketname" float8,
  "sender" text COLLATE "pg_catalog"."default",
  "customername" text COLLATE "pg_catalog"."default",
  "phonenumber" text COLLATE "pg_catalog"."default",
  "producttype" text COLLATE "pg_catalog"."default",
  "material" text COLLATE "pg_catalog"."default",
  "color" text COLLATE "pg_catalog"."default",
  "ringsizetype" text COLLATE "pg_catalog"."default",
  "ringsize" text COLLATE "pg_catalog"."default",
  "productgroup" text COLLATE "pg_catalog"."default",
  "tickettype" text COLLATE "pg_catalog"."default",
  "status" text COLLATE "pg_catalog"."default",
  "followers" text COLLATE "pg_catalog"."default",
  "actor" text COLLATE "pg_catalog"."default",
  "image" text COLLATE "pg_catalog"."default",
  "storagesize" text COLLATE "pg_catalog"."default",
  "prioritylevel" text COLLATE "pg_catalog"."default",
  "deadline" timestamp(6),
  "priorityreason" text COLLATE "pg_catalog"."default",
  "policy" text COLLATE "pg_catalog"."default",
  "descriptive" text COLLATE "pg_catalog"."default",
  "database_created_at" timestamp(6),
  "database_updated_at" timestamp(6),
  "estimateprice" float8,
  "larkbasecreateat" timestamp(6),
  "typeofdesigncode" text COLLATE "pg_catalog"."default",
  "recordlink" text COLLATE "pg_catalog"."default"
)
;
ALTER TABLE "supplychain"."ticket_price" OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for classify_melee_type
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."classify_melee_type"();
CREATE FUNCTION "supplychain"."classify_melee_type"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
DECLARE
  total_qty INTEGER;
  non_melee_qty INTEGER;
  real_melee_qty INTEGER;
BEGIN
  IF NEW.get_melee_status = 'Success' THEN

    -- 1. Tổng số lượng tất cả melee (mọi hình, kích thước)
    SELECT COALESCE(SUM(melee_number), 0)
    INTO total_qty
    FROM supplychain.design_melee
    WHERE design_id = NEW.id;

    -- 2. Số lượng kim cương "lớn" (Round và length >= 3.6)
    SELECT COALESCE(SUM(melee_number), 0)
    INTO non_melee_qty
    FROM supplychain.design_melee
    WHERE design_id = NEW.id
      AND shape = 'Round'
      AND length >= 3.6;

    -- 3. Tính số viên tấm thực sự
    real_melee_qty := total_qty - non_melee_qty;

    -- 4. Phân loại melee_type
    UPDATE supplychain.designs
    SET melee_type = CASE
                      WHEN real_melee_qty = 0 THEN 'No melee'
                      ELSE 'Has melee'
                    END
    WHERE id = NEW.id;

  ELSE
    -- Nếu status không phải 'Success', reset melee_type về NULL
    UPDATE supplychain.designs
    SET melee_type = NULL
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."classify_melee_type"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for generate_md5_hash
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."generate_md5_hash"("input_value" text);
CREATE FUNCTION "supplychain"."generate_md5_hash"("input_value" text)
  RETURNS "pg_catalog"."text" AS $BODY$
BEGIN
    RETURN MD5(input_value);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."generate_md5_hash"("input_value" text) OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_created_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_created_at"();
CREATE FUNCTION "supplychain"."set_created_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  NEW.database_created_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_created_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_database_created_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_database_created_at"();
CREATE FUNCTION "supplychain"."set_database_created_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    NEW.database_created_at := NOW();
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_database_created_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_database_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_database_updated_at"();
CREATE FUNCTION "supplychain"."set_database_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    NEW.database_updated_at := NOW();
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_database_updated_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for set_updated_at
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."set_updated_at"();
CREATE FUNCTION "supplychain"."set_updated_at"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Cập nhật theo múi giờ UTC+7 (Asia/Ho_Chi_Minh)
    NEW.db_update_at := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' + INTERVAL '7 hours');
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."set_updated_at"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for sync_designs_from_workplace
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."sync_designs_from_workplace"();
CREATE FUNCTION "supplychain"."sync_designs_from_workplace"()
  RETURNS "pg_catalog"."text" AS $BODY$
DECLARE
    row_count INTEGER;
BEGIN
    WITH upsert AS (
        INSERT INTO supplychain.designs (
            id, code, erp_code, backup_code, design_type, gender, design_year, design_seq,
            usage_status, link_4view, folder_summary, link_3d, link_render, link_retouch,
            ring_band_type, ring_band_style, ring_head_style, jewelry_rd_style,
            shape_of_main_stone, product_line, social_post, website, "RENDER", "RETOUCH",
            gold_weight, main_stone, stone_quantity, stone_weight, diamond_holder, source,
            variant_number, collections_id, image_4view, image_render, image_retouch,
            created_by, updated_by, database_created_at, database_updated_at,
            collection_name, auto_create_folder, design_code, ecom_showed, tag,
            stock_locations, wedding_ring_id, reference_code, design_status,
            erp_code_duplicated, max_seq, last_synced_render, last_synced_4view
        )
        SELECT
            id, code, erp_code, backup_code, design_type, gender, design_year, design_seq,
            usage_status, link_4view, folder_summary, link_3d, link_render, link_retouch,
            ring_band_type, ring_band_style, ring_head_style, jewelry_rd_style,
            shape_of_main_stone, product_line, social_post, website, "RENDER", "RETOUCH",
            gold_weight, main_stone, stone_quantity, stone_weight, diamond_holder, source,
            variant_number, collections_id, image_4view, image_render, image_retouch,
            created_by, updated_by, database_created_at, database_updated_at,
            collection_name, auto_create_folder, design_code, ecom_showed, tag,
            stock_locations, wedding_ring_id, reference_code, design_status,
            erp_code_duplicated, max_seq, last_synced_render, last_synced_4view
        FROM workplace.designs
        WHERE database_updated_at >= now() - interval '5 hours'
        ON CONFLICT (id) DO UPDATE SET
            code = EXCLUDED.code,
            erp_code = EXCLUDED.erp_code,
            backup_code = EXCLUDED.backup_code,
            design_type = EXCLUDED.design_type,
            gender = EXCLUDED.gender,
            design_year = EXCLUDED.design_year,
            design_seq = EXCLUDED.design_seq,
            usage_status = EXCLUDED.usage_status,
            link_4view = EXCLUDED.link_4view,
            folder_summary = EXCLUDED.folder_summary,
            link_3d = EXCLUDED.link_3d,
            link_render = EXCLUDED.link_render,
            link_retouch = EXCLUDED.link_retouch,
            ring_band_type = EXCLUDED.ring_band_type,
            ring_band_style = EXCLUDED.ring_band_style,
            ring_head_style = EXCLUDED.ring_head_style,
            jewelry_rd_style = EXCLUDED.jewelry_rd_style,
            shape_of_main_stone = EXCLUDED.shape_of_main_stone,
            product_line = EXCLUDED.product_line,
            social_post = EXCLUDED.social_post,
            website = EXCLUDED.website,
            "RENDER" = EXCLUDED."RENDER",
            "RETOUCH" = EXCLUDED."RETOUCH",
            gold_weight = EXCLUDED.gold_weight,
            main_stone = EXCLUDED.main_stone,
            stone_quantity = EXCLUDED.stone_quantity,
            stone_weight = EXCLUDED.stone_weight,
            diamond_holder = EXCLUDED.diamond_holder,
            source = EXCLUDED.source,
            variant_number = EXCLUDED.variant_number,
            collections_id = EXCLUDED.collections_id,
            image_4view = EXCLUDED.image_4view,
            image_render = EXCLUDED.image_render,
            image_retouch = EXCLUDED.image_retouch,
            created_by = EXCLUDED.created_by,
            updated_by = EXCLUDED.updated_by,
            database_created_at = EXCLUDED.database_created_at,
            database_updated_at = EXCLUDED.database_updated_at,
            collection_name = EXCLUDED.collection_name,
            auto_create_folder = EXCLUDED.auto_create_folder,
            design_code = EXCLUDED.design_code,
            ecom_showed = EXCLUDED.ecom_showed,
            tag = EXCLUDED.tag,
            stock_locations = EXCLUDED.stock_locations,
            wedding_ring_id = EXCLUDED.wedding_ring_id,
            reference_code = EXCLUDED.reference_code,
            design_status = EXCLUDED.design_status,
            erp_code_duplicated = EXCLUDED.erp_code_duplicated,
            max_seq = EXCLUDED.max_seq,
            last_synced_render = EXCLUDED.last_synced_render,
            last_synced_4view = EXCLUDED.last_synced_4view
        RETURNING id
    )
    SELECT COUNT(*) INTO row_count FROM upsert;

    -- Trả về chuỗi thông báo
    RETURN format('✅ Đã update được %s dòng dữ liệu.', row_count);
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."sync_designs_from_workplace"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for trg_update_melee_type_timestamp
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."trg_update_melee_type_timestamp"();
CREATE FUNCTION "supplychain"."trg_update_melee_type_timestamp"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
    -- Kiểm tra nếu melee_type bị thay đổi
    IF NEW.melee_type IS DISTINCT FROM OLD.melee_type THEN
        NEW.melee_type_update_at := NOW();
    END IF;
    RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."trg_update_melee_type_timestamp"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_hash_order_product_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_hash_order_product_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_hash_order_product_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Kiểm tra nếu cột order_product_id thay đổi
  IF NEW.order_product_id IS DISTINCT FROM OLD.order_product_id THEN
    NEW.hash_order_product_id := generate_md5_hash(NEW.order_product_id);  -- Tính hash cho order_product_id
  END IF;

  -- Trả về dòng đã được thay đổi
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_hash_order_product_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_hash_record_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_hash_record_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_hash_record_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Kiểm tra nếu cột sku_id thay đổi
  IF NEW.record_id IS DISTINCT FROM OLD.record_id THEN
    NEW.hash_record_id := generate_md5_hash(NEW.record_id);  -- Tính hash cho sku_id
  END IF;

  -- Trả về dòng đã được thay đổi
  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_hash_record_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_line_items_hash_order_product_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Trường hợp INSERT: OLD là NULL, nên ta chỉ cần check NEW
  IF TG_OP = 'INSERT' THEN
    IF NEW.order_product_id IS NOT NULL THEN
      NEW.hash_order_product_id := supplychain.generate_md5_hash(NEW.order_product_id);
    END IF;

  -- Trường hợp UPDATE: so sánh NEW vs OLD
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.order_product_id IS DISTINCT FROM OLD.order_product_id THEN
      NEW.hash_order_product_id := supplychain.generate_md5_hash(NEW.order_product_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_jewelry_purchase_order_line_items_hash_sku_id
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"();
CREATE FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Trường hợp INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.sku_id IS NOT NULL THEN
      NEW.hash_sku_id := supplychain.generate_md5_hash(NEW.sku_id);
    END IF;

  -- Trường hợp UPDATE
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.sku_id IS DISTINCT FROM OLD.sku_id THEN
      NEW.hash_sku_id := supplychain.generate_md5_hash(NEW.sku_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"() OWNER TO "neondb_owner";

-- ----------------------------
-- Function structure for update_link_4view_timestamp
-- ----------------------------
DROP FUNCTION IF EXISTS "supplychain"."update_link_4view_timestamp"();
CREATE FUNCTION "supplychain"."update_link_4view_timestamp"()
  RETURNS "pg_catalog"."trigger" AS $BODY$
BEGIN
  -- Chỉ cập nhật khi giá trị link_4view thay đổi từ NULL sang KHÔNG NULL
  IF NEW.link_4view IS NOT NULL AND OLD.link_4view IS NULL THEN
    NEW.database_updated_link_4view_at := now();
  END IF;

  RETURN NEW;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100;
ALTER FUNCTION "supplychain"."update_link_4view_timestamp"() OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for warehouse_scan_status
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."warehouse_scan_status";
CREATE VIEW "supplychain"."warehouse_scan_status" AS  WITH scan_flags AS (
         SELECT i.warehouse_id,
            bool_or(i.created_at::date = CURRENT_DATE) AS has_today,
            bool_or(i.created_at::date = (CURRENT_DATE - '1 day'::interval)) AS has_yesterday
           FROM inventory.inventory_check_sheets i
          WHERE i.created_at::date = ANY (ARRAY[CURRENT_DATE::timestamp without time zone, CURRENT_DATE - '1 day'::interval])
          GROUP BY i.warehouse_id
        ), inventory_sum AS (
         SELECT wi.loc_id AS warehouse_id,
            sum(wi.qty_onhand) AS current_inventory_number
           FROM haravan.warehouse_inventories wi
          GROUP BY wi.loc_id
        ), person_in_charge_map AS (
         SELECT t.warehouse_id,
            t.person_in_charge
           FROM ( VALUES (3421435,'@Nguyễn Thu Trà, @Nguyễn Hữu Phúc'::text), (1110168,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1582708,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1587596,'Quản lý chung'::text), (1590860,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1592770,'@Ngô Thuỵ Kiều Trinh, @Nguyễn Phương Thảo'::text), (1592774,'@Ngô Thuỵ Kiều Trinh, @Nguyễn Phương Thảo'::text), (1592776,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1592778,'@Trần Thị Hoài Thu'::text), (1592780,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1593276,'@Nguyễn Minh Đang'::text), (1594118,'@Trần Thị Hoài Thu'::text), (1599764,'@Nguyễn Thị Kiều Oanh, @Nguyễn Thị Thuỳ Linh'::text), (1601006,'@Trần Thị Hoài Thu'::text), (1601632,'Anh @Hoàng Xuân Thọ'::text), (1619562,'@Phan Thị Huế'::text), (1710693,'@Châu Cẩm Tiên'::text), (1710694,'@Nguyễn Minh Đang'::text), (1710695,'@Nguyễn Minh Đang'::text), (1710696,'@Nguyễn Minh Đang'::text), (1715010,'Chưa rõ'::text), (3355305,'@Phạm Tiểu Khả, @Trịnh Thị Minh Thư'::text), (1599762,'Chưa rõ'::text)) t(warehouse_id, person_in_charge)
        )
 SELECT w.name AS warehouse_name,
    COALESCE(pic.person_in_charge, 'Chưa rõ'::text) AS person_in_charge,
        CASE
            WHEN COALESCE(sf.has_today, false) THEN 'X'::text
            ELSE ''::text
        END AS scan_today,
        CASE
            WHEN COALESCE(sf.has_yesterday, false) THEN 'X'::text
            ELSE ''::text
        END AS scan_yesterday,
    COALESCE(to_char(inv.current_inventory_number, 'FM999,999,999'::text), '0'::text) AS current_inventory_number
   FROM haravan.warehouses w
     LEFT JOIN scan_flags sf ON sf.warehouse_id = w.id::numeric
     LEFT JOIN inventory_sum inv ON inv.warehouse_id = w.id
     LEFT JOIN person_in_charge_map pic ON pic.warehouse_id = w.id
  ORDER BY w.name;
ALTER TABLE "supplychain"."warehouse_scan_status" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for negative_inventory_variants
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."negative_inventory_variants";
CREATE VIEW "supplychain"."negative_inventory_variants" AS  SELECT w.name AS warehouse_name,
    v.product_type,
    v.title,
    wi.qty_onhand,
    concat('https://jemmiavn.myharavan.com/admin/products/', v.product_id, '/variants/', v.id) AS product_variant_link
   FROM haravan.variants v
     LEFT JOIN haravan.warehouse_inventories wi ON wi.variant_id = v.id
     LEFT JOIN haravan.warehouses w ON w.id = wi.loc_id
  WHERE wi.qty_onhand < 0 AND w.name <> '[ALL] KHO XUẤT'::text
  GROUP BY w.name, v.product_type, v.product_id, v.id, v.title, wi.qty_onhand
  ORDER BY w.name;
ALTER TABLE "supplychain"."negative_inventory_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for jewelry_variants
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."jewelry_variants";
CREATE VIEW "supplychain"."jewelry_variants" AS  SELECT p.id AS nocodb_product_id,
    p.haravan_product_id,
    v.id AS nocodb_variant_id,
    v.haravan_variant_id,
    p.design_id,
    d.design_code,
    wp.haravan_product_type,
    v.fineness,
    v.barcode,
    v.category,
    v.applique_material,
    v.size_type,
    v.ring_size,
    p.published_scope,
    (d.design_code || '_'::text) || v.fineness AS design_code_material,
    v.price AS price_original,
        CASE
            WHEN wp.haravan_product_type ~~* '%Bông Tai%'::text THEN v.price * 2::numeric
            ELSE v.price
        END AS price_adjusted,
    hv.qty_onhand
   FROM workplace.products p
     LEFT JOIN workplace.variants v ON v.product_id = p.id
     LEFT JOIN workplace.designs d ON p.design_id = d.id
     LEFT JOIN workplace.products wp ON wp.id = v.product_id
     LEFT JOIN haravan.variants hv ON v.haravan_variant_id = hv.id
  WHERE p.haravan_product_id IS NOT NULL AND v.haravan_variant_id IS NOT NULL;
ALTER TABLE "supplychain"."jewelry_variants" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for today_rfid_scans
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."today_rfid_scans";
CREATE VIEW "supplychain"."today_rfid_scans" AS  SELECT vs.serial_number,
    vs.last_rfid_scan_time,
    vs.stock_at,
    v.barcode,
    vs.printing_batch,
    p.haravan_product_type,
        CASE
            WHEN v.applique_material = 'Không'::text THEN concat(p.haravan_product_type, ' ', 'Không Đính Á', ' ', v.fineness)
            ELSE concat(p.haravan_product_type, ' ', replace(v.applique_material, 'Trang Sức '::text, ''::text), ' ', v.fineness)
        END AS product_name,
    d.design_code,
    v.fineness,
    v.material_color,
    v.ring_size,
    vs.storage_size_type,
    vs.storage_size_1,
    vs.storage_size_2,
    v.sku,
    vs.gold_weight,
    vs.diamond_weight,
    vs.quantity,
        CASE
            WHEN vs.printing_batch ~~* '%Tem tạm%'::text THEN 0::numeric
            ELSE floor(v.price)
        END AS price,
    vs.encode_barcode,
    vs.final_encoded_barcode,
    ('['::text || vs.old_barcode) || ']'::text AS old_barcode,
    vs.order_on,
        CASE
            WHEN vs.storage_size_type = 'Một Khoảng Giá Trị'::text THEN concat(vs.storage_size_1::text, '-', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Một Giá Trị'::text THEN vs.storage_size_2::text
            WHEN vs.storage_size_type = 'Nhiều Viên Chủ'::text THEN 'Nhiều Viên Chủ'::text
            WHEN vs.storage_size_type = 'Dài x Rộng'::text THEN concat(vs.storage_size_1::text, 'x', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Không Có'::text THEN '0.0'::text
            ELSE NULL::text
        END AS storage_size_final
   FROM workplace.variant_serials vs
     LEFT JOIN workplace.variants v ON vs.variant_id = v.id
     LEFT JOIN workplace.products p ON p.id = v.product_id
     LEFT JOIN workplace.designs d ON d.id = p.design_id
  WHERE vs.last_rfid_scan_time::date >= (CURRENT_DATE - '1 day'::interval)
  ORDER BY vs.last_rfid_scan_time DESC;
ALTER TABLE "supplychain"."today_rfid_scans" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for neckplace_inventory
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."neckplace_inventory";
CREATE VIEW "supplychain"."neckplace_inventory" AS  WITH available_inventory AS (
         SELECT v.id AS variant_id,
            TRIM(BOTH FROM split_part(p.title::text, '-'::text, 2)) AS extracted_title,
            sum(v.qty_available) AS qty_available,
            v.price
           FROM haravan.variants v
             LEFT JOIN haravan.products p ON p.id = v.product_id
          WHERE v.product_type::text = 'Dây Chuyền Trơn'::text
          GROUP BY v.id, v.price, p.title
        ), location_inventory AS (
         SELECT w.name,
            wi.variant_id,
            wi.qty_available
           FROM haravan.warehouse_inventories wi
             LEFT JOIN haravan.warehouses w ON w.id = wi.loc_id
          WHERE wi.qty_available > 0
        )
 SELECT ai.extracted_title AS design_code,
    to_char(ai.price, 'FM999,999,999'::text) AS price,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[CT] Cửa Hàng Cần Thơ'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[CT] Cửa Hàng Cần Thơ'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS can_tho_inventory,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[HCM] Cửa Hàng HCM'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[HCM] Cửa Hàng HCM'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS ho_chi_minh_inventory,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[HN] Cửa Hàng HN'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[HN] Cửa Hàng HN'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS ha_noi_inventory,
        CASE
            WHEN sum(
            CASE
                WHEN li.name = '[HCM] Kế Toán'::text THEN li.qty_available
                ELSE 0::bigint
            END) = 0::numeric THEN '_'::text
            ELSE sum(
            CASE
                WHEN li.name = '[HCM] Kế Toán'::text THEN li.qty_available
                ELSE 0::bigint
            END)::text
        END AS accounting_inventory,
        CASE
            WHEN sum(li.qty_available) = 0::numeric THEN '_'::text
            ELSE sum(li.qty_available)::text
        END AS total_available
   FROM available_inventory ai
     LEFT JOIN location_inventory li ON ai.variant_id = li.variant_id
  WHERE ai.qty_available > 0 AND (li.name = ANY (ARRAY['[CT] Cửa Hàng Cần Thơ'::text, '[HCM] Cửa Hàng HCM'::text, '[HN] Cửa Hàng HN'::text, '[HCM] Kế Toán'::text]))
  GROUP BY ai.extracted_title, ai.price
UNION ALL
 SELECT 'Tổng cộng'::text AS design_code,
    ''::text AS price,
    to_char(sum(
        CASE
            WHEN li.name = '[CT] Cửa Hàng Cần Thơ'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS can_tho_inventory,
    to_char(sum(
        CASE
            WHEN li.name = '[HCM] Cửa Hàng HCM'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS ho_chi_minh_inventory,
    to_char(sum(
        CASE
            WHEN li.name = '[HN] Cửa Hàng HN'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS ha_noi_inventory,
    to_char(sum(
        CASE
            WHEN li.name = '[HCM] Kế Toán'::text THEN li.qty_available
            ELSE 0::bigint
        END), 'FM999,999,999'::text) AS accounting_inventory,
    to_char(sum(li.qty_available), 'FM999,999,999'::text) AS total_available
   FROM available_inventory ai
     LEFT JOIN location_inventory li ON ai.variant_id = li.variant_id
  WHERE ai.qty_available > 0 AND (li.name = ANY (ARRAY['[CT] Cửa Hàng Cần Thơ'::text, '[HCM] Cửa Hàng HCM'::text, '[HN] Cửa Hàng HN'::text, '[HCM] Kế Toán'::text]));
ALTER TABLE "supplychain"."neckplace_inventory" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for jewelry_variant_serials
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."jewelry_variant_serials";
CREATE VIEW "supplychain"."jewelry_variant_serials" AS  SELECT vs.serial_number,
    vs.last_rfid_scan_time,
    vs.stock_at,
    v.barcode,
    vs.printing_batch,
    p.haravan_product_type,
        CASE
            WHEN v.applique_material = 'Không'::text THEN concat(p.haravan_product_type, ' ', 'Không Đính Á', ' ', v.fineness)
            ELSE concat(p.haravan_product_type, ' ', replace(v.applique_material, 'Trang Sức '::text, ''::text), ' ', v.fineness)
        END AS product_name,
    d.design_code,
    v.fineness,
    v.material_color,
    v.ring_size,
    vs.storage_size_type,
    vs.storage_size_1,
    vs.storage_size_2,
    v.sku,
    vs.gold_weight,
    vs.diamond_weight,
    vs.quantity,
        CASE
            WHEN vs.printing_batch ~~* '%Tem tạm%'::text THEN 0::numeric
            ELSE floor(v.price)
        END AS price,
    vs.encode_barcode,
    vs.final_encoded_barcode,
    ('['::text || vs.old_barcode) || ']'::text AS old_barcode,
    vs.order_on,
        CASE
            WHEN vs.storage_size_type = 'Một Khoảng Giá Trị'::text THEN concat(vs.storage_size_1::text, '-', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Một Giá Trị'::text THEN vs.storage_size_2::text
            WHEN vs.storage_size_type = 'Nhiều Viên Chủ'::text THEN 'Nhiều Viên Chủ'::text
            WHEN vs.storage_size_type = 'Dài x Rộng'::text THEN concat(vs.storage_size_1::text, 'x', vs.storage_size_2::text)
            WHEN vs.storage_size_type = 'Không Có'::text THEN '0.0'::text
            ELSE NULL::text
        END AS storage_size_final
   FROM workplace.variant_serials vs
     LEFT JOIN workplace.variants v ON vs.variant_id = v.id
     LEFT JOIN workplace.products p ON p.id = v.product_id
     LEFT JOIN workplace.designs d ON d.id = p.design_id
  ORDER BY vs.last_rfid_scan_time DESC;
ALTER TABLE "supplychain"."jewelry_variant_serials" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for jewelry_variant_inventories
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."jewelry_variant_inventories";
CREATE VIEW "supplychain"."jewelry_variant_inventories" AS  SELECT p.id AS nocodb_product_id,
    p.haravan_product_id,
    v.id AS nocodb_variant_id,
    v.haravan_variant_id,
    p.design_id,
    d.design_code,
    wp.haravan_product_type,
    v.fineness,
    v.barcode,
    v.category,
    v.applique_material,
    v.size_type,
    COALESCE(v.ring_size, 0::bigint::numeric) AS ring_size,
    p.published_scope,
    (d.design_code || '_'::text) || v.fineness AS design_code_material,
    v.price AS price_original,
        CASE
            WHEN wp.haravan_product_type ~~* '%Bông Tai%'::text THEN v.price * 2::numeric
            ELSE v.price
        END AS price_adjusted,
    w.name,
    COALESCE(wi.qty_onhand, 0::bigint) AS qty_onhand,
    COALESCE(wi.qty_incoming, 0::bigint) AS qty_incoming,
    COALESCE(wi.qty_committed, 0::bigint) AS qty_committed,
    COALESCE(wi.qty_available, 0::bigint) AS qty_available
   FROM workplace.products p
     LEFT JOIN workplace.variants v ON v.product_id = p.id
     LEFT JOIN workplace.designs d ON p.design_id = d.id
     LEFT JOIN workplace.products wp ON wp.id = v.product_id
     LEFT JOIN haravan.warehouse_inventories wi ON v.haravan_variant_id = wi.variant_id
     LEFT JOIN haravan.warehouses w ON wi.loc_id = w.id
  WHERE p.haravan_product_id IS NOT NULL AND v.haravan_variant_id IS NOT NULL;
ALTER TABLE "supplychain"."jewelry_variant_inventories" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for dim_products
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."dim_products";
CREATE VIEW "supplychain"."dim_products" AS  WITH diamonds AS (
         SELECT d.product_id AS haravan_product_id,
            d.variant_id AS haravan_variant_id,
            d.barcode,
            d.report_no AS diamondreportno,
            d.price,
            d.cogs AS diamondcogs,
            d.product_group AS productgroup,
            d.shape AS diamondshape,
            d.cut AS diamondcut,
            COALESCE(NULLIF(d.color, ''::text), 'Khác'::text) AS diamondcolor,
            d.clarity AS diamondclarity,
            d.fluorescence AS diamondfluorescence,
            d.edge_size_1 AS diamondlength,
            d.edge_size_2 AS diamondwidth,
            d.carat AS diamondcarat
           FROM workplace.diamonds d
        ), jewelries AS (
         SELECT v.id AS jewelriesvariantid,
            p.design_id AS designid,
            p.haravan_product_id,
            v.haravan_variant_id,
            v.barcode,
            v.category AS productgroup,
            d.design_type AS jewelriesproducttype,
            d.gender AS jewelriesgender,
            v.applique_material AS jewelriesappliquematerial,
            v.fineness AS jewelriesfiness,
            v.material_color AS jewelriesmaterialcolor,
            v.size_type AS jewelriessizetype,
            v.ring_size AS jewelriesringsize,
            v.price
           FROM workplace.variants v
             LEFT JOIN workplace.products p ON v.product_id = p.id
             LEFT JOIN workplace.designs d ON d.id = p.design_id
          WHERE v.haravan_variant_id IS NOT NULL
        UNION ALL
         SELECT NULL::integer AS jewelriesvariantid,
            j.design_id AS designid,
            j.product_id AS haravan_product_id,
            j.variant_id AS haravan_variant_id,
            j.barcode,
            j.category AS productgroup,
            j.product_type AS jewelriesproducttype,
            j.gender AS jewelriesgender,
            j.applique_material AS jewelriesappliquematerial,
            j.fineness AS jewelriesfiness,
            j.material_color AS jewelriesmaterialcolor,
            j.size_type AS jewelriessizetype,
            j.ring_size AS jewelriesringsize,
            j.price
           FROM workplace.jewelries j
          WHERE j.variant_id IS NOT NULL
        ), haravan_product_types AS (
         SELECT variants.id AS haravan_variant_id,
            variants.product_type AS haravan_product_type
           FROM haravan.variants
        ), combined_data AS (
         SELECT diamonds.haravan_product_id,
            diamonds.haravan_variant_id,
            diamonds.barcode,
            diamonds.diamondreportno,
            diamonds.price,
            diamonds.diamondcogs,
            diamonds.productgroup,
            diamonds.diamondshape,
            diamonds.diamondcut,
            diamonds.diamondcolor,
            diamonds.diamondclarity,
            diamonds.diamondfluorescence,
            diamonds.diamondlength,
            diamonds.diamondwidth,
            diamonds.diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'diamond'::text AS source_table
           FROM diamonds
        UNION ALL
         SELECT jewelries.haravan_product_id,
            jewelries.haravan_variant_id,
            jewelries.barcode,
            NULL::bigint AS diamondreportno,
            jewelries.price,
            NULL::numeric AS diamondcogs,
            'Trang sức'::text AS productgroup,
            NULL::text AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            NULL::real AS diamondlength,
            NULL::real AS diamondwidth,
            NULL::numeric AS diamondcarat,
            jewelries.jewelriesvariantid,
            jewelries.designid,
            jewelries.jewelriesproducttype,
            jewelries.jewelriesgender,
            jewelries.jewelriesappliquematerial,
            jewelries.jewelriesfiness,
            jewelries.jewelriesmaterialcolor,
            jewelries.jewelriessizetype,
            jewelries.jewelriesringsize,
            'jewelry'::text AS source_table
           FROM jewelries
        UNION ALL
         SELECT variants.product_id AS haravan_product_id,
            variants.id AS haravan_variant_id,
            variants.barcode,
            NULL::bigint AS diamondreportno,
            variants.price,
            NULL::numeric AS diamondcogs,
            'Sản phẩm khác'::text AS productgroup,
            NULL::text AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            NULL::real AS diamondlength,
            NULL::real AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'variant'::text AS source_table
           FROM haravan.variants
          WHERE (variants.product_type::text = ANY (ARRAY['virtual'::character varying, 'Hàng Bảo Hành'::character varying, 'Quà Tặng'::character varying, 'Hàng Khách Gửi'::character varying]::text[])) AND ((variants.product_type::text = ANY (ARRAY['virtual'::character varying, 'Hàng Khách Gửi'::character varying]::text[])) OR variants.title::text !~ 'GIA[0-9]{10}'::text)
        UNION ALL
         SELECT melee_diamonds.haravan_product_id,
            melee_diamonds.haravan_variant_id,
            melee_diamonds.barcode,
            NULL::bigint AS diamondreportno,
            NULL::numeric AS price,
            NULL::numeric AS diamondcogs,
            'Kim Cương Tấm'::text AS productgroup,
            melee_diamonds.shape AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            melee_diamonds.length AS diamondlength,
            melee_diamonds.width AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'melee_diamond'::text AS source_table
           FROM workplace.melee_diamonds
          WHERE melee_diamonds.haravan_variant_id IS NOT NULL
        UNION ALL
         SELECT moissanite.haravan_product_id,
            moissanite.haravan_variant_id,
            moissanite.barcode,
            NULL::bigint AS diamondreportno,
            NULL::numeric AS price,
            NULL::numeric AS diamondcogs,
            'Moissanite'::text AS productgroup,
            moissanite.shape AS diamondshape,
            NULL::text AS diamondcut,
            NULL::text AS diamondcolor,
            NULL::text AS diamondclarity,
            NULL::text AS diamondfluorescence,
            moissanite.length AS diamondlength,
            moissanite.width AS diamondwidth,
            NULL::numeric AS diamondcarat,
            NULL::integer AS jewelriesvariantid,
            NULL::bigint AS designid,
            NULL::text AS jewelriesproducttype,
            NULL::text AS jewelriesgender,
            NULL::text AS jewelriesappliquematerial,
            NULL::text AS jewelriesfiness,
            NULL::text AS jewelriesmaterialcolor,
            NULL::text AS jewelriessizetype,
            NULL::numeric AS jewelriesringsize,
            'moissanite'::text AS source_table
           FROM workplace.moissanite
          WHERE moissanite.haravan_variant_id IS NOT NULL AND moissanite.haravan_product_id IS NOT NULL
        ), combined_with_product_type AS (
         SELECT cd.haravan_product_id,
            cd.haravan_variant_id,
            cd.barcode,
            cd.diamondreportno,
            cd.price,
            cd.diamondcogs,
            cd.productgroup,
            cd.diamondshape,
            cd.diamondcut,
            cd.diamondcolor,
            cd.diamondclarity,
            cd.diamondfluorescence,
            cd.diamondlength,
            cd.diamondwidth,
            cd.diamondcarat,
            cd.jewelriesvariantid,
            cd.designid,
            cd.jewelriesproducttype,
            cd.jewelriesgender,
            cd.jewelriesappliquematerial,
            cd.jewelriesfiness,
            cd.jewelriesmaterialcolor,
            cd.jewelriessizetype,
            cd.jewelriesringsize,
            cd.source_table,
            hpt.haravan_product_type
           FROM combined_data cd
             LEFT JOIN haravan_product_types hpt ON cd.haravan_variant_id = hpt.haravan_variant_id
        ), ranked_data AS (
         SELECT combined_with_product_type.haravan_product_id,
            combined_with_product_type.haravan_variant_id,
            combined_with_product_type.barcode,
            combined_with_product_type.diamondreportno,
            combined_with_product_type.price,
            combined_with_product_type.diamondcogs,
            combined_with_product_type.productgroup,
            combined_with_product_type.diamondshape,
            combined_with_product_type.diamondcut,
            combined_with_product_type.diamondcolor,
            combined_with_product_type.diamondclarity,
            combined_with_product_type.diamondfluorescence,
            combined_with_product_type.diamondlength,
            combined_with_product_type.diamondwidth,
            combined_with_product_type.diamondcarat,
            combined_with_product_type.jewelriesvariantid,
            combined_with_product_type.designid,
            combined_with_product_type.jewelriesproducttype,
            combined_with_product_type.jewelriesgender,
            combined_with_product_type.jewelriesappliquematerial,
            combined_with_product_type.jewelriesfiness,
            combined_with_product_type.jewelriesmaterialcolor,
            combined_with_product_type.jewelriessizetype,
            combined_with_product_type.jewelriesringsize,
            combined_with_product_type.source_table,
            combined_with_product_type.haravan_product_type,
            row_number() OVER (PARTITION BY combined_with_product_type.haravan_variant_id ORDER BY combined_with_product_type.haravan_variant_id) AS rn
           FROM combined_with_product_type
        ), final_query AS (
         SELECT ranked_data.haravan_product_id,
            ranked_data.haravan_variant_id,
            ranked_data.barcode,
            ranked_data.diamondreportno,
            ranked_data.price,
            ranked_data.diamondcogs,
            ranked_data.productgroup,
            ranked_data.diamondshape,
            ranked_data.diamondcut,
            ranked_data.diamondcolor,
            ranked_data.diamondclarity,
            ranked_data.diamondfluorescence,
            ranked_data.diamondlength,
            ranked_data.diamondwidth,
            ranked_data.diamondcarat,
            ranked_data.jewelriesvariantid,
            ranked_data.designid,
            ranked_data.jewelriesproducttype,
            ranked_data.jewelriesgender,
            ranked_data.jewelriesappliquematerial,
            ranked_data.jewelriesfiness,
            ranked_data.jewelriesmaterialcolor,
            ranked_data.jewelriessizetype,
            ranked_data.jewelriesringsize,
            ranked_data.source_table,
            ranked_data.haravan_product_type
           FROM ranked_data
          WHERE ranked_data.rn = 1
        )
 SELECT f.haravan_product_id,
    f.haravan_variant_id,
    f.barcode,
    f.diamondreportno,
    f.price,
    f.diamondcogs,
    f.productgroup,
    f.diamondshape,
    f.diamondcut,
    f.diamondcolor,
    f.diamondclarity,
    f.diamondfluorescence,
    f.diamondlength,
    f.diamondwidth,
    f.diamondcarat,
    f.jewelriesvariantid,
    f.designid,
    f.jewelriesproducttype,
    f.jewelriesgender,
    f.jewelriesappliquematerial,
    f.jewelriesfiness,
    f.jewelriesmaterialcolor,
    f.jewelriessizetype,
    f.jewelriesringsize,
    f.source_table,
    f.haravan_product_type,
    hv.sku
   FROM final_query f
     LEFT JOIN haravan.variants hv ON f.haravan_variant_id = hv.id;
ALTER TABLE "supplychain"."dim_products" OWNER TO "neondb_owner";

-- ----------------------------
-- View structure for variant_price_changes
-- ----------------------------
DROP VIEW IF EXISTS "supplychain"."variant_price_changes";
CREATE VIEW "supplychain"."variant_price_changes" AS  WITH variants_cte AS (
         SELECT p.id AS nocodb_product_id,
            p.haravan_product_id,
            v.id AS nocodb_variant_id,
            v.haravan_variant_id,
            p.design_id,
            p.published_scope,
            d.design_code,
            v.fineness,
            (d.design_code || '_'::text) || v.fineness AS design_code_material,
            v.price AS old_price,
            hv.qty_onhand
           FROM workplace.products p
             LEFT JOIN workplace.variants v ON v.product_id = p.id
             LEFT JOIN workplace.designs d ON p.design_id = d.id
             LEFT JOIN haravan.variants hv ON v.haravan_variant_id = hv.id
          WHERE p.haravan_product_id IS NOT NULL AND v.haravan_variant_id IS NOT NULL
        ), price_changes_cte AS (
         SELECT j.design_id,
            d.design_code,
            d.design_type,
            j.material,
            (j.design_code || '_'::text) || j.material AS design_code_material,
                CASE
                    WHEN d.design_type = 'Bông Tai'::text THEN j.proposal_price / 2::numeric
                    ELSE j.proposal_price
                END AS new_price,
            j.tag
           FROM supplychain.jewelry_price j
             LEFT JOIN workplace.designs d ON j.design_id = d.id
        )
 SELECT vcte.nocodb_product_id,
    vcte.haravan_product_id,
    vcte.nocodb_variant_id,
    vcte.haravan_variant_id,
    vcte.design_id,
    vcte.design_code,
    vcte.fineness,
    vcte.published_scope,
    vcte.design_code_material,
    pcte.new_price,
    vcte.old_price,
    pcte.new_price - vcte.old_price AS diff_price,
    (pcte.new_price - vcte.old_price) / NULLIF(pcte.new_price, 0::numeric) AS percent_diff_price,
    vcte.qty_onhand,
    pcte.tag
   FROM variants_cte vcte
     LEFT JOIN price_changes_cte pcte ON vcte.design_code_material = pcte.design_code_material
  WHERE pcte.new_price IS NOT NULL;
ALTER TABLE "supplychain"."variant_price_changes" OWNER TO "neondb_owner";

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "supplychain"."design_melee_id_seq"
OWNED BY "supplychain"."design_melee"."id";
SELECT setval('"supplychain"."design_melee_id_seq"', 11141, true);

-- ----------------------------
-- Primary Key structure for table buyback_exchange_approval_instances_detail
-- ----------------------------
ALTER TABLE "supplychain"."buyback_exchange_approval_instances_detail" ADD CONSTRAINT "buyback_exchange_approval_instances_pkey" PRIMARY KEY ("request_no");

-- ----------------------------
-- Triggers structure for table design_melee
-- ----------------------------
CREATE TRIGGER "trg_set_updated_at" BEFORE UPDATE ON "supplychain"."design_melee"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_database_updated_at"();

-- ----------------------------
-- Primary Key structure for table design_melee
-- ----------------------------
ALTER TABLE "supplychain"."design_melee" ADD CONSTRAINT "design_melee_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table designs
-- ----------------------------
CREATE TRIGGER "trg_classify_melee_type" AFTER UPDATE OF "get_melee_status" ON "supplychain"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."classify_melee_type"();
CREATE TRIGGER "trg_melee_type_update" BEFORE UPDATE ON "supplychain"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."trg_update_melee_type_timestamp"();
CREATE TRIGGER "trg_update_link_4view_timestamp" BEFORE UPDATE ON "supplychain"."designs"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_link_4view_timestamp"();

-- ----------------------------
-- Checks structure for table designs
-- ----------------------------
ALTER TABLE "supplychain"."designs" ADD CONSTRAINT "designs_get_melee_status_check" CHECK (get_melee_status = ANY (ARRAY['Pending'::text, 'Success'::text, 'Fail'::text]));

-- ----------------------------
-- Primary Key structure for table designs
-- ----------------------------
ALTER TABLE "supplychain"."designs" ADD CONSTRAINT "designs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Triggers structure for table diamond_attribute
-- ----------------------------
CREATE TRIGGER "trigger_set_database_created_at" BEFORE INSERT ON "supplychain"."diamond_attribute"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_database_created_at"();
CREATE TRIGGER "trigger_set_database_updated_at" BEFORE UPDATE ON "supplychain"."diamond_attribute"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_database_updated_at"();

-- ----------------------------
-- Primary Key structure for table diamond_attribute
-- ----------------------------
ALTER TABLE "supplychain"."diamond_attribute" ADD CONSTRAINT "diamond_attribute_pk" PRIMARY KEY ("report_no");

-- ----------------------------
-- Primary Key structure for table diamond_purchase
-- ----------------------------
ALTER TABLE "supplychain"."diamond_purchase" ADD CONSTRAINT "diamond_purchase_pk" PRIMARY KEY ("report_no");

-- ----------------------------
-- Primary Key structure for table diamond_quotation
-- ----------------------------
ALTER TABLE "supplychain"."diamond_quotation" ADD CONSTRAINT "diamond_quotation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table diamond_ticket_quotation
-- ----------------------------
ALTER TABLE "supplychain"."diamond_ticket_quotation" ADD CONSTRAINT "diamond_ticket_quotation_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table gold_prices
-- ----------------------------
ALTER TABLE "supplychain"."gold_prices" ADD CONSTRAINT "gold_prices_pkey" PRIMARY KEY ("timestamp");

-- ----------------------------
-- Triggers structure for table history_price_ticket
-- ----------------------------
CREATE TRIGGER "trigger_set_created_at" BEFORE INSERT ON "supplychain"."history_price_ticket"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_created_at"();
CREATE TRIGGER "trigger_set_updated_at" BEFORE UPDATE ON "supplychain"."history_price_ticket"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();

-- ----------------------------
-- Primary Key structure for table jewelry_design_items
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_design_items" ADD CONSTRAINT "jewelry_design_items_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Primary Key structure for table jewelry_price
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_price" ADD CONSTRAINT "jewelry_price_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Triggers structure for table jewelry_purchase_order_line_items
-- ----------------------------
CREATE TRIGGER "set_db_update_at_trigger" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();
CREATE TRIGGER "trg_update_hash_order_product_id" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_jewelry_purchase_order_line_items_hash_order_product_id"();
CREATE TRIGGER "trg_update_hash_sku_id" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_order_line_items"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_jewelry_purchase_order_line_items_hash_sku_id"();

-- ----------------------------
-- Primary Key structure for table jewelry_purchase_order_line_items
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_purchase_order_line_items" ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Triggers structure for table jewelry_purchase_orders
-- ----------------------------
CREATE TRIGGER "trg_set_db_update_at" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();
CREATE TRIGGER "trigger_set_db_update_at" BEFORE INSERT OR UPDATE ON "supplychain"."jewelry_purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."set_updated_at"();
CREATE TRIGGER "trigger_update_hash_record_id_jewelry_purchase_order" BEFORE UPDATE OF "record_id" ON "supplychain"."jewelry_purchase_orders"
FOR EACH ROW
EXECUTE PROCEDURE "supplychain"."update_jewelry_purchase_order_hash_record_id"();

-- ----------------------------
-- Primary Key structure for table jewelry_purchase_orders
-- ----------------------------
ALTER TABLE "supplychain"."jewelry_purchase_orders" ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("record_id");

-- ----------------------------
-- Primary Key structure for table pnj_products
-- ----------------------------
ALTER TABLE "supplychain"."pnj_products" ADD CONSTRAINT "pnj_products_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table ticket_price
-- ----------------------------
ALTER TABLE "supplychain"."ticket_price" ADD CONSTRAINT "ticket_price_pkey" PRIMARY KEY ("recordid");

