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
