-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "advertising_cost";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "bizflycrm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dashboard_reporting";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecom";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ecommerce";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "erpnext";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "gia";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "haravan";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory_cms";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "jemmia";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "larksuite";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "market_data";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "misa";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pancake";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payment";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "policy";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "promotion";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rapnet";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "reporting";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workplace";

-- CreateTable
CREATE TABLE "advertising_cost"."platforms" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "channel" VARCHAR,
    "name" VARCHAR,
    "page_id" VARCHAR,
    "platform" VARCHAR,
    "area" VARCHAR,
    "updated_at" BIGINT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platforms_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."allocations" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "total_amount" DECIMAL(36,8),
    "allocation_amount" DECIMAL(36,8),
    "allocation_amount_percent" DECIMAL(36,8),
    "allocation_date" TIMESTAMP(6),
    "sale" JSONB,
    "order" JSONB,
    "customer" JSONB,
    "contract" JSONB,
    "created_by" JSONB,
    "status" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "_auto_id" BIGINT,
    "sale_team" JSONB,
    "_related_department" JSONB,
    "piece" DOUBLE PRECISION,
    "total_pieces" DOUBLE PRECISION,
    "ngay_phan_bo" TIMESTAMP(6),
    "source" JSONB,
    "payload" JSONB,
    "order_id" VARCHAR(50),
    "customer_id" VARCHAR(50),
    "sale_id" VARCHAR(50),
    "sale_name" VARCHAR(255),
    "sale_team_id" VARCHAR(50),
    "sale_team_value" VARCHAR(255),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."calls" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "action" VARCHAR,
    "answer_time" TIMESTAMP(6),
    "bizfly_project_token" VARCHAR,
    "call_id" VARCHAR,
    "call_status" JSONB,
    "call_status_type" JSONB,
    "callee" JSONB,
    "caller" JSONB,
    "collection_key" VARCHAR,
    "created_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "customer_id" VARCHAR,
    "customer_phones" JSONB,
    "end_time" TIMESTAMP(6),
    "note" VARCHAR,
    "phone_call_id" VARCHAR,
    "project_id" VARCHAR,
    "related_id" JSONB,
    "run" INTEGER,
    "sale" JSONB,
    "sale_phones" JSONB,
    "sale_team" JSONB,
    "status" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "payload" JSONB,
    "callee_value" VARCHAR,
    "caller_value" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."customers" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "_first_order" TIMESTAMP(6),
    "_last_order" TIMESTAMP(6),
    "_number_order" INTEGER,
    "_order_value" DECIMAL(36,8),
    "_order_value_in_year" DECIMAL(36,8),
    "_paid_value" DECIMAL(36,8),
    "_total_order_data_item" INTEGER,
    "address1" VARCHAR,
    "bank_account_number" VARCHAR(50),
    "bank_address" JSONB,
    "bank_branch" VARCHAR,
    "bank_name" VARCHAR,
    "city_name" VARCHAR,
    "company_address" VARCHAR,
    "company_name" VARCHAR,
    "country_name" VARCHAR,
    "created_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "cumulative_tov_buyback" DECIMAL(36,8),
    "cumulative_tov_in_last_12mos" DECIMAL(36,8),
    "cumulative_tov_lifetime" DECIMAL(36,8),
    "cumulative_tov_recorded" DECIMAL(36,8),
    "customer_rank" JSONB,
    "customer_type" JSONB,
    "customer_types" JSONB,
    "customer_vat_email" JSONB,
    "date_of_issuance" TIMESTAMP(6),
    "district_name" VARCHAR,
    "emails" JSONB,
    "first_channel" JSONB,
    "haravan_id" VARCHAR,
    "haravan_retailer" VARCHAR,
    "instagram_sender_id" VARCHAR,
    "link_blank" VARCHAR,
    "lists" JSONB,
    "loai_qua_tang" JSONB,
    "ma_khach_hang" VARCHAR,
    "ma_kich_hoat" VARCHAR,
    "name" JSONB,
    "ngay_tao_tai_khoan" TIMESTAMP(6),
    "past_order_value" DECIMAL(36,8),
    "personal_id" VARCHAR,
    "phones" JSONB,
    "place_of_issuance" JSONB,
    "rd_address" VARCHAR,
    "rd_bizfly_bot_id" VARCHAR,
    "rd_first_assign_for" TIMESTAMP(6),
    "rd_first_phone_time" TIMESTAMP(6),
    "rd_gender" VARCHAR,
    "rd_last_phone_update_time" TIMESTAMP(6),
    "sale" JSONB,
    "source" JSONB,
    "status" VARCHAR,
    "tags" JSONB,
    "tax_code" VARCHAR,
    "tong_gia_tri_thu_mua_2" DECIMAL(36,8),
    "updated_at" TIMESTAMP(6),
    "user_spam" BOOLEAN,
    "utm_first_utm_source" JSONB,
    "ward_name" VARCHAR,
    "website" VARCHAR,
    "xung_ho" JSONB,
    "zalo_sender_id" VARCHAR,
    "_date_sinh_nhat" TIMESTAMP(6),
    "customer_passport" VARCHAR,
    "gioi_tinh" JSONB,
    "link_facebook" VARCHAR,
    "passport_date_of_issuance" TIMESTAMP(6),
    "passport_place_of_issuance" JSONB,
    "sinh_nhat" TIMESTAMP(6),
    "customer_journey" JSONB,
    "account" JSONB,
    "customer_referral" JSONB,
    "dia_chi" VARCHAR,
    "files" JSONB,
    "note" VARCHAR,
    "owner" JSONB,
    "rd_addresses" VARCHAR,
    "rd_tags" JSONB,
    "sale_team" JSONB,
    "utm_campaign" JSONB,
    "utm_content" JSONB,
    "utm_medium" JSONB,
    "utm_referer" JSONB,
    "utm_source" JSONB,
    "utm_term" JSONB,
    "app_first_login_date" TIMESTAMP(6),
    "_last_activity_time" TIMESTAMP(6),
    "_last_note_time" TIMESTAMP(6),
    "_utm_all" JSONB,
    "facebook_id_fp" VARCHAR,
    "facebook_sender_id" VARCHAR,
    "is_merge_item" BOOLEAN,
    "linking_fanpage" JSONB,
    "rd_conversation_id" VARCHAR,
    "rd_first_fb_message_time" TIMESTAMP(6),
    "rd_first_name" VARCHAR,
    "rd_first_support_assign_for" VARCHAR,
    "rd_full_name" VARCHAR,
    "rd_last_fb_message_messenger_time" TIMESTAMP(6),
    "rd_owner_time" TIMESTAMP(6),
    "rd_user_id" VARCHAR,
    "rd_username" VARCHAR,
    "_first_time_assign_main_sale" TIMESTAMP(6),
    "_last_call_in_time" TIMESTAMP(6),
    "_last_call_out_time" TIMESTAMP(6),
    "_last_time_assign_main_sale" TIMESTAMP(6),
    "_related_department" JSONB,
    "chien_dich" VARCHAR,
    "created_by" JSONB,
    "customer_care_employee" JSONB,
    "customer_related" JSONB,
    "product" JSONB,
    "rd_last_assign_for" TIMESTAMP(6),
    "rd_last_message_time_old_user" TIMESTAMP(6),
    "rd_last_name" VARCHAR,
    "ref_types" JSONB,
    "utm_converted_last_utm_campaign" JSONB,
    "utm_converted_last_utm_content" JSONB,
    "utm_converted_last_utm_medium" JSONB,
    "utm_converted_last_utm_referer" JSONB,
    "utm_converted_last_utm_source" JSONB,
    "utm_converted_last_utm_term" JSONB,
    "utm_converted_utm_campaign" JSONB,
    "utm_converted_utm_medium" JSONB,
    "utm_converted_utm_referer" JSONB,
    "utm_converted_utm_source" JSONB,
    "utm_converted_utm_term" JSONB,
    "utm_first_utm_campaign" JSONB,
    "utm_first_utm_content" JSONB,
    "utm_first_utm_medium" JSONB,
    "utm_first_utm_referer" JSONB,
    "utm_first_utm_term" JSONB,
    "utm_last_utm_campaign" JSONB,
    "utm_last_utm_content" JSONB,
    "utm_last_utm_medium" JSONB,
    "utm_last_utm_referer" JSONB,
    "utm_last_utm_source" JSONB,
    "utm_last_utm_term" JSONB,
    "cumulative_tov_referral" DECIMAL(36,8),
    "demotion_date" TIMESTAMP(6),
    "customer_status" JSONB,
    "sale_history" JSONB,
    "age_group" JSONB,
    "facebook_id" JSONB,
    "rd_fb_user_id" VARCHAR,
    "_recent_sale" JSONB,
    "_total_call_in" INTEGER,
    "cumulative_tov_in_last_12_months" DECIMAL(36,8),
    "cumulative_tov_unrecorded" DECIMAL(36,8),
    "customer_birthday_update_pwa" TIMESTAMP(6),
    "customer_email_update_pwa" VARCHAR,
    "customer_vat_types" JSONB,
    "rd_last_zalo_messages_time" TIMESTAMP(6),
    "rd_page_active" VARCHAR,
    "tmp_unique" VARCHAR,
    "rd_ref_facebook" JSONB,
    "chi_tiet_don_hang_gioi_thieu" JSONB,
    "ads" JSONB,
    "_is_converted" INTEGER,
    "customer_rank_label" VARCHAR,
    "customer_type_label" VARCHAR,
    "customer_types_label" VARCHAR,
    "first_channel_label" VARCHAR,
    "gioi_tinh_label" VARCHAR,
    "name_value" VARCHAR,
    "phone_value" VARCHAR,
    "owner_name" VARCHAR,
    "owner_id" VARCHAR,
    "sale_name" VARCHAR,
    "sale_id" VARCHAR,
    "age_group_label" VARCHAR,
    "place_of_issuance_label" VARCHAR,
    "customer_care_employee_name" VARCHAR,
    "passport_place_of_issuance_label" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "customer_opportunities" JSONB,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."departments" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "status" VARCHAR,
    "_auto_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "key" VARCHAR,
    "numerical_order" VARCHAR,
    "_first_time_assign_main_sale" VARCHAR,
    "_first_time_assign_sale" VARCHAR,
    "_last_time_assign_main_sale" VARCHAR,
    "_last_time_assign_sale" VARCHAR,
    "created_by" JSONB,
    "level_department" JSONB,
    "name" JSONB,
    "sale" JSONB,
    "list_sale" JSONB,
    "related_department_value" VARCHAR,
    "name_value" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."kpis" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "status" VARCHAR,
    "_auto_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "_first_time_assign_main_sale" TIMESTAMP(6),
    "_first_time_assign_sale" TIMESTAMP(6),
    "_last_time_assign_main_sale" TIMESTAMP(6),
    "_last_time_assign_sale" TIMESTAMP(6),
    "sale_team" JSONB,
    "created_by" JSONB,
    "description" JSONB,
    "name" JSONB,
    "sale" JSONB,
    "sale_used" JSONB,
    "_related_department" JSONB,
    "norm_data_item" JSONB,
    "sale_data_item" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."line_items" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "order_id" VARCHAR(50),
    "price_sale" DECIMAL(36,8),
    "variant_id" VARCHAR,
    "bien_the_san_pham" VARCHAR,
    "barcode" VARCHAR,
    "sku" VARCHAR,
    "quantity" BIGINT,
    "item_name" VARCHAR,
    "item_id" VARCHAR,
    "applied_discount" JSONB,
    "invoice_discount" JSONB,
    "amount" DECIMAL(36,8),
    "order_detail_diamond" VARCHAR,
    "ten_sphd" VARCHAR,
    "thong_tin_size_tam" JSONB,
    "purity" JSONB,
    "unit" JSONB,
    "setting_weight" VARCHAR,
    "discount_percent" DOUBLE PRECISION,
    "discount_value" DECIMAL(36,8),
    "setting_color" JSONB,
    "promotion" JSONB,
    "product_status" JSONB,
    "buyback_price" DECIMAL(36,8),
    "item_code" VARCHAR,
    "note" VARCHAR,
    "product_name" VARCHAR,
    "vat" DOUBLE PRECISION,
    "other_price" DECIMAL(36,8),
    "chitiet_goidichvu" JSONB,
    "goi_dichvu" JSONB,
    "discount" DOUBLE PRECISION,
    "product_status_value" VARCHAR,
    "promotion_value" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "price" DECIMAL(36,8),
    "serial_number" JSONB,
    "serial_number_value" VARCHAR,
    "serial_number_id" VARCHAR,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."orders" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "_allocation_value" DECIMAL(36,8),
    "_auto_id" BIGINT,
    "_first_time_assign_main_sale" TIMESTAMP(6),
    "_first_time_assign_sale" TIMESTAMP(6),
    "_last_note_time" TIMESTAMP(6),
    "_last_time_assign_main_sale" TIMESTAMP(6),
    "_last_time_assign_sale" TIMESTAMP(6),
    "_total_data_item" INTEGER,
    "address1" VARCHAR,
    "allocated" INTEGER,
    "bao_hanh" JSONB,
    "bonus_thanh_tien" DECIMAL(36,8),
    "buyback_amount" DECIMAL(36,8),
    "buyback_items" JSONB,
    "buyback_type" JSONB,
    "cancel_reason" VARCHAR,
    "cancelled_at" TIMESTAMP(6),
    "cancelled_status" JSONB,
    "channel" VARCHAR,
    "chiet_khau_san_pham" DECIMAL(36,8),
    "chinh_sach_bao_hanh" JSONB,
    "city_name" VARCHAR,
    "confirm_order" VARCHAR,
    "consult_date" TIMESTAMP(6),
    "country_name" VARCHAR,
    "ward_name" VARCHAR,
    "created_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "customer" JSONB,
    "customer_type" JSONB,
    "da_thanh_toan" DECIMAL(36,8),
    "delivered_date" TIMESTAMP(6),
    "delivery_location" JSONB,
    "delivery_locations" JSONB,
    "deposit_origination" JSONB,
    "district_name" VARCHAR,
    "expected_delivery_date" TIMESTAMP(6),
    "expected_payment_date" TIMESTAMP(6),
    "financial_complete_date" TIMESTAMP(6),
    "financial_status" JSONB,
    "fulfillment_status" JSONB,
    "haravan_confirmed_by" VARCHAR(50),
    "haravan_created_by" VARCHAR(50),
    "haravan_id" VARCHAR(50),
    "haravan_retailer" VARCHAR,
    "is_bought_back" VARCHAR,
    "link_blank" VARCHAR,
    "location_name" VARCHAR,
    "ngay_tao_tai_khoan" TIMESTAMP(6),
    "note" TEXT,
    "order_amount" DECIMAL(36,8),
    "order_channel" JSONB,
    "order_code" VARCHAR,
    "order_created_on" TIMESTAMP(6),
    "order_data_item" JSONB,
    "order_discount" DECIMAL(36,8),
    "order_left_amount" DECIMAL(36,8),
    "order_paid_amount" DECIMAL(36,8),
    "order_pretax" DECIMAL(36,8),
    "order_promotion" JSONB,
    "order_status" JSONB,
    "order_tax" DECIMAL(36,8),
    "order_type" JSONB,
    "original_order" JSONB,
    "paid_amount_percentage" DOUBLE PRECISION,
    "payload" JSONB,
    "payment_method_order" JSONB,
    "payment_status" JSONB,
    "phi_van_chuyen" DECIMAL(36,8),
    "phieu_thu_mua" JSONB,
    "phone" JSONB,
    "phuong_thuc_thanh_toan" JSONB,
    "product_category" JSONB,
    "purpose" JSONB,
    "real_created_at" TIMESTAMP(6),
    "receipt_status" JSONB,
    "ref_order_date" TIMESTAMP(6),
    "ref_order_id" VARCHAR(50),
    "ref_order_number" VARCHAR,
    "ref_reward" JSONB,
    "rule_trigger" JSONB,
    "sale" JSONB,
    "sale_team" JSONB,
    "shipping_address_company" VARCHAR,
    "shipping_address_name" VARCHAR,
    "source" JSONB,
    "status" VARCHAR,
    "tags" JSONB,
    "thoi_gian_giao_hang" TIMESTAMP(6),
    "tong_da_thanh_toan" DECIMAL(36,8),
    "tong_gia_tri_don_hang" DECIMAL(36,8),
    "tong_tien_hang" DECIMAL(36,8),
    "total_discounts" DECIMAL(36,8),
    "total_original_price" DECIMAL(36,8),
    "updated_at" TIMESTAMP(6),
    "nguoi_gioi_thieu" JSONB,
    "bao_hanh_value" VARCHAR,
    "cancelled_status_value" VARCHAR,
    "customer_id" VARCHAR(50),
    "customer_type_value" VARCHAR,
    "delivery_location_value" VARCHAR,
    "deposit_origination_value" VARCHAR,
    "financial_status_value" VARCHAR,
    "fulfillment_status_value" VARCHAR,
    "order_channel_value" VARCHAR,
    "order_status_value" VARCHAR,
    "order_type_label" VARCHAR,
    "order_type_value" VARCHAR,
    "order_type_id" VARCHAR(50),
    "original_order_value" VARCHAR,
    "payment_method_order_value" VARCHAR,
    "payment_status_value" VARCHAR,
    "phone_value" VARCHAR,
    "phone_hide" VARCHAR,
    "phuong_thuc_thanh_toan_value" VARCHAR,
    "purpose_label" VARCHAR,
    "receipt_status_value" VARCHAR,
    "ref_reward_value" VARCHAR,
    "main_sale_id" VARCHAR(50),
    "main_sale_name" VARCHAR,
    "nguoi_gioi_thieu_id" VARCHAR(50),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "product_category_label" VARCHAR(255),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."orders_receipts" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "purchasing_order_erp_id" VARCHAR(50),
    "customer" JSONB,
    "name" JSONB,
    "purchasing_types" JSONB,
    "purchasing_reason" JSONB,
    "purchasing_total" DECIMAL(36,8),
    "purchasing_total_transfer" DECIMAL(36,8),
    "purchasing_status" JSONB,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "thoi_gian_khach_ban_giao" TIMESTAMP(6),
    "chi_tiet_san_pham" JSONB,
    "created_at_system" TIMESTAMP(6),
    "status" VARCHAR,
    "created_by" JSONB,
    "source" JSONB,
    "_auto_id" BIGINT,
    "order" JSONB,
    "purchasing_order_id" JSONB,
    "reference_order" VARCHAR,
    "sale" JSONB,
    "total_exchange_value" DECIMAL(36,8),
    "payload" JSONB,
    "customer_value" VARCHAR,
    "customer_id" VARCHAR,
    "name_value" VARCHAR,
    "purchasing_types_label" VARCHAR,
    "purchasing_reason_value" VARCHAR,
    "purchasing_status_label" VARCHAR,
    "order_name" VARCHAR,
    "order_id" VARCHAR,
    "purchasing_order_id_value" VARCHAR,
    "purchasing_order_id_id" VARCHAR,
    "sale_id" VARCHAR,
    "sale_name" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_receipts_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."payments" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "payment_amount" DECIMAL(36,8),
    "payment_date" TIMESTAMP(6),
    "payment_method" JSONB,
    "order" JSONB,
    "customer" JSONB,
    "sale" JSONB,
    "sale_team" JSONB,
    "status" VARCHAR,
    "_auto_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "created_by" JSONB,
    "files" JSONB,
    "la_khoan_dat_coc_" JSONB,
    "updated_at" TIMESTAMP(6),
    "_related_department" JSONB,
    "payload" JSONB,
    "order_id" VARCHAR(50),
    "customer_id" VARCHAR(50),
    "sale_id" VARCHAR(50),
    "sale_name" VARCHAR(255),
    "sale_team_id" VARCHAR(50),
    "sale_team_value" VARCHAR(255),
    "files_link" VARCHAR(255),
    "la_khoan_dat_coc_label" VARCHAR(255),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."promotions" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "status" VARCHAR(50),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "created_by" JSONB,
    "discount_percentage" DOUBLE PRECISION,
    "promotion_description" JSONB,
    "sale" JSONB,
    "sale_team" JSONB,
    "type_of_promotion" JSONB,
    "customer" JSONB,
    "files" JSONB,
    "lists" JSONB,
    "name" JSONB,
    "priority_order" JSONB,
    "discount_group" JSONB,
    "discount_month" JSONB,
    "discount_duration" JSONB,
    "promotion_scope" JSONB,
    "discount_amount" BIGINT,
    "department" JSONB,
    "start_date" TIMESTAMP(6),
    "end_date" TIMESTAMP(6),
    "promotion_description_value" TEXT,
    "sale_name" VARCHAR,
    "type_of_promotion_value" VARCHAR,
    "name_value" VARCHAR,
    "priority_order_label" VARCHAR,
    "discount_group_label" VARCHAR,
    "discount_month_label" VARCHAR,
    "discount_duration_label" VARCHAR,
    "department_label" VARCHAR,
    "promotion_scope_label" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."serial_numbers" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "customer" JSONB,
    "status" VARCHAR,
    "_auto_id" BIGINT,
    "availability" JSONB,
    "created_at" TIMESTAMP(6),
    "created_at_system" TIMESTAMP(6),
    "created_by" JSONB,
    "serial_number" VARCHAR(50),
    "updated_at" TIMESTAMP(6),
    "sale" JSONB,
    "sale_team" JSONB,
    "_first_time_assign_main_sale" TIMESTAMP(6),
    "_first_time_assign_sale" TIMESTAMP(6),
    "_last_time_assign_main_sale" TIMESTAMP(6),
    "_last_time_assign_sale" TIMESTAMP(6),
    "sku" VARCHAR(50),
    "sub_sku" VARCHAR(50),
    "availability_value" VARCHAR(50),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "serial_numbers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "bizflycrm"."users" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "project_id" VARCHAR,
    "member_id" VARCHAR,
    "name" VARCHAR,
    "status" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "email" VARCHAR,
    "line" INTEGER,
    "phone" VARCHAR,
    "member" JSONB,
    "my_id" VARCHAR,
    "is_root" INTEGER,
    "blocked_by" VARCHAR,
    "stringee" VARCHAR,
    "vcc_call_center_hotline" VARCHAR,
    "vcc_call_center_number" VARCHAR,
    "group_role" JSONB,
    "group_role_new" JSONB,
    "selected_line" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "dashboard_reporting"."time_dim" (
    "col" SERIAL NOT NULL,
    "day" TIMESTAMP(6),

    CONSTRAINT "time_dim_pkey" PRIMARY KEY ("col")
);

-- CreateTable
CREATE TABLE "ecom"."jewelry_diamond_pairs" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "haravan_product_id" INTEGER NOT NULL,
    "haravan_variant_id" INTEGER NOT NULL,
    "haravan_diamond_product_id" INTEGER NOT NULL,
    "haravan_diamond_variant_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ecom"."leads" (
    "id" SERIAL NOT NULL,
    "raw_data" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "custom_uuid" TEXT DEFAULT (gen_random_uuid())::text,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecom"."products" (
    "haravan_product_id" BIGINT,
    "haravan_product_type" TEXT,
    "design_id" BIGINT,
    "handle" VARCHAR,
    "workplace_id" INTEGER,
    "category" TEXT,
    "title" TEXT,
    "min_price" DECIMAL,
    "max_price" DECIMAL,
    "qty_onhand" BIGINT,
    "image_updated_at" TIMESTAMP(6),
    "wedding_ring_id" INTEGER,
    "primary_collection" TEXT,
    "primary_collection_handle" TEXT,
    "pages" TEXT,
    "max_price_18" INTEGER,
    "max_price_14" INTEGER
);

-- CreateTable
CREATE TABLE "ecom"."qr_generator" (
    "id" VARCHAR NOT NULL,
    "bank_code" VARCHAR,
    "bank_account_number" VARCHAR,
    "customer_name" VARCHAR,
    "customer_phone_number" VARCHAR,
    "transfer_amount" BIGINT,
    "transfer_note" VARCHAR,
    "transfer_status" VARCHAR,
    "haravan_order_number" VARCHAR,
    "haravan_order_status" VARCHAR,
    "haravan_order_id" INTEGER,
    "haravan_order_total_price" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "is_deleted" BOOLEAN,
    "qr_url" TEXT,
    "lark_record_id" VARCHAR(255),
    "all_lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_synced_at" TIMESTAMP(6),
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,

    CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecom"."variants" (
    "hararvan_product_id" BIGINT,
    "haravan_variant_id" BIGINT,
    "sku" VARCHAR,
    "price" DECIMAL,
    "price_compare_at" DECIMAL(36,8),
    "material_color" TEXT,
    "fineness" TEXT,
    "ring_size" DECIMAL,
    "haravan_product_id" INTEGER
);

-- CreateTable
CREATE TABLE "ecom"."wedding_rings" (
    "id" INTEGER,
    "title" TEXT,
    "max_price" DECIMAL,
    "min_price" DECIMAL,
    "image_updated_at" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE "ecommerce"."order_tracking" (
    "uuid" UUID NOT NULL,
    "haravan_order_id" TEXT NOT NULL,
    "haravan_order_status" TEXT NOT NULL,

    CONSTRAINT "order_tracking_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."addresses" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "address_type" VARCHAR(255),
    "address_name" VARCHAR(255),
    "phone" VARCHAR(255),
    "email_id" VARCHAR(255),
    "address_line2" TEXT,
    "address_title" VARCHAR(255),
    "city" VARCHAR(255),
    "county" VARCHAR(255),
    "state" VARCHAR(255),
    "pincode" VARCHAR(255),
    "country" VARCHAR(255),
    "province" VARCHAR(255),
    "district" VARCHAR(255),
    "ward" VARCHAR(255),
    "address_line1" TEXT,
    "fax" VARCHAR(255),
    "tax_category" VARCHAR(255),
    "is_primary_address" INTEGER,
    "is_shipping_address" INTEGER,
    "disabled" INTEGER,
    "haravan_id" VARCHAR(255),
    "is_your_company_address" INTEGER,
    "links" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."contacts" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "salutation" VARCHAR(50),
    "first_name" VARCHAR(255),
    "address" VARCHAR(255),
    "gender" VARCHAR(20),
    "sync_with_google_contacts" INTEGER,
    "middle_name" VARCHAR(255),
    "full_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "user" VARCHAR(255),
    "inserted_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "haravan_customer_id" VARCHAR(255),
    "lead_owner" VARCHAR(255),
    "source_group" VARCHAR(255),
    "source" VARCHAR(255),
    "status" VARCHAR(50),
    "designation" VARCHAR(255),
    "phone" VARCHAR(20),
    "email_id" VARCHAR(255),
    "mobile_no" VARCHAR(20),
    "company_name" VARCHAR(255),
    "image" VARCHAR(255),
    "source_name" VARCHAR(255),
    "type" VARCHAR(50),
    "first_message_time" TIMESTAMP(6),
    "last_message_time" TIMESTAMP(6),
    "phone_number_provided_time" TIMESTAMP(6),
    "department" VARCHAR(255),
    "unsubscribed" INTEGER,
    "last_outgoing_call_time" TIMESTAMP(6),
    "last_incoming_call_time" TIMESTAMP(6),
    "last_summarize_time" TIMESTAMP(6),
    "is_replied" INTEGER,
    "pancake_conversation_id" VARCHAR(255),
    "pancake_inserted_at" TIMESTAMP(6),
    "pancake_updated_at" TIMESTAMP(6),
    "pancake_customer_id" VARCHAR(255),
    "thread_id" VARCHAR(255),
    "psid" VARCHAR(255),
    "can_inbox" INTEGER,
    "pancake_page_id" VARCHAR(255),
    "custom_uuid" VARCHAR(255),
    "page_url" VARCHAR(255),
    "user_agent" VARCHAR(255),
    "remote_ip" VARCHAR(255),
    "form_id" VARCHAR(255),
    "form_name" VARCHAR(255),
    "form_inserted_at" TIMESTAMP(6),
    "form_updated_at" TIMESTAMP(6),
    "stringee_id" VARCHAR(255),
    "stringee_to_number" VARCHAR(50),
    "stringee_from_number" VARCHAR(50),
    "stringee_start_time" TIMESTAMP(6),
    "stringee_end_time" TIMESTAMP(6),
    "stringee_from_internal" INTEGER,
    "stringee_to_internal" INTEGER,
    "stringee_recorded" INTEGER,
    "video_call" INTEGER,
    "google_contacts" VARCHAR(255),
    "google_contacts_id" VARCHAR(255),
    "pulled_from_google_contacts" INTEGER,
    "is_primary_contact" INTEGER,
    "is_billing_contact" INTEGER,
    "links" JSONB,
    "phone_numbers" JSONB,
    "phone_nos" JSONB,
    "emails" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."customers" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "naming_series" VARCHAR(255),
    "salutation" VARCHAR(255),
    "customer_name" VARCHAR(255),
    "customer_group" VARCHAR(255),
    "bizfly_customer_number" VARCHAR(255),
    "is_internal_customer" INTEGER,
    "customer_type" VARCHAR(255),
    "customer_rank" VARCHAR(255),
    "account_manager" VARCHAR(255),
    "lead_name" VARCHAR(255),
    "opportunity_name" VARCHAR(255),
    "territory" VARCHAR(255),
    "prospect_name" VARCHAR(255),
    "company_name" VARCHAR(255),
    "no_of_employees" INTEGER,
    "industry" VARCHAR(255),
    "market_segment" VARCHAR(255),
    "tax_number" VARCHAR(255),
    "ceo_name" VARCHAR(255),
    "personal_document_type" VARCHAR(255),
    "birth_date" TIMESTAMP(6),
    "gender" VARCHAR(255),
    "personal_id" VARCHAR(255),
    "place_of_issuance" VARCHAR(255),
    "person_name" VARCHAR(255),
    "date_of_issuance" TIMESTAMP(6),
    "first_source" VARCHAR(255),
    "customer_website" VARCHAR(255),
    "customer_journey" VARCHAR(255),
    "default_currency" VARCHAR(255),
    "default_bank_account" VARCHAR(255),
    "default_price_list" VARCHAR(255),
    "represents_company" INTEGER,
    "customer_pos_id" VARCHAR(255),
    "website" VARCHAR(255),
    "language" VARCHAR(255),
    "customer_details" VARCHAR(255),
    "customer_primary_address" VARCHAR(255),
    "primary_address" VARCHAR(1024),
    "image" VARCHAR(255),
    "customer_primary_contact" VARCHAR(255),
    "primary_contact" VARCHAR(255),
    "mobile_no" VARCHAR(255),
    "email_id" VARCHAR(255),
    "phone" VARCHAR(255),
    "invoice_type" VARCHAR(255),
    "vat_email" VARCHAR(255),
    "vat_name" VARCHAR(255),
    "vat_address" VARCHAR(255),
    "personal_tax_id" VARCHAR(255),
    "bank_account" VARCHAR(255),
    "payment_terms" VARCHAR(255),
    "loyalty_program" VARCHAR(255),
    "loyalty_program_tier" VARCHAR(255),
    "rank" VARCHAR(255),
    "purchase_amount_last_12_months" DECIMAL(18,6),
    "rank_expired_date" TIMESTAMP(6),
    "priority_login_date" TIMESTAMP(6),
    "cumulative_revenue" DECIMAL(18,6),
    "cashback" DECIMAL(18,6),
    "true_cumulative_revenue" DECIMAL(18,6),
    "withdraw_cashback" DECIMAL(18,6),
    "referrals_revenue" DECIMAL(18,6),
    "pending_cashback" DECIMAL(18,6),
    "priority_bank_account" VARCHAR(255),
    "default_sales_partner" VARCHAR(255),
    "default_commission_rate" DECIMAL(18,6),
    "so_required" INTEGER,
    "dn_required" INTEGER,
    "is_frozen" INTEGER,
    "disabled" SMALLINT,
    "haravan_id" VARCHAR(255),
    "bizfly_id" VARCHAR(255),
    "tax_id" VARCHAR(255),
    "tax_category" VARCHAR(255),
    "tax_withholding_category" VARCHAR(255),
    "account" JSONB,
    "portal_users" JSONB,
    "companies" JSONB,
    "sales_team" JSONB,
    "coupon_table" JSONB,
    "credit_limits" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."employees" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "user_id" TEXT,
    "creation" TIMESTAMP(6),
    "department" TEXT,
    "employee_name" TEXT,
    "gender" TEXT,
    "modified" TIMESTAMP(6),
    "modified_by" TEXT,
    "status" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."lead_budgets" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "budget_label" VARCHAR(255),
    "budget_from" DECIMAL(18,6),
    "budget_to" DECIMAL(18,6),
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_budgets_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."lead_demands" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "demand_label" VARCHAR(255),
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_demands_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."lead_sources" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "pancake_page_id" VARCHAR,
    "pancake_platform" VARCHAR,
    "source_name" VARCHAR,

    CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."leads" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "naming_series" VARCHAR(255),
    "type" VARCHAR(255),
    "salutation" VARCHAR(255),
    "first_name" VARCHAR(255),
    "middle_name" VARCHAR(255),
    "territory" VARCHAR(255),
    "lead_stage" VARCHAR(100),
    "phone" VARCHAR(20),
    "email_id" VARCHAR(255),
    "job_title" VARCHAR(255),
    "last_name" VARCHAR(255),
    "gender" VARCHAR(10),
    "qualified_lead_date" TIMESTAMP(6),
    "first_reach_at" TIMESTAMP(6),
    "lead_owner" VARCHAR(255),
    "source" VARCHAR(255),
    "status" VARCHAR(50),
    "customer" VARCHAR(255),
    "request_type" VARCHAR(100),
    "lead_name" VARCHAR(255),
    "lead_received_date" TIMESTAMP(6),
    "lead_source_name" VARCHAR(255),
    "lead_source_platform" VARCHAR(255),
    "qualification_status" VARCHAR(255),
    "qualified_by" VARCHAR(255),
    "qualified_on" TIMESTAMP(6),
    "purpose_lead" VARCHAR(255),
    "expected_delivery_date" DATE,
    "budget_lead" VARCHAR(255),
    "province" VARCHAR(255),
    "region" VARCHAR(255),
    "company_name" VARCHAR(255),
    "no_of_employees" VARCHAR(20),
    "annual_revenue" DECIMAL,
    "industry" VARCHAR(255),
    "market_segment" VARCHAR(255),
    "fax" VARCHAR(255),
    "tax_number" VARCHAR(255),
    "ceo_name" VARCHAR(255),
    "birth_date" DATE,
    "address" TEXT,
    "personal_tax_id" VARCHAR(255),
    "first_channel" VARCHAR(255),
    "personal_id" VARCHAR(255),
    "place_of_issuance" VARCHAR(255),
    "date_of_issuance" DATE,
    "website" VARCHAR(255),
    "bank_name" VARCHAR(255),
    "bank_branch" VARCHAR(255),
    "account_number" VARCHAR(255),
    "bank_province" VARCHAR(255),
    "bank_district" VARCHAR(255),
    "bank_ward" VARCHAR(255),
    "campaign_name" VARCHAR(255),
    "company" VARCHAR(255),
    "website_from_data" VARCHAR(255),
    "language" VARCHAR(10),
    "image" TEXT,
    "title" VARCHAR(255),
    "disabled" INTEGER,
    "unsubscribed" INTEGER,
    "blog_subscriber" INTEGER,
    "mobile_no" VARCHAR(20),
    "whatsapp_no" VARCHAR(20),
    "phone_ext" VARCHAR(20),
    "check_duplicate" VARCHAR(255),
    "doctype" VARCHAR(50),
    "notes" JSONB,
    "user_tags" JSONB,
    "preferred_product_type" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "leads_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."product_categories" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" VARCHAR(255),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."promotions" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" VARCHAR(255),
    "scope" VARCHAR(255),
    "is_active" INTEGER,
    "is_expired" INTEGER,
    "priority" VARCHAR(255),
    "discount_type" VARCHAR(255),
    "discount_amount" DECIMAL(18,6),
    "discount_percent" DECIMAL(18,6),
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "bizfly_id" VARCHAR(255),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."provinces" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "province_name" VARCHAR(255),
    "region" VARCHAR(255) NOT NULL,
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."purchase_purposes" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" VARCHAR(255),

    CONSTRAINT "purchase_purposes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."regions" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "region_name" VARCHAR(255) NOT NULL,
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "regions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."sales_order_notification_tracking" (
    "uuid" UUID NOT NULL,
    "order_name" TEXT NOT NULL,
    "haravan_order_id" TEXT NOT NULL,
    "lark_message_id" TEXT NOT NULL,
    "database_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3) NOT NULL,
    "order_data" JSONB,

    CONSTRAINT "sales_order_notification_tracking_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."sales_orders" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "owner" TEXT,
    "creation" TIMESTAMP(3),
    "modified" TIMESTAMP(3),
    "modified_by" TEXT,
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" TEXT,
    "naming_series" TEXT,
    "tax_id" TEXT,
    "order_type" TEXT,
    "skip_delivery_note" INTEGER,
    "delivery_date" TIMESTAMP(3),
    "po_no" TEXT,
    "po_date" TIMESTAMP(3),
    "company" TEXT,
    "amended_from" TEXT,
    "customer_name" TEXT,
    "order_number" TEXT,
    "transaction_date" TIMESTAMP(3),
    "real_order_date" TIMESTAMP(3),
    "cancelled_status" TEXT,
    "financial_status" TEXT,
    "fulfillment_status" TEXT,
    "expected_delivery_date" TIMESTAMP(3),
    "cost_center" TEXT,
    "project" TEXT,
    "currency" TEXT,
    "conversion_rate" DOUBLE PRECISION,
    "selling_price_list" TEXT,
    "price_list_currency" TEXT,
    "plc_conversion_rate" DOUBLE PRECISION,
    "ignore_pricing_rule" INTEGER,
    "scan_barcode" TEXT,
    "set_warehouse" TEXT,
    "reserve_stock" INTEGER,
    "apply_discount_on" TEXT,
    "base_discount_amount" DECIMAL(18,6),
    "coupon_code" TEXT,
    "additional_discount_percentage" DECIMAL(18,6),
    "total_qty" INTEGER,
    "total" DECIMAL(18,6),
    "discount_amount" DECIMAL(18,6),
    "grand_total" DECIMAL(18,6),
    "base_total" DECIMAL(18,6),
    "base_net_total" DECIMAL(18,6),
    "total_net_weight" DECIMAL(18,6),
    "net_total" DECIMAL(18,6),
    "tax_category" TEXT,
    "taxes_and_charges" TEXT,
    "shipping_rule" TEXT,
    "incoterm" TEXT,
    "named_place" TEXT,
    "base_total_taxes_and_charges" DECIMAL(18,6),
    "total_taxes_and_charges" DECIMAL(18,6),
    "base_grand_total" DECIMAL(18,6),
    "base_rounding_adjustment" DECIMAL(18,6),
    "base_rounded_total" DECIMAL(18,6),
    "base_in_words" TEXT,
    "rounding_adjustment" DECIMAL(18,6),
    "rounded_total" DECIMAL(18,6),
    "in_words" TEXT,
    "advance_paid" DECIMAL(18,6),
    "disable_rounded_total" INTEGER,
    "other_charges_calculation" TEXT,
    "contact_person" TEXT,
    "contact_display" TEXT,
    "contact_phone" TEXT,
    "contact_mobile" TEXT,
    "contact_email" TEXT,
    "customer_address" TEXT,
    "address_display" TEXT,
    "customer_group" TEXT,
    "territory" TEXT,
    "shipping_address_name" TEXT,
    "shipping_address" TEXT,
    "customer" TEXT,
    "gender" TEXT,
    "customer_type" TEXT,
    "customer_personal_id" TEXT,
    "birth_date" TIMESTAMP(3),
    "date_of_issuance" TIMESTAMP(3),
    "dispatch_address" TEXT,
    "place_of_issuance" TEXT,
    "dispatch_address_name" TEXT,
    "company_address" TEXT,
    "company_address_display" TEXT,
    "company_contact_person" TEXT,
    "status" TEXT,
    "delivery_status" TEXT,
    "per_delivered" DECIMAL(18,6),
    "per_billed" DECIMAL(18,6),
    "per_picked" DECIMAL(18,6),
    "billing_status" TEXT,
    "sales_partner" TEXT,
    "amount_eligible_for_commission" DECIMAL(18,6),
    "commission_rate" DECIMAL(18,6),
    "total_commission" DECIMAL(18,6),
    "loyalty_points" INTEGER,
    "loyalty_amount" DECIMAL(18,6),
    "from_date" TIMESTAMP(3),
    "to_date" TIMESTAMP(3),
    "auto_repeat" TEXT,
    "letter_head" TEXT,
    "group_same_items" INTEGER,
    "select_print_heading" TEXT,
    "language" TEXT,
    "is_internal_customer" INTEGER,
    "represents_company" TEXT,
    "source" TEXT,
    "inter_company_order_reference" TEXT,
    "campaign" TEXT,
    "party_account_currency" TEXT,
    "total_amount" DECIMAL(18,6),
    "expected_payment_date" TIMESTAMP(3),
    "paid_amount" DECIMAL(18,6),
    "balance" DECIMAL(18,6),
    "payment_terms_template" TEXT,
    "tc_name" TEXT,
    "terms" TEXT,
    "haravan_order_id" TEXT,
    "haravan_ref_order_id" TEXT,
    "haravan_created_at" TIMESTAMP(3),
    "source_name" TEXT,
    "sales_team" JSONB,
    "ref_sales_orders" JSONB,
    "promotions" JSONB,
    "product_categories" JSONB,
    "packed_items" JSONB,
    "taxes" JSONB,
    "pricing_rules" JSONB,
    "payment_records" JSONB,
    "payment_schedule" JSONB,
    "policies" JSONB,
    "items" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),
    "consultation_date" DATE,
    "primary_sales_person" TEXT,
    "sales_order_purposes" JSONB,
    "debt_histories" JSONB,

    CONSTRAINT "sales_orders_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."sales_persons" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "employee" TEXT,
    "bizfly_id" TEXT,
    "creation" TIMESTAMP(6),
    "department" TEXT,
    "enabled" SMALLINT,
    "is_group" SMALLINT,
    "modified" TIMESTAMP(6),
    "modified_by" TEXT,
    "old_parent" TEXT,
    "parent_sales_person" TEXT,
    "sales_person_name" TEXT,
    "sales_region" TEXT,
    "targets" JSONB,

    CONSTRAINT "sales_persons_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."users" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "birth_date" TIMESTAMP(3),
    "creation" TIMESTAMP(6),
    "enabled" SMALLINT,
    "full_name" TEXT,
    "gender" TEXT,
    "language" TEXT,
    "location" TEXT,
    "modified" TIMESTAMP(6),
    "modified_by" TEXT,
    "pancake_id" TEXT,
    "role_profile" TEXT,
    "time_zone" TEXT,
    "user_image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "gia"."report_no_data" (
    "id" BIGSERIAL NOT NULL,
    "report_no" VARCHAR(20) NOT NULL,
    "report_type" VARCHAR(255),
    "report_dt" VARCHAR(255),
    "shape" VARCHAR(255),
    "measurements" VARCHAR(255),
    "weight" VARCHAR(255),
    "color_grade" VARCHAR(255),
    "clarity_grade" VARCHAR(255),
    "cut_grade" VARCHAR(255),
    "depth" VARCHAR(255),
    "table_size" VARCHAR(255),
    "crown_angle" VARCHAR(255),
    "crown_height" VARCHAR(255),
    "pavilion_angle" VARCHAR(255),
    "pavilion_depth" VARCHAR(255),
    "star_length" VARCHAR(255),
    "lower_half" VARCHAR(255),
    "girdle" VARCHAR(255),
    "culet" VARCHAR(255),
    "polish" VARCHAR(255),
    "symmetry" VARCHAR(255),
    "fluorescence" VARCHAR(255),
    "clarity_characteristics" VARCHAR(255),
    "inscription" VARCHAR(255),
    "encrypted_report_no" VARCHAR(255),
    "simple_encrypted_report_no" VARCHAR(255),
    "is_pdf_available" VARCHAR(255),
    "pdf_url" VARCHAR(255),
    "propimg" VARCHAR(255),
    "digital_card" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_no_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haravan"."collection_product" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "collection_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "featured" BOOLEAN,
    "position" INTEGER,
    "product_id" BIGINT,
    "sort_value" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_product_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."custom_collections" (
    "uuid" VARCHAR NOT NULL,
    "id" INTEGER,
    "body_html" TEXT,
    "handle" VARCHAR,
    "image" JSONB,
    "published" BOOLEAN,
    "published_at" TIMESTAMP(6),
    "published_scope" VARCHAR,
    "sort_order" VARCHAR,
    "template_suffix" VARCHAR,
    "title" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "products_count" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "custom_collections_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."customers" (
    "uuid" VARCHAR NOT NULL,
    "id" INTEGER,
    "accepts_marketing" BOOLEAN,
    "default_address" JSONB,
    "addresses" JSONB,
    "address_address1" VARCHAR,
    "address_address2" VARCHAR,
    "address_city" VARCHAR,
    "address_company" VARCHAR,
    "address_country" VARCHAR,
    "address_country_code" VARCHAR,
    "address_id" BIGINT,
    "address_first_name" VARCHAR,
    "address_last_name" VARCHAR,
    "address_phone" VARCHAR,
    "address_province" VARCHAR,
    "address_province_code" VARCHAR,
    "address_zip" VARCHAR,
    "address_name" VARCHAR,
    "address_default" BOOLEAN,
    "address_district" VARCHAR,
    "address_district_code" VARCHAR,
    "address_ward" VARCHAR,
    "address_ward_code" VARCHAR,
    "email" VARCHAR,
    "phone" VARCHAR,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "multipass_identifier" BOOLEAN,
    "last_order_id" BIGINT,
    "last_order_name" VARCHAR,
    "published" BOOLEAN,
    "note" VARCHAR,
    "orders_count" INTEGER,
    "state" VARCHAR,
    "tags" VARCHAR,
    "total_spent" DECIMAL(36,8),
    "total_paid" DECIMAL(36,8),
    "verified_email" BOOLEAN,
    "group_name" VARCHAR,
    "birthday" TIMESTAMP(6),
    "gender" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."fulfillments" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
    "order_id" BIGINT,
    "status" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "tracking_company" VARCHAR,
    "tracking_company_code" VARCHAR,
    "tracking_numbers" JSONB,
    "tracking_number" VARCHAR,
    "tracking_url" VARCHAR,
    "tracking_urls" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fulfillments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."images" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "src" VARCHAR,
    "position" INTEGER,
    "filename" VARCHAR,
    "variant_ids" JSONB,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "images_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."inventory_logs" (
    "id" BIGINT NOT NULL,
    "storeid" BIGINT,
    "typeid" BIGINT,
    "locid" BIGINT,
    "refid" BIGINT,
    "reflineid" BIGINT,
    "refnumber" VARCHAR,
    "productid" BIGINT,
    "variantid" BIGINT,
    "qty_onhand" DECIMAL,
    "qty_commited" DECIMAL,
    "qty_incoming" DECIMAL,
    "last_qty_onhand" DECIMAL,
    "last_qty_onhand_loc" DECIMAL,
    "last_qty_onhand_lot" DECIMAL,
    "last_qty_commited" DECIMAL,
    "last_qty_commited_loc" DECIMAL,
    "last_macostamount" DECIMAL,
    "costamount" DECIMAL,
    "trandate" TIMESTAMP(6),
    "createddate" TIMESTAMP(6),
    "createduser" BIGINT,
    "createdusername" VARCHAR,
    "locationname" VARCHAR,
    "trannumber" VARCHAR,
    "lotno" VARCHAR,
    "lotexpiredate" TIMESTAMP(6),
    "sku" VARCHAR,
    "barcode" VARCHAR,
    "producttypename" VARCHAR,
    "productvendorname" VARCHAR,
    "productname" VARCHAR,
    "optionvalue" VARCHAR,
    "reasonid" BIGINT,
    "varianttitle" VARCHAR,
    "typename" VARCHAR,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "haravan"."line_items" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" INTEGER,
    "order_id" INTEGER,
    "fulfillable_quantity" INTEGER,
    "fulfillment_service" VARCHAR,
    "fulfillment_status" VARCHAR,
    "grams" DOUBLE PRECISION,
    "price" DECIMAL(36,8),
    "price_original" DECIMAL(36,8),
    "price_promotion" DECIMAL(36,8),
    "product_id" BIGINT,
    "quantity" INTEGER,
    "requires_shipping" BOOLEAN,
    "sku" VARCHAR,
    "title" VARCHAR,
    "variant_id" BIGINT,
    "variant_title" VARCHAR,
    "vendor" VARCHAR,
    "type" VARCHAR,
    "name" VARCHAR,
    "gift_card" BOOLEAN,
    "taxable" BOOLEAN,
    "tax_lines" JSONB,
    "product_exists" BOOLEAN,
    "barcode" VARCHAR,
    "properties" JSONB,
    "total_discount" DECIMAL(36,8),
    "applied_discounts" JSONB,
    "image" JSONB,
    "not_allow_promotion" BOOLEAN,
    "ma_cost_amount" DOUBLE PRECISION,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."orders" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" INTEGER,
    "billing_address_id" BIGINT,
    "billing_address_address1" VARCHAR,
    "billing_address_address2" VARCHAR,
    "billing_address_city" VARCHAR,
    "billing_address_company" VARCHAR,
    "billing_address_country" VARCHAR,
    "billing_address_first_name" VARCHAR,
    "billing_address_last_name" VARCHAR,
    "billing_address_phone" VARCHAR,
    "billing_address_province" VARCHAR,
    "billing_address_zip" VARCHAR,
    "billing_address_name" VARCHAR,
    "billing_address_province_code" VARCHAR,
    "billing_address_country_code" VARCHAR,
    "billing_address_default" BOOLEAN,
    "billing_address_district" VARCHAR,
    "billing_address_district_code" VARCHAR,
    "billing_address_ward" VARCHAR,
    "billing_address_ward_code" VARCHAR,
    "browser_ip" VARCHAR,
    "buyer_accepts_marketing" BOOLEAN,
    "cancel_reason" VARCHAR,
    "cancelled_at" TIMESTAMP(6),
    "cart_token" VARCHAR,
    "checkout_token" VARCHAR,
    "client_details_accept_language" VARCHAR,
    "client_details_browser_height" BIGINT,
    "client_details_browser_width" BIGINT,
    "client_details_session_hash" VARCHAR,
    "client_details_user_agent" VARCHAR,
    "client_details_browser_ip" VARCHAR,
    "closed_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),
    "currency" VARCHAR,
    "customer_id" BIGINT,
    "customer_email" VARCHAR,
    "customer_phone" VARCHAR,
    "customer_first_name" VARCHAR,
    "customer_last_name" VARCHAR,
    "customer_multipass_identifier" VARCHAR,
    "customer_last_order_id" BIGINT,
    "customer_last_order_name" VARCHAR,
    "customer_note" TEXT,
    "customer_order_count" INTEGER,
    "customer_state" VARCHAR,
    "customer_tags" VARCHAR,
    "customer_total_spent" DECIMAL(36,8),
    "customer_updated_at" TIMESTAMP(6),
    "customer_verified_email" BOOLEAN,
    "customer_send_email_invite" BOOLEAN,
    "customer_send_email_welcome" BOOLEAN,
    "customer_password" VARCHAR,
    "customer_password_confirmation" VARCHAR,
    "customer_group_name" VARCHAR,
    "customer_birthday" VARCHAR,
    "customer_gender" VARCHAR,
    "customer_last_order_date" TIMESTAMP(6),
    "customer_default_address_id" BIGINT,
    "customer_default_address_address1" VARCHAR,
    "customer_default_address_address2" VARCHAR,
    "customer_default_address_city" VARCHAR,
    "customer_default_address_company" VARCHAR,
    "customer_default_address_country" VARCHAR,
    "customer_default_address_province" VARCHAR,
    "customer_default_address_first_name" VARCHAR,
    "customer_default_address_last_name" VARCHAR,
    "customer_default_address_phone" VARCHAR,
    "customer_default_address_province_code" VARCHAR,
    "customer_default_address_country_code" VARCHAR,
    "customer_default_address_default" BOOLEAN,
    "customer_default_address_district" VARCHAR,
    "customer_default_address_district_code" VARCHAR,
    "customer_default_address_ward" VARCHAR,
    "customer_default_address_ward_code" VARCHAR,
    "discount_codes" JSONB,
    "email" VARCHAR,
    "financial_status" VARCHAR,
    "fulfillment_status" VARCHAR,
    "tags" VARCHAR,
    "gateway" VARCHAR,
    "gateway_code" VARCHAR,
    "landing_site" VARCHAR,
    "landing_site_ref" VARCHAR,
    "source" VARCHAR,
    "name" VARCHAR,
    "note" TEXT,
    "number" INTEGER,
    "order_number" VARCHAR,
    "processing_method" VARCHAR,
    "shipping_address_address1" VARCHAR,
    "shipping_address_address2" VARCHAR,
    "shipping_address_city" VARCHAR,
    "shipping_address_company" VARCHAR,
    "shipping_address_country" VARCHAR,
    "shipping_address_first_name" VARCHAR,
    "shipping_address_last_name" VARCHAR,
    "shipping_address_latitude" DOUBLE PRECISION,
    "shipping_address_longitude" DOUBLE PRECISION,
    "shipping_address_phone" VARCHAR,
    "shipping_address_province" VARCHAR,
    "shipping_address_zip" VARCHAR,
    "shipping_address_name" VARCHAR,
    "shipping_address_province_code" VARCHAR,
    "shipping_address_country_code" VARCHAR,
    "shipping_address_district_code" VARCHAR,
    "shipping_address_district" VARCHAR,
    "shipping_address_ward_code" VARCHAR,
    "shipping_address_ward" VARCHAR,
    "shipping_lines" JSONB,
    "source_name" VARCHAR,
    "subtotal_price" DECIMAL(36,8),
    "tax_lines" VARCHAR,
    "taxes_included" BOOLEAN,
    "token" VARCHAR,
    "total_discounts" DECIMAL(36,8),
    "total_line_items_price" DECIMAL(36,8),
    "total_price" DECIMAL(36,8),
    "total_tax" DECIMAL(36,8),
    "total_weight" DOUBLE PRECISION,
    "updated_at" TIMESTAMP(6),
    "note_attributes" JSONB,
    "confirmed_at" TIMESTAMP(6),
    "closed_status" VARCHAR,
    "cancelled_status" VARCHAR,
    "confirmed_status" VARCHAR,
    "assigned_location_id" BIGINT,
    "assigned_location_name" VARCHAR,
    "assigned_location_at" TIMESTAMP(6),
    "exported_confirm_at" TIMESTAMP(6),
    "user_id" BIGINT,
    "device_id" BIGINT,
    "location_id" BIGINT,
    "location_name" VARCHAR,
    "ref_order_id" BIGINT,
    "ref_order_date" TIMESTAMP(6),
    "ref_order_number" VARCHAR,
    "utm_source" VARCHAR,
    "utm_medium" VARCHAR,
    "utm_campaign" VARCHAR,
    "utm_term" VARCHAR,
    "utm_content" VARCHAR,
    "payment_url" VARCHAR,
    "contact_email" VARCHAR,
    "order_processing_status" VARCHAR,
    "prev_order_id" BIGINT,
    "prev_order_number" VARCHAR,
    "prev_order_date" TIMESTAMP(6),
    "redeem_model" VARCHAR,
    "confirm_user" BIGINT,
    "risk_level" VARCHAR,
    "discount_applications" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."products" (
    "uuid" VARCHAR NOT NULL,
    "id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "published_at" TIMESTAMP(6),
    "published_scope" VARCHAR,
    "handle" VARCHAR,
    "product_type" VARCHAR,
    "images" JSONB,
    "tags" VARCHAR,
    "template_suffix" VARCHAR,
    "title" VARCHAR,
    "variants" JSONB,
    "only_hide_from_list" BOOLEAN,
    "not_allow_promotion" BOOLEAN,
    "options" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."purchase_receives" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "receive_number" VARCHAR,
    "supplier" JSONB,
    "supplier_id" BIGINT,
    "supplier_name" VARCHAR,
    "location" JSONB,
    "location_id" BIGINT,
    "location_name" VARCHAR,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "received_at" TIMESTAMP(6),
    "notes" TEXT,
    "status" VARCHAR,
    "total" DECIMAL(36,8),
    "total_cost" DECIMAL(36,8),
    "tags" VARCHAR,
    "ref_purchase_order_id" VARCHAR,
    "ref_number" VARCHAR,
    "line_items" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_receives_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."purchase_receives_items" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "purchase_receive_id" BIGINT,
    "purchase_receive_number" VARCHAR,
    "product_id" BIGINT,
    "product_name" VARCHAR,
    "product_variant_id" BIGINT,
    "variant_title" VARCHAR,
    "sku" VARCHAR,
    "barcode" VARCHAR,
    "original_cost" DECIMAL(36,8),
    "discount_amount" DECIMAL(36,8),
    "cost" DECIMAL(36,8),
    "product_quantity" INTEGER,
    "total_cost" DECIMAL(36,8),
    "variant_unit" JSONB,
    "lots" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_receives_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."refunds" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
    "order_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "note" VARCHAR,
    "refund_line_items" JSONB,
    "restock" BOOLEAN,
    "user_id" BIGINT,
    "location_id" BIGINT,
    "transactions" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."transactions" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" BIGINT,
    "order_id" BIGINT,
    "amount" DECIMAL(36,8),
    "authorization" VARCHAR(50),
    "created_at" TIMESTAMP(6),
    "device_id" BIGINT,
    "gateway" VARCHAR(100),
    "kind" VARCHAR(10),
    "receipt" VARCHAR(255),
    "status" VARCHAR(10),
    "test" BOOLEAN,
    "user_id" BIGINT,
    "location_id" BIGINT,
    "currency" VARCHAR,
    "is_cod_gateway" BOOLEAN,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."users" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "email" VARCHAR,
    "first_name" VARCHAR,
    "last_name" VARCHAR,
    "phone" VARCHAR,
    "account_owner" BOOLEAN,
    "bio" TEXT,
    "im" TEXT,
    "receive_announcements" INTEGER,
    "url" TEXT,
    "user_type" VARCHAR,
    "permissions" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."variants" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "product_id" BIGINT,
    "published_scope" VARCHAR,
    "handle" VARCHAR,
    "product_type" VARCHAR,
    "template_suffix" VARCHAR,
    "product_title" VARCHAR,
    "product_vendor" VARCHAR,
    "barcode" VARCHAR,
    "compare_at_price" DECIMAL(36,8),
    "created_at" TIMESTAMP(6),
    "fulfillment_service" VARCHAR,
    "grams" INTEGER,
    "inventory_management" VARCHAR,
    "inventory_policy" VARCHAR,
    "inventory_quantity" INTEGER,
    "position" INTEGER,
    "price" DECIMAL(36,8),
    "requires_shipping" BOOLEAN,
    "sku" VARCHAR,
    "taxable" BOOLEAN,
    "title" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "image_id" BIGINT,
    "option1" VARCHAR,
    "option2" VARCHAR,
    "option3" VARCHAR,
    "qty_onhand" INTEGER,
    "qty_commited" INTEGER,
    "qty_available" INTEGER,
    "qty_incoming" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."warehouse_inventories" (
    "uuid" VARCHAR NOT NULL,
    "id" BIGINT,
    "loc_id" BIGINT,
    "product_id" BIGINT,
    "variant_id" BIGINT,
    "qty_onhand" BIGINT,
    "qty_committed" BIGINT,
    "qty_available" BIGINT,
    "qty_incoming" BIGINT,
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "haravan"."warehouses" (
    "id" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_check_sheets" (
    "id" UUID NOT NULL,
    "staff" DECIMAL,
    "count_in_book" DECIMAL,
    "count_for_real" DECIMAL,
    "extra" DECIMAL,
    "lines" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "warehouse" VARCHAR(255),
    "warehouse_id" DECIMAL,
    "code" VARCHAR(255),

    CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_check_sheets_2024" (
    "id" UUID,
    "staff" DECIMAL,
    "count_in_book" DECIMAL,
    "count_for_real" DECIMAL,
    "extra" DECIMAL,
    "lines" JSONB,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "warehouse" VARCHAR(255),
    "warehouse_id" DECIMAL,
    "code" VARCHAR(255)
);

-- CreateTable
CREATE TABLE "inventory"."rfid_tags_warehouse" (
    "id" UUID NOT NULL,
    "rfid_tag" VARCHAR,
    "warehouse" VARCHAR,
    "warehouse_id" DECIMAL,
    "product_id" DECIMAL,
    "varient_id" DECIMAL,
    "count_in_book" DECIMAL,
    "count_for_real" DECIMAL,
    "count_extra_for_real" DECIMAL,
    "varient_name" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfid_tags_warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_cms"."inventory_check_lines" (
    "uuid" UUID NOT NULL,
    "id" INTEGER NOT NULL,
    "status" TEXT,
    "sort" TEXT,
    "user_created" TEXT,
    "date_created" TIMESTAMP(3),
    "user_updated" TEXT,
    "date_updated" TIMESTAMP(3),
    "product_name" TEXT,
    "product_id" TEXT,
    "variant_id" INTEGER,
    "count_in_book" INTEGER,
    "count_for_real" INTEGER,
    "checked_status" TEXT,
    "sheet_id" INTEGER,
    "variant_name" TEXT,
    "product_image" TEXT,
    "sku" TEXT,
    "count_extra_for_real" INTEGER,
    "barcode" TEXT,
    "category" TEXT,
    "count_in_ordered" TEXT,
    "rfid_tags" JSONB,

    CONSTRAINT "inventory_check_lines_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "inventory_cms"."inventory_check_sheets" (
    "uuid" UUID NOT NULL,
    "id" INTEGER NOT NULL,
    "status" TEXT,
    "sort" TEXT,
    "user_created" TEXT,
    "date_created" TIMESTAMP(3),
    "user_updated" TEXT,
    "date_updated" TIMESTAMP(3),
    "warehouse" TEXT,
    "staff" INTEGER,
    "result" TEXT,
    "code" TEXT,
    "warehouse_id" TEXT,
    "count_in_book" INTEGER,
    "count_for_real" INTEGER,
    "extra" INTEGER,
    "lines" JSONB,

    CONSTRAINT "inventory_check_sheets_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "jemmia"."metadata" (
    "product_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "path_to_3dm" TEXT,
    "collection_drive" TEXT,

    CONSTRAINT "metadata_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "larksuite"."buyback_exchange_approval_instances" (
    "id" SERIAL NOT NULL,
    "instance_code" VARCHAR,
    "serial_number" VARCHAR,
    "instance_type" VARCHAR,
    "order_code" VARCHAR,
    "new_order_code" VARCHAR,
    "status" VARCHAR,
    "customer_name" VARCHAR,
    "phone_number" VARCHAR,
    "national_id" VARCHAR,
    "products_info" JSONB,
    "reason" VARCHAR,
    "refund_amount" DECIMAL,
    "is_synced_to_crm" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "submitted_date" TIMESTAMP(6),

    CONSTRAINT "buyback_exchange_approval_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "larksuite"."crm_lark_message" (
    "id" UUID NOT NULL,
    "parent_id" UUID,
    "crm_id" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lark_message_id" VARCHAR,
    "order_data_item" JSON,
    "order_id" BIGINT,
    "order_name" VARCHAR,

    CONSTRAINT "crm_lark_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "larksuite"."cskh" (
    "instance_code" TEXT,
    "instance_type" TEXT,
    "order_code" TEXT,
    "new_order_code" TEXT,
    "status" TEXT,
    "customer_name" TEXT,
    "phone_number" TEXT,
    "products_info" TEXT,
    "reason" TEXT,
    "refund_amount" DOUBLE PRECISION,
    "submitted_date" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE "larksuite"."customer_appointments" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "lead_sale_name" VARCHAR,
    "lead_sale_email" VARCHAR,
    "suport_sale_name_list" TEXT,
    "suport_sale_email_list" TEXT,
    "store_name" VARCHAR,
    "customer_name" VARCHAR,
    "customer_phone" VARCHAR,
    "customer_gender" VARCHAR,
    "channel" VARCHAR,
    "order_status" VARCHAR,
    "expected_visit_date" TIMESTAMP(6),
    "expected_visit_time_utc_plus_7" TIMESTAMP(6),
    "store_welcome_content" TEXT,
    "exchange_policy" TEXT,
    "note" TEXT,
    "budget_range" VARCHAR,
    "budget" DECIMAL(36,8),
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_appointments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "larksuite"."departments" (
    "department_id" TEXT NOT NULL,
    "open_department_id" TEXT,
    "name" TEXT,
    "parent_department_id" TEXT,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "larksuite"."groups" (
    "group_id" TEXT NOT NULL,
    "group_name" TEXT,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "larksuite"."instances" (
    "uuid" TEXT NOT NULL,
    "serial_number" TEXT,
    "instance_code" TEXT,
    "approval_code" TEXT,
    "approval_name" TEXT,
    "status" TEXT,
    "department_id" TEXT,
    "start_time" TIMESTAMP(6),
    "end_time" TIMESTAMP(6),
    "user_id" TEXT,
    "form" JSONB,
    "form_data" JSONB,

    CONSTRAINT "instances_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_line_items_payment" (
    "lark_record_id" VARCHAR(255) NOT NULL,
    "order_id" VARCHAR(50) NOT NULL,
    "variant_id" VARCHAR NOT NULL,

    CONSTRAINT "lark_line_items_payment_pkey" PRIMARY KEY ("order_id","variant_id")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_order_qr_generator" (
    "haravan_order_id" BIGINT NOT NULL,
    "lark_record_id" VARCHAR(255) NOT NULL,

    CONSTRAINT "lark_order_qr_generator_pkey" PRIMARY KEY ("haravan_order_id")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_variants" (
    "variant_id" BIGINT NOT NULL,
    "lark_record_id" VARCHAR(255),

    CONSTRAINT "lark_variants_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "larksuite"."lark_warehouse_inventories" (
    "id" SERIAL NOT NULL,
    "lark_record_id" VARCHAR,
    "qty_onhand" BIGINT,
    "qty_committed" BIGINT,
    "qty_available" BIGINT,
    "qty_incoming" BIGINT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_inventories_lark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "larksuite"."promotion_approval" (
    "id" SERIAL NOT NULL,
    "order_code" VARCHAR,
    "reason" VARCHAR,
    "customer_name" VARCHAR,
    "phone_number" VARCHAR,
    "order_amount" DECIMAL,
    "order_request_discount" DECIMAL,
    "is_synced_to_crm" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "submitted_date" TIMESTAMP(6),
    "instance_code" VARCHAR,
    "serial_number" VARCHAR,

    CONSTRAINT "promotion_approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "larksuite"."records" (
    "uuid" UUID NOT NULL,
    "record_id" TEXT NOT NULL,
    "table_id" TEXT,
    "app_token" TEXT,
    "fields" JSONB NOT NULL,
    "database_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "larksuite"."shifts" (
    "shift_id" TEXT NOT NULL,
    "shift_name" TEXT,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("shift_id")
);

-- CreateTable
CREATE TABLE "larksuite"."user_daily_shifts" (
    "day_no" INTEGER NOT NULL,
    "group_id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "shift_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_daily_shifts_pkey" PRIMARY KEY ("day_no","group_id","month","user_id")
);

-- CreateTable
CREATE TABLE "larksuite"."users" (
    "user_id" TEXT NOT NULL,
    "open_id" TEXT,
    "union_id" TEXT,
    "name" TEXT,
    "en_name" TEXT,
    "email" TEXT,
    "enterprise_email" TEXT,
    "gender" INTEGER,
    "city" TEXT,
    "country" TEXT,
    "department_ids" TEXT[],
    "description" TEXT,
    "employee_no" TEXT,
    "employee_type" INTEGER,
    "is_tenant_manager" BOOLEAN,
    "job_title" TEXT,
    "join_time" BIGINT,
    "leader_user_id" TEXT,
    "work_station" TEXT,
    "status_is_activated" BOOLEAN,
    "status_is_exited" BOOLEAN,
    "status_is_frozen" BOOLEAN,
    "status_is_resigned" BOOLEAN,
    "status_is_unjoin" BOOLEAN,
    "avatar" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "market_data"."exchange_rate" (
    "time" TIMESTAMP(6) NOT NULL,
    "code" VARCHAR,
    "bank" VARCHAR,
    "buy" DECIMAL,
    "sell" DECIMAL,
    "transfer" DECIMAL,
    "created_at" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE "market_data"."gold_pricing" (
    "time" TIMESTAMP(6) NOT NULL,
    "type" VARCHAR,
    "buy" DECIMAL,
    "sell" DECIMAL,
    "created_at" TIMESTAMPTZ(6)
);

-- CreateTable
CREATE TABLE "misa"."inventory_items" (
    "uuid" VARCHAR NOT NULL,
    "sku" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."items" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "dictionary_type" INTEGER,
    "inventory_item_name" VARCHAR,
    "inventory_item_code" VARCHAR,
    "inventory_item_type" INTEGER,
    "minimum_stock" DOUBLE PRECISION,
    "inventory_item_category_code_list" VARCHAR,
    "inventory_item_category_name_list" VARCHAR,
    "inventory_item_category_id_list" VARCHAR,
    "inventory_item_category_misa_code_list" VARCHAR,
    "branch_id" VARCHAR,
    "discount_type" INTEGER,
    "inventory_item_cost_method" INTEGER,
    "unit_id" VARCHAR,
    "is_unit_price_after_tax" BOOLEAN,
    "is_system" BOOLEAN,
    "inactive" BOOLEAN,
    "is_follow_serial_number" BOOLEAN,
    "is_allow_duplicate_serial_number" BOOLEAN,
    "purchase_discount_rate" DOUBLE PRECISION,
    "unit_price" DECIMAL(36,8),
    "sale_price1" DECIMAL(36,8),
    "sale_price2" DECIMAL(36,8),
    "sale_price3" DECIMAL(36,8),
    "fixed_sale_price" DECIMAL(36,8),
    "import_tax_rate" DOUBLE PRECISION,
    "export_tax_rate" DOUBLE PRECISION,
    "fixed_unit_price" DECIMAL(36,8),
    "description" TEXT,
    "inventory_account" VARCHAR,
    "cogs_account" VARCHAR,
    "sale_account" VARCHAR,
    "unit_list" JSONB,
    "unit_name" VARCHAR,
    "reftype" INTEGER,
    "reftype_category" INTEGER,
    "quantityBarCode" INTEGER,
    "allocation_type" INTEGER,
    "allocation_time" INTEGER,
    "tax_reduction_type" INTEGER,
    "purchase_last_unit_price" DECIMAL(36,8),
    "is_specific_inventory_item" BOOLEAN,
    "has_delete_fixed_unit_price" BOOLEAN,
    "has_delete_unit_price" BOOLEAN,
    "has_delete_discount" BOOLEAN,
    "has_delete_unit_convert" BOOLEAN,
    "has_delete_norm" BOOLEAN,
    "has_delete_serial_type" BOOLEAN,
    "is_edit_multiple" BOOLEAN,
    "is_not_sync_crm" BOOLEAN,
    "isUpdateRebundant" BOOLEAN,
    "is_special_inv" BOOLEAN,
    "isCustomPrimaryKey" BOOLEAN,
    "isFromProcessBalance" BOOLEAN,
    "is_drug" BOOLEAN,
    "status_sync_medicine_national" INTEGER,
    "is_sync_corp" BOOLEAN,
    "convert_rate" DOUBLE PRECISION,
    "is_update_main_unit" BOOLEAN,
    "is_image_duplicate" BOOLEAN,
    "is_group" BOOLEAN,
    "discount_value" DECIMAL(36,8),
    "is_set_discount" BOOLEAN,
    "index_unit_convert" INTEGER,
    "excel_row_index" INTEGER,
    "is_valid" BOOLEAN,
    "created_date" TIMESTAMP(6),
    "created_by" VARCHAR,
    "modified_date" TIMESTAMP(6),
    "modified_by" VARCHAR,
    "auto_refno" BOOLEAN,
    "force_update" BOOLEAN,
    "state" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "items_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."purchase_voucher_details" (
    "uuid" VARCHAR(36) NOT NULL,
    "ref_detail_id" VARCHAR(36) NOT NULL,
    "refid" VARCHAR(36),
    "inventory_item_id" VARCHAR(36),
    "inventory_item_name" VARCHAR,
    "stock_id" VARCHAR(36),
    "unit_id" VARCHAR(36),
    "pu_invoice_refid" VARCHAR(36),
    "main_unit_id" VARCHAR(36),
    "purchase_purpose_id" VARCHAR(36),
    "organization_unit_id" VARCHAR(36),
    "sort_order" INTEGER,
    "inventory_resale_type_id" INTEGER,
    "inv_date" TIMESTAMP(6),
    "date_enough_tax_payment" TIMESTAMP(6),
    "un_resonable_cost" BOOLEAN,
    "quantity" DOUBLE PRECISION,
    "unit_price" DECIMAL(36,8),
    "amount_oc" DECIMAL(36,8),
    "amount" DECIMAL(36,8),
    "discount_rate" DOUBLE PRECISION,
    "discount_amount_oc" DECIMAL(36,8),
    "import_charge_before_custom_amount_oc" DECIMAL(36,8),
    "import_charge_before_custom_amount" DECIMAL(36,8),
    "import_charge_before_custom_amount_main_currency" DECIMAL(36,8),
    "allocation_rate_import_origin_currency" DOUBLE PRECISION,
    "import_charge_before_custom_amount_allocated" DECIMAL(36,8),
    "cash_out_exchange_rate_management" DOUBLE PRECISION,
    "allocation_rate" DOUBLE PRECISION,
    "allocation_rate_import" DOUBLE PRECISION,
    "unit_price_after_tax" DECIMAL(36,8),
    "import_charge_exchange_rate" DECIMAL(36,8),
    "cash_out_diff_vat_amount_finance" DECIMAL(36,8),
    "cash_out_amount_management" DECIMAL(36,8),
    "cash_out_diff_amount_management" DECIMAL(36,8),
    "cash_out_vat_amount_management" DECIMAL(36,8),
    "cash_out_diff_vat_amount_management" DECIMAL(36,8),
    "cash_out_exchange_rate_finance" DOUBLE PRECISION,
    "special_consume_tax_amount" DECIMAL(36,8),
    "environmental_tax_amount" DECIMAL(36,8),
    "environmental_tax_amount_oc" DECIMAL(36,8),
    "cash_out_amount_finance" DECIMAL(36,8),
    "cash_out_diff_amount_finance" DECIMAL(36,8),
    "cash_out_vat_amount_finance" DECIMAL(36,8),
    "import_tax_rate_price" DECIMAL(36,8),
    "import_tax_rate" DOUBLE PRECISION,
    "import_tax_amount_oc" DECIMAL(36,8),
    "import_tax_amount" DECIMAL(36,8),
    "anti_dumping_tax_rate" DOUBLE PRECISION,
    "anti_dumping_tax_amount" DECIMAL(36,8),
    "anti_dumping_tax_amount_oc" DECIMAL(36,8),
    "anti_dumping_tax_account" VARCHAR,
    "special_consume_tax_rate" DOUBLE PRECISION,
    "special_consume_tax_amount_oc" DECIMAL(36,8),
    "vat_rate" DOUBLE PRECISION,
    "vat_amount_oc" DECIMAL(36,8),
    "vat_amount" DECIMAL(36,8),
    "fob_amount_oc" DECIMAL(36,8),
    "fob_amount" DECIMAL(36,8),
    "import_charge_amount" DECIMAL(36,8),
    "discount_amount" DECIMAL(36,8),
    "freight_amount" DECIMAL(36,8),
    "inward_amount" DECIMAL(36,8),
    "main_convert_rate" DOUBLE PRECISION,
    "main_quantity" DOUBLE PRECISION,
    "main_unit_price" DECIMAL(36,8),
    "description" TEXT,
    "debit_account" VARCHAR,
    "credit_account" VARCHAR,
    "exchange_rate_operator" VARCHAR,
    "vat_account" VARCHAR,
    "inv_no" VARCHAR,
    "import_tax_account" VARCHAR,
    "special_consume_tax_account" VARCHAR,
    "environmental_tax_account" VARCHAR,
    "vat_description" TEXT,
    "stock_code" VARCHAR,
    "inventory_item_code" VARCHAR,
    "main_unit_name" VARCHAR,
    "organization_unit_code" VARCHAR,
    "organization_unit_name" VARCHAR,
    "unit_name" VARCHAR,
    "edit_version" BIGINT,
    "purchase_purpose_code" VARCHAR,
    "inventory_item_type" INTEGER,
    "purchase_purpose_name" TEXT,
    "pu_order_refno" VARCHAR,
    "pu_order_code" VARCHAR,
    "is_follow_serial_number" BOOLEAN,
    "is_allow_duplicate_serial_number" BOOLEAN,
    "is_description" BOOLEAN,
    "panel_height_quantity" DOUBLE PRECISION,
    "panel_length_quantity" DOUBLE PRECISION,
    "panel_quantity" DOUBLE PRECISION,
    "panel_radius_quantity" DOUBLE PRECISION,
    "panel_width_quantity" DOUBLE PRECISION,
    "inventory_item_cogs_account" VARCHAR,
    "inventory_account" VARCHAR,
    "unit_list" TEXT,
    "import_tax_rate_price_origin" DECIMAL(36,8),
    "quantity_product_produce" DOUBLE PRECISION,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_voucher_details_pkey" PRIMARY KEY ("uuid","ref_detail_id")
);

-- CreateTable
CREATE TABLE "misa"."purchase_vouchers" (
    "uuid" VARCHAR(36) NOT NULL,
    "refid" VARCHAR(50),
    "branch_id" VARCHAR(36),
    "account_object_id" VARCHAR(36),
    "reftype" INTEGER,
    "display_on_book" INTEGER,
    "refdate" TIMESTAMP(6),
    "posted_date" TIMESTAMP(6),
    "caba_refdate" TIMESTAMP(6),
    "caba_posted_date" TIMESTAMP(6),
    "created_date" TIMESTAMP(6),
    "modified_date" TIMESTAMP(6),
    "is_posted_finance" BOOLEAN,
    "is_posted_management" BOOLEAN,
    "is_posted_cash_book_finance" BOOLEAN,
    "is_posted_cash_book_management" BOOLEAN,
    "is_posted_inventory_book_finance" BOOLEAN,
    "is_posted_inventory_book_management" BOOLEAN,
    "total_amount_oc" DECIMAL(36,8),
    "total_amount" DECIMAL(36,8),
    "total_import_tax_amount_oc" DECIMAL(36,8),
    "total_import_tax_amount" DECIMAL(36,8),
    "total_vat_amount_oc" DECIMAL(36,8),
    "total_special_consume_tax_amount" DECIMAL(36,8),
    "total_custom_before_amount" DECIMAL(36,8),
    "caba_amount_oc" DECIMAL(36,8),
    "caba_amount" DECIMAL(36,8),
    "total_vat_amount" DECIMAL(36,8),
    "total_discount_amount_oc" DECIMAL(36,8),
    "total_discount_amount" DECIMAL(36,8),
    "total_freight_amount" DECIMAL(36,8),
    "total_inward_amount" DECIMAL(36,8),
    "total_special_consume_tax_amount_oc" DECIMAL(36,8),
    "total_payment_amount" DECIMAL(36,8),
    "total_payment_amount_oc" DECIMAL(36,8),
    "total_environmental_tax_amount" DECIMAL(36,8),
    "refno_finance" VARCHAR,
    "account_object_name" VARCHAR,
    "account_object_address" VARCHAR,
    "created_by" VARCHAR,
    "modified_by" VARCHAR,
    "journal_memo" TEXT,
    "account_object_code" VARCHAR,
    "paid_status" INTEGER,
    "include_invoice" INTEGER,
    "branch_name" VARCHAR,
    "edit_version" BIGINT,
    "currency_id" VARCHAR,
    "exchange_rate" DOUBLE PRECISION,
    "account_object_tax_code" VARCHAR,
    "is_freight_service" BOOLEAN,
    "employee_id" VARCHAR(36),
    "in_outward_refno" VARCHAR,
    "status_sync_medicine_national" INTEGER,
    "discount_type" INTEGER,
    "employee_name" VARCHAR,
    "employee_code" VARCHAR,
    "total_anti_dumping_tax_amount" DECIMAL(36,8),
    "total_anti_dumping_tax_amount_oc" DECIMAL(36,8),
    "wesign_document_text" TEXT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_vouchers_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."users" (
    "uuid" UUID NOT NULL,
    "employee_code" VARCHAR(255),
    "haravan_id" BIGINT NOT NULL,
    "email" VARCHAR(255),
    "database_created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "misa"."warehouse_inventories" (
    "uuid" VARCHAR(36) NOT NULL,
    "inventory_item_id" VARCHAR(36) NOT NULL,
    "inventory_item_code" VARCHAR(50),
    "inventory_item_name" VARCHAR(255),
    "stock_id" VARCHAR(36) NOT NULL,
    "stock_code" VARCHAR(50),
    "stock_name" VARCHAR(255),
    "organization_unit_id" VARCHAR(36),
    "organization_unit_code" VARCHAR(50),
    "organization_unit_name" VARCHAR(255),
    "quantity_balance" DOUBLE PRECISION,
    "amount_balance" DECIMAL(36,2),
    "unit_price" DECIMAL(36,2),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouse_inventories_pkey" PRIMARY KEY ("inventory_item_id","stock_id")
);

-- CreateTable
CREATE TABLE "pancake"."conversation" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "customer_id" VARCHAR,
    "type" VARCHAR,
    "inserted_at" TIMESTAMP(6),
    "page_id" VARCHAR,
    "has_phone" BOOLEAN,
    "post_id" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "assignee_histories" JSONB,
    "added_users" JSONB,
    "added_user_id" VARCHAR,
    "added_user_name" VARCHAR,
    "added_user_email" VARCHAR,
    "added_user_fb_id" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "last_sent_at" TIMESTAMP(6),
    "avatar_url" VARCHAR,
    "ad_ids" JSONB,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pancake"."conversation_page_customer" (
    "uuid" VARCHAR,
    "customer_id" VARCHAR NOT NULL,
    "conversation_id" VARCHAR NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_page_customer_pkey" PRIMARY KEY ("customer_id","conversation_id")
);

-- CreateTable
CREATE TABLE "pancake"."conversation_tag" (
    "uuid" VARCHAR,
    "conversation_id" VARCHAR NOT NULL,
    "page_id" VARCHAR,
    "customer_id" VARCHAR,
    "inserted_at" TIMESTAMP(6) NOT NULL,
    "post_id" VARCHAR,
    "has_phone" BOOLEAN,
    "tag_page_id" INTEGER NOT NULL,
    "tag_label" VARCHAR,
    "tag_description" VARCHAR,
    "action" VARCHAR NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_tag_pkey" PRIMARY KEY ("conversation_id","inserted_at","tag_page_id","action")
);

-- CreateTable
CREATE TABLE "pancake"."frappe_lead_conversation" (
    "conversation_id" VARCHAR NOT NULL,
    "frappe_name_id" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "frappe_lead_conversation_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "pancake"."frappe_lead_conversation_stag" (
    "conversation_id" VARCHAR NOT NULL,
    "frappe_name_id" VARCHAR,
    "updated_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6),

    CONSTRAINT "frappe_lead_conversation_stag_pkey" PRIMARY KEY ("conversation_id")
);

-- CreateTable
CREATE TABLE "pancake"."messages" (
    "id" VARCHAR NOT NULL,
    "message" VARCHAR,
    "type" VARCHAR,
    "seen" BOOLEAN,
    "show_info" BOOLEAN,
    "from_id" VARCHAR,
    "from_name" VARCHAR,
    "attachments" JSON,
    "inserted_at" TIMESTAMP(6),
    "page_id" VARCHAR,
    "conversation_id" VARCHAR,
    "has_phone" BOOLEAN,
    "is_removed" BOOLEAN,
    "can_hide" BOOLEAN,
    "comment_count" INTEGER,
    "like_count" INTEGER,
    "parent_id" VARCHAR,
    "is_hidden" BOOLEAN,
    "rich_message" VARCHAR,
    "edit_history" VARCHAR,
    "message_tags" JSON,
    "is_parent_hidden" BOOLEAN,
    "can_comment" BOOLEAN,
    "can_like" BOOLEAN,
    "can_remove" BOOLEAN,
    "can_reply_privately" BOOLEAN,
    "is_livestream_order" BOOLEAN,
    "is_parent" BOOLEAN,
    "phone_info" JSON,
    "original_message" VARCHAR,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pancake"."page" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "inserted_at" TIMESTAMP(6),
    "connected" BOOLEAN,
    "is_activated" BOOLEAN,
    "name" VARCHAR,
    "platform" VARCHAR,
    "timezone" VARCHAR,
    "settings" JSONB,
    "platform_extra_info" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "page_access_token" VARCHAR(255),

    CONSTRAINT "page_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pancake"."page_customer" (
    "uuid" VARCHAR NOT NULL,
    "id" VARCHAR,
    "birthday" VARCHAR,
    "can_inbox" BOOLEAN,
    "customer_id" VARCHAR,
    "gender" VARCHAR,
    "inserted_at" TIMESTAMP(6),
    "lives_in" VARCHAR,
    "name" VARCHAR,
    "page_id" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "phone_numbers" JSONB,
    "notes" JSONB,
    "phone" VARCHAR(255),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "page_customer_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "pancake"."pancake_user" (
    "id" VARCHAR NOT NULL,
    "name" VARCHAR,
    "status" VARCHAR,
    "fb_id" VARCHAR,
    "page_permissions" JSONB,
    "status_round_robin" VARCHAR,
    "status_in_page" VARCHAR,
    "is_online" BOOLEAN,
    "database_updated_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6),

    CONSTRAINT "pancake_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pancake"."tag_page" (
    "page_id" VARCHAR NOT NULL,
    "id" INTEGER NOT NULL,
    "tag_label" VARCHAR,
    "description" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_page_pkey" PRIMARY KEY ("page_id","id")
);

-- CreateTable
CREATE TABLE "pancake"."users" (
    "id" TEXT NOT NULL,
    "enterprise_email" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment"."manual_payments" (
    "uuid" UUID NOT NULL,
    "payment_type" VARCHAR(255),
    "branch" VARCHAR(255),
    "shipping_code" VARCHAR(255),
    "send_date" TIMESTAMP(6),
    "receive_date" TIMESTAMP(6),
    "created_date" TIMESTAMP(6),
    "updated_date" TIMESTAMP(6),
    "bank_account" VARCHAR(255),
    "bank_name" VARCHAR(255),
    "transfer_amount" DECIMAL(18,6),
    "transfer_note" TEXT,
    "haravan_order_id" INTEGER,
    "haravan_order_name" VARCHAR(255),
    "transfer_status" VARCHAR(255),
    "lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,
    "misa_synced_at" TIMESTAMP(6),

    CONSTRAINT "manual_payments_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "payment"."sepay_transaction" (
    "id" VARCHAR(50) NOT NULL,
    "bank_brand_name" VARCHAR,
    "account_number" VARCHAR,
    "transaction_date" VARCHAR,
    "amount_out" VARCHAR,
    "amount_in" VARCHAR,
    "accumulated" VARCHAR,
    "transaction_content" TEXT,
    "reference_number" VARCHAR,
    "code" VARCHAR,
    "sub_account" VARCHAR,
    "bank_account_id" VARCHAR,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "lark_record_id" VARCHAR(255),

    CONSTRAINT "sepay_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy"."purchase_exchange_policy" (
    "order_id" VARCHAR(50) NOT NULL,
    "item_id" VARCHAR(50) NOT NULL,
    "order_code" VARCHAR(50),
    "sku" VARCHAR(50),
    "item_name" VARCHAR(255),
    "barcode" VARCHAR(50),
    "policy_id" VARCHAR(50),
    "policy_name" VARCHAR,

    CONSTRAINT "purchase_exchange_policy_pkey" PRIMARY KEY ("order_id","item_id")
);

-- CreateTable
CREATE TABLE "promotion"."order_promotion_analysis" (
    "uuid" UUID NOT NULL,
    "order_code" VARCHAR,
    "variant_id" BIGINT,
    "price" BIGINT,
    "promotion_name" VARCHAR,
    "priority_order" VARCHAR,
    "price_before_promotion" BIGINT,
    "price_after_promotion" BIGINT,
    "calculated_sale_price" BIGINT,
    "actual_sale_price" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_promotion_analysis_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "promotion"."order_promotions" (
    "uuid" VARCHAR(36) NOT NULL,
    "id" VARCHAR(50),
    "haravan_id" VARCHAR(50),
    "order_code" VARCHAR(50),
    "real_created_at" TIMESTAMP(6),
    "order_created_on" TIMESTAMP(6),
    "sub_total_price" DECIMAL(36,8),
    "total_price" DECIMAL(36,8),
    "updated_at" TIMESTAMP(6),
    "promotion_order" JSONB,
    "promotion_item" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_promotions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "rapnet"."diamonds_dev" (
    "diamond_id" VARCHAR NOT NULL,
    "gia_report_no" VARCHAR,
    "price" DECIMAL,
    "country" VARCHAR,
    "is_available" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "gia_info" JSONB,
    "sent_event" JSONB,
    "shade" VARCHAR,
    "key_to_symbols" VARCHAR,
    "inclusions" VARCHAR,
    "diamond_data" JSONB,

    CONSTRAINT "diamonds_dev_pkey" PRIMARY KEY ("diamond_id")
);

-- CreateTable
CREATE TABLE "rapnet"."diamonds_prod" (
    "diamond_id" VARCHAR NOT NULL,
    "gia_report_no" VARCHAR,
    "price" DECIMAL,
    "country" VARCHAR,
    "is_available" BOOLEAN,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "gia_info" JSONB,
    "sent_event" JSONB,
    "shade" VARCHAR,
    "key_to_symbols" VARCHAR,
    "inclusions" VARCHAR,
    "diamond_data" JSONB,

    CONSTRAINT "diamonds_prod_pkey" PRIMARY KEY ("diamond_id")
);

-- CreateTable
CREATE TABLE "reporting"."time_dim" (
    "col" SERIAL NOT NULL,
    "day" TIMESTAMP(6),

    CONSTRAINT "time_dim_pkey" PRIMARY KEY ("col")
);

-- CreateTable
CREATE TABLE "workplace"."_nc_m2m_haravan_collect_products" (
    "products_id" INTEGER NOT NULL,
    "haravan_collections_id" INTEGER NOT NULL,

    CONSTRAINT "_nc_m2m_haravan_collect_products_pkey" PRIMARY KEY ("products_id","haravan_collections_id")
);

-- CreateTable
CREATE TABLE "workplace"."collections" (
    "id" SERIAL NOT NULL,
    "collection_name" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "air" TEXT,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."design_details" (
    "id" SERIAL NOT NULL,
    "gold_weight" DECIMAL NOT NULL DEFAULT 0,
    "labour_cost" DECIMAL NOT NULL DEFAULT 0,
    "shape_of_main_stone" TEXT,
    "main_stone_length" DECIMAL,
    "main_stone_width" DECIMAL,
    "melee_total_price" DECIMAL,

    CONSTRAINT "design_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."design_images" (
    "id" SERIAL NOT NULL,
    "design_id" INTEGER,
    "material_color" TEXT DEFAULT 'Vàng Trắng',
    "retouch" TEXT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "tick_sync_to_haravan" BOOLEAN DEFAULT false,
    "note" TEXT,

    CONSTRAINT "design_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."design_melee_details" (
    "id" SERIAL NOT NULL,
    "design_detail_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "design_melee_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."design_price_estimation" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "ref_price" DECIMAL,
    "discount_ref_price" DECIMAL,
    "design_id" INTEGER,

    CONSTRAINT "design_price_estimation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."design_set" (
    "id" SERIAL NOT NULL,
    "design_id" INTEGER,
    "set_id" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "design_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."designs" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "erp_code" TEXT,
    "backup_code" TEXT,
    "design_type" TEXT,
    "gender" TEXT,
    "design_year" TEXT DEFAULT '2025',
    "design_seq" BIGINT,
    "usage_status" TEXT,
    "link_4view" TEXT,
    "folder_summary" TEXT,
    "link_3d" TEXT,
    "link_render" TEXT,
    "link_retouch" TEXT,
    "ring_band_type" TEXT,
    "ring_band_style" TEXT,
    "ring_head_style" TEXT,
    "jewelry_rd_style" TEXT,
    "shape_of_main_stone" TEXT,
    "product_line" TEXT,
    "social_post" BOOLEAN DEFAULT false,
    "website" BOOLEAN DEFAULT false,
    "RENDER" BOOLEAN,
    "RETOUCH" BOOLEAN DEFAULT false,
    "gold_weight" DECIMAL,
    "main_stone" TEXT,
    "stone_quantity" TEXT,
    "stone_weight" TEXT,
    "diamond_holder" TEXT,
    "source" TEXT,
    "variant_number" BIGINT DEFAULT 1,
    "collections_id" INTEGER,
    "image_4view" TEXT,
    "image_render" TEXT,
    "image_retouch" TEXT,
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "collection_name" TEXT,
    "auto_create_folder" BOOLEAN,
    "design_code" TEXT,
    "ecom_showed" BOOLEAN DEFAULT false,
    "tag" TEXT,
    "stock_locations" TEXT,
    "wedding_ring_id" INTEGER,
    "reference_code" TEXT,
    "design_status" TEXT DEFAULT 'active',
    "erp_code_duplicated" BOOLEAN DEFAULT false,
    "max_seq" INTEGER,
    "last_synced_render" TEXT,
    "last_synced_4view" TEXT DEFAULT '',
    "pick_up" DATE,
    "created_date" DATE,

    CONSTRAINT "design_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."designs_temporary_products" (
    "id" INTEGER NOT NULL,
    "design_code" TEXT,
    "design_type" TEXT,
    "gender" TEXT,
    "cover" TEXT,
    "link_render" TEXT,
    "code" TEXT,
    "erp_code" TEXT,
    "backup_code" TEXT,
    "lark_record_id" TEXT,

    CONSTRAINT "designs_temporary_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."diamond_price_list" (
    "id" SERIAL NOT NULL,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "size" DECIMAL,
    "color" TEXT,
    "clarity" TEXT,
    "carat" TEXT,
    "price" DECIMAL,

    CONSTRAINT "diamond_price_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."diamonds" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT,
    "report_lab" TEXT,
    "report_no" BIGINT,
    "price" DECIMAL,
    "cogs" DECIMAL,
    "product_group" TEXT,
    "shape" TEXT,
    "cut" TEXT,
    "color" TEXT,
    "clarity" TEXT,
    "fluorescence" TEXT,
    "edge_size_1" REAL,
    "edge_size_2" REAL,
    "carat" DECIMAL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "auto_create_haravan_product" BOOLEAN DEFAULT false,
    "product_id" BIGINT,
    "variant_id" BIGINT,
    "promotions" TEXT DEFAULT 'CT nền giảm KCV 8%',
    "link_haravan" TEXT,
    "note" TEXT,
    "vendor" TEXT,
    "published_scope" TEXT DEFAULT 'global',
    "qty_onhand" REAL,
    "qty_available" REAL,
    "qty_commited" REAL,
    "qty_incoming" REAL,
    "printing_batch" TEXT,
    "g1_collection_id" INTEGER,

    CONSTRAINT "diamomds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."ecom_360" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "path" TEXT DEFAULT 'https://90814f99c119cd5dc08362580f81a76f.r2.cloudflarestorage.com/jemmia-images/glb/',
    "file_name" TEXT,

    CONSTRAINT "ecom_360_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."ecom_old_products" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER,
    "variant_id" INTEGER,
    "published_scope" VARCHAR(50),
    "product_type" VARCHAR(50),
    "template_suffix" VARCHAR(50),
    "title" VARCHAR(64),
    "code" VARCHAR(50),
    "shape" VARCHAR(50),
    "color" VARCHAR(50),
    "material" VARCHAR(50),
    "band" VARCHAR(50),
    "design_id" INTEGER,

    CONSTRAINT "ecom_old_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."haravan_collections" (
    "id" SERIAL NOT NULL,
    "collection_type" TEXT DEFAULT 'custom_collection',
    "title" TEXT NOT NULL,
    "products_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "haravan_id" BIGINT,
    "auto_create" BOOLEAN DEFAULT false,
    "auto_add_product_type" TEXT,
    "handle" TEXT,

    CONSTRAINT "product_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."hrv_locations_1" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "hrv_locations_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."jewelries" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT,
    "category" TEXT DEFAULT 'Trang sức',
    "supplier_code" TEXT,
    "gold_weight" DECIMAL,
    "diamond_weight" DECIMAL,
    "price" DECIMAL,
    "cogs" DECIMAL,
    "quantity" SMALLINT,
    "order_code" TEXT,
    "supplier" TEXT,
    "note" TEXT,
    "subcategory" TEXT,
    "gender" TEXT,
    "applique_material" TEXT,
    "fineness" TEXT,
    "material_color" TEXT,
    "size_type" TEXT,
    "ring_size" DECIMAL,
    "storage_size_type" TEXT,
    "storage_size_1" DECIMAL,
    "storage_size_2" DECIMAL,
    "design_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "product_group" TEXT,
    "product_type" TEXT,
    "type" TEXT,
    "design_code" TEXT,
    "4view" TEXT,
    "link_3d" TEXT,
    "link_4view" TEXT,
    "supply_product_type" TEXT,
    "stock" BIGINT,
    "printing_batch" TEXT,
    "haravan_product_type" TEXT,
    "vendor" TEXT,
    "promotions" TEXT,
    "auto_create_haravan_product" BOOLEAN DEFAULT false,
    "variant_id" BIGINT,
    "product_id" BIGINT,
    "link_haravan" TEXT,
    "qty_onhand" REAL,
    "qty_commited" REAL,
    "qty_incoming" REAL,
    "qty_available" REAL,
    "published_scope" TEXT,
    "ring_pair_id" INTEGER,
    "infomation" TEXT,
    "code_in_title" TEXT,
    "stored_sku" TEXT,

    CONSTRAINT "jewelries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."materials" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "market_price" DECIMAL NOT NULL,
    "percentage" DOUBLE PRECISION,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."melee_diamonds" (
    "id" SERIAL NOT NULL,
    "haravan_product_id" INTEGER,
    "haravan_variant_id" INTEGER,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "length" DECIMAL,
    "width" DECIMAL,
    "sku" TEXT,
    "barcode" TEXT,
    "shape" TEXT,

    CONSTRAINT "melee_diamonds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."moissanite" (
    "id" SERIAL NOT NULL,
    "product_group" TEXT,
    "shape" TEXT,
    "length" DECIMAL,
    "width" DECIMAL,
    "color" TEXT,
    "clarity" TEXT DEFAULT 'Không phân loại',
    "fluorescence" TEXT DEFAULT 'Không phân loại',
    "cut" TEXT DEFAULT 'Không phân loại',
    "polish" TEXT DEFAULT 'Không phân loại',
    "symmetry" TEXT DEFAULT 'Không phân loại',
    "haravan_product_id" BIGINT,
    "haravan_variant_id" BIGINT,
    "auto_create" BOOLEAN DEFAULT false,
    "price" DECIMAL DEFAULT 0,
    "barcode" TEXT,

    CONSTRAINT "moissanite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."moissanite_serials" (
    "id" SERIAL NOT NULL,
    "final_encoded_rfid" TEXT,
    "moissanite_id" INTEGER,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moissanite_serials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."products" (
    "id" SERIAL NOT NULL,
    "haravan_product_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "nc_order" DECIMAL,
    "vendor" TEXT DEFAULT 'Jemmia',
    "haravan_product_type" TEXT,
    "design_id" INTEGER,
    "published_scope" TEXT DEFAULT 'pos',
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "template_suffix" TEXT,
    "handle" TEXT,
    "auto_create_haravan" BOOLEAN DEFAULT false,
    "note" TEXT,
    "web_url" TEXT,
    "ecom_title" TEXT,
    "g1_promotion" TEXT DEFAULT '16%',
    "published" TEXT,
    "estimated_gold_weight" DECIMAL,
    "has_360" BOOLEAN DEFAULT false,
    "diamond_shape" TEXT,
    "stone_min_width" DECIMAL,
    "stone_max_width" DECIMAL,
    "stone_min_length" DECIMAL,
    "stone_max_length" DECIMAL,
    "collections" TEXT,
    "haravan_collections_id" INTEGER,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."promotions" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "starts_at" TIMESTAMP(6),
    "ends_at" TIMESTAMP(6),
    "take_type" TEXT,
    "set_time_active" TIMESTAMP(6),
    "status" TEXT,
    "value" BIGINT,
    "products_selection" TEXT,
    "promotion_id" BIGINT,
    "link_to_admind" TEXT,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."sets" (
    "id" SERIAL NOT NULL,
    "set_name" TEXT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "design_codes" TEXT,
    "haravan_product_id" INTEGER,
    "haravan_variant_id" INTEGER,
    "note" TEXT,
    "main_image_link" TEXT,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."size_details" (
    "id" SERIAL NOT NULL,
    "panel_size_type" TEXT,
    "length" DECIMAL,
    "quantity" BIGINT,
    "jewelry_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "width" DECIMAL,

    CONSTRAINT "size_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."submitted_codes" (
    "id" SERIAL NOT NULL,
    "codes" TEXT NOT NULL,
    "created_by" VARCHAR,
    "notes" TEXT,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "tag" TEXT,

    CONSTRAINT "submitted_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."temporary_products" (
    "id" SERIAL NOT NULL,
    "haravan_product_id" INTEGER,
    "haravan_variant_id" INTEGER,
    "customer_name" TEXT,
    "variant_title" TEXT,
    "customer_phone" VARCHAR,
    "code" TEXT,
    "price" DECIMAL DEFAULT 0,
    "product_information" TEXT,
    "design_id" INTEGER,
    "category" TEXT,
    "applique_material" TEXT,
    "material_color" TEXT,
    "size_type" TEXT,
    "ring_size" DECIMAL,
    "fineness" TEXT,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "design_code" TEXT,
    "summary" TEXT,
    "lark_base_record_id" TEXT,
    "use_case" TEXT,
    "variant_serial_id" INTEGER,
    "ticket_type" TEXT,
    "product_group" TEXT,
    "gia_report_no" TEXT,
    "ref_design_code" TEXT,
    "request_code" TEXT,
    "is_create_product" TEXT,
    "is_notify_lark_reorder" BOOLEAN,

    CONSTRAINT "temporary_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."temporary_products_web" (
    "id" BIGSERIAL NOT NULL,
    "customer_name" VARCHAR,
    "customer_phone" VARCHAR,
    "original_hrv_product_id" VARCHAR,
    "original_hrv_variant_id" VARCHAR,
    "token" VARCHAR,
    "title" VARCHAR,
    "price" BIGINT,
    "line_price" BIGINT,
    "price_original" BIGINT,
    "line_price_orginal" BIGINT,
    "quantity" INTEGER,
    "sku" VARCHAR,
    "grams" DOUBLE PRECISION,
    "product_type" VARCHAR,
    "vendor" VARCHAR,
    "properties" JSONB,
    "gift_card" BOOLEAN,
    "url" VARCHAR,
    "image" VARCHAR,
    "handle" VARCHAR,
    "requires_shipping" BOOLEAN,
    "not_allow_promotion" BOOLEAN,
    "product_title" VARCHAR,
    "barcode" VARCHAR,
    "product_description" VARCHAR,
    "variant_title" VARCHAR,
    "variant_options" JSONB,
    "promotionref" VARCHAR,
    "promotionby" JSONB,
    "haravan_product_id" BIGINT,
    "haravan_variant_id" BIGINT,

    CONSTRAINT "temporary_products_web_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."temtab" (
    "design_code" TEXT,
    "link_3d" TEXT,
    "column3" VARCHAR(50),
    "column4" VARCHAR(50),
    "column5" VARCHAR(50),
    "column6" VARCHAR(50),
    "column7" VARCHAR(50),
    "column8" VARCHAR(50),
    "column9" VARCHAR(50),
    "column10" VARCHAR(50),
    "column11" VARCHAR(50),
    "column12" VARCHAR(50),
    "column13" VARCHAR(50),
    "column14" VARCHAR(50),
    "column15" VARCHAR(50),
    "column16" VARCHAR(50),
    "column17" VARCHAR(50),
    "column18" VARCHAR(50),
    "column19" VARCHAR(50),
    "column20" VARCHAR(50)
);

-- CreateTable
CREATE TABLE "workplace"."variant_serials" (
    "id" SERIAL NOT NULL,
    "variant_id" INTEGER,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "nc_order" DECIMAL,
    "serial_number" TEXT,
    "printing_batch" TEXT,
    "encode_barcode" TEXT,
    "final_encoded_barcode" TEXT,
    "old_encode_barcode" TEXT,
    "old_finnal_encode_barcode" TEXT,
    "gold_weight" DECIMAL,
    "diamond_weight" DECIMAL,
    "old_variant_id" BIGINT,
    "old_product_id" BIGINT,
    "quantity" DECIMAL,
    "supplier" TEXT,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "cogs" DECIMAL,
    "old_barcode" TEXT,
    "order_on" TEXT,
    "stock_id" BIGINT,
    "order_id" BIGINT,
    "storage_size_type" TEXT,
    "storage_size_1" DECIMAL,
    "storage_size_2" DECIMAL,
    "note" TEXT,
    "stock_at" TEXT,
    "order_reference" TEXT,
    "last_rfid_scan_time" TIMESTAMPTZ(6),
    "fulfillment_status_value" TEXT,
    "lark_record_id" TEXT,
    "arrival_date" DATE,
    "actual_gold_price" DECIMAL,
    "actual_melee_price" DECIMAL,
    "actual_labor_cost" DECIMAL,

    CONSTRAINT "variant_serials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."variant_serials_lark" (
    "id" INTEGER NOT NULL,
    "lark_record_id" TEXT,
    "db_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variant_serials_lark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."variants" (
    "id" SERIAL NOT NULL,
    "haravan_variant_id" BIGINT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),
    "created_by" VARCHAR,
    "updated_by" VARCHAR,
    "nc_order" DECIMAL,
    "product_id" INTEGER,
    "barcode" TEXT,
    "inventory_quantity" BIGINT,
    "old_inventory_quantity" BIGINT,
    "sku" TEXT,
    "qty_available" BIGINT,
    "qty_onhand" BIGINT,
    "qty_commited" BIGINT,
    "qty_incoming" BIGINT,
    "category" TEXT DEFAULT 'Trang sức',
    "applique_material" TEXT,
    "fineness" TEXT,
    "material_color" TEXT,
    "size_type" TEXT,
    "ring_size" DECIMAL,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "haravan_product_id" BIGINT,
    "price" DECIMAL,
    "auto_create_variant" BOOLEAN DEFAULT false,
    "note" TEXT,
    "estimated_gold_weight" REAL,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workplace"."wedding_rings" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "ecom_title" TEXT,

    CONSTRAINT "wedding_rings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ix_advertising_cost_platforms_id" ON "advertising_cost"."platforms"("id");

-- CreateIndex
CREATE INDEX "ix_advertising_cost_platforms_uuid" ON "advertising_cost"."platforms"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_allocations_id" ON "bizflycrm"."allocations"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_calls_id" ON "bizflycrm"."calls"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_customers_id" ON "bizflycrm"."customers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_departments_id" ON "bizflycrm"."departments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_kpis_id" ON "bizflycrm"."kpis"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_line_items_id" ON "bizflycrm"."line_items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_orders_id" ON "bizflycrm"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_orders_receipts_id" ON "bizflycrm"."orders_receipts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_payments_id" ON "bizflycrm"."payments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_promotions_id" ON "bizflycrm"."promotions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_serial_numbers_id" ON "bizflycrm"."serial_numbers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_bizflycrm_users_id" ON "bizflycrm"."users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "jewelry_diamond_pairs_id_key" ON "ecom"."jewelry_diamond_pairs"("id");

-- CreateIndex
CREATE INDEX "jewelry_diamond_pairs_haravan_diamond_product_id_haravan_di_idx" ON "ecom"."jewelry_diamond_pairs"("haravan_diamond_product_id", "haravan_diamond_variant_id");

-- CreateIndex
CREATE INDEX "jewelry_diamond_pairs_haravan_product_id_haravan_variant_id_idx" ON "ecom"."jewelry_diamond_pairs"("haravan_product_id", "haravan_variant_id", "is_active");

-- CreateIndex
CREATE INDEX "jewelry_diamond_pairs_id_idx" ON "ecom"."jewelry_diamond_pairs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "jewelry_diamond_pairing_unique_pairing" ON "ecom"."jewelry_diamond_pairs"("haravan_product_id", "haravan_variant_id", "haravan_diamond_product_id", "haravan_diamond_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_custom_uuid_key" ON "ecom"."leads"("custom_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "products_unique_haravan_id" ON "ecom"."products"("haravan_product_id");

-- CreateIndex
CREATE INDEX "ix_ecom_qr_generator_id" ON "ecom"."qr_generator"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_haravan_variant_id" ON "ecom"."variants"("haravan_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "wedding_rings_id_key" ON "ecom"."wedding_rings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "order_tracking_haravan_order_id_key" ON "ecommerce"."order_tracking"("haravan_order_id", "haravan_order_status");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_name_key" ON "erpnext"."addresses"("name");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_name_key" ON "erpnext"."contacts"("name");

-- CreateIndex
CREATE INDEX "contacts_name_idx" ON "erpnext"."contacts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "customers_name_key" ON "erpnext"."customers"("name");

-- CreateIndex
CREATE INDEX "customers_customer_name_idx" ON "erpnext"."customers"("customer_name");

-- CreateIndex
CREATE INDEX "customers_haravan_id_idx" ON "erpnext"."customers"("haravan_id");

-- CreateIndex
CREATE INDEX "customers_name_idx" ON "erpnext"."customers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_name_key" ON "erpnext"."employees"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lead_budgets_name_key" ON "erpnext"."lead_budgets"("name");

-- CreateIndex
CREATE INDEX "lead_budgets_name_idx" ON "erpnext"."lead_budgets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lead_demands_name_key" ON "erpnext"."lead_demands"("name");

-- CreateIndex
CREATE INDEX "lead_demands_name_idx" ON "erpnext"."lead_demands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lead_sources_name_key" ON "erpnext"."lead_sources"("name");

-- CreateIndex
CREATE UNIQUE INDEX "leads_name_key" ON "erpnext"."leads"("name");

-- CreateIndex
CREATE INDEX "leads_name_idx" ON "erpnext"."leads"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "erpnext"."product_categories"("name");

-- CreateIndex
CREATE INDEX "product_categories_name_idx" ON "erpnext"."product_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "promotions_name_key" ON "erpnext"."promotions"("name");

-- CreateIndex
CREATE INDEX "promotions_name_idx" ON "erpnext"."promotions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "erpnext"."provinces"("name");

-- CreateIndex
CREATE INDEX "provinces_name_idx" ON "erpnext"."provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_purposes_name_key" ON "erpnext"."purchase_purposes"("name");

-- CreateIndex
CREATE INDEX "purchase_purposes_name_idx" ON "erpnext"."purchase_purposes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "erpnext"."regions"("name");

-- CreateIndex
CREATE INDEX "regions_name_idx" ON "erpnext"."regions"("name");

-- CreateIndex
CREATE INDEX "sales_order_notification_tracking_haravan_order_id_idx" ON "erpnext"."sales_order_notification_tracking"("haravan_order_id");

-- CreateIndex
CREATE INDEX "sales_order_notification_tracking_order_name_idx" ON "erpnext"."sales_order_notification_tracking"("order_name");

-- CreateIndex
CREATE UNIQUE INDEX "sales_orders_name_key" ON "erpnext"."sales_orders"("name");

-- CreateIndex
CREATE INDEX "sales_orders_cancelled_status_idx" ON "erpnext"."sales_orders"("cancelled_status");

-- CreateIndex
CREATE INDEX "sales_orders_customer_idx" ON "erpnext"."sales_orders"("customer");

-- CreateIndex
CREATE INDEX "sales_orders_customer_transaction_date_idx" ON "erpnext"."sales_orders"("customer", "transaction_date");

-- CreateIndex
CREATE INDEX "sales_orders_delivery_status_idx" ON "erpnext"."sales_orders"("delivery_status");

-- CreateIndex
CREATE INDEX "sales_orders_financial_status_idx" ON "erpnext"."sales_orders"("financial_status");

-- CreateIndex
CREATE INDEX "sales_orders_fulfillment_status_idx" ON "erpnext"."sales_orders"("fulfillment_status");

-- CreateIndex
CREATE INDEX "sales_orders_haravan_order_id_idx" ON "erpnext"."sales_orders"("haravan_order_id");

-- CreateIndex
CREATE INDEX "sales_orders_order_number_idx" ON "erpnext"."sales_orders"("order_number");

-- CreateIndex
CREATE INDEX "sales_orders_status_idx" ON "erpnext"."sales_orders"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sales_persons_name_key" ON "erpnext"."sales_persons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "erpnext"."users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_collection_product_id" ON "haravan"."collection_product"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_collection_product_uuid" ON "haravan"."collection_product"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_custom_collections_id" ON "haravan"."custom_collections"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_custom_collections_uuid" ON "haravan"."custom_collections"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_customers_id" ON "haravan"."customers"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_customers_uuid" ON "haravan"."customers"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_fulfillments_id" ON "haravan"."fulfillments"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_id" ON "haravan"."images"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_line_items_id" ON "haravan"."line_items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_orders_id" ON "haravan"."orders"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_products_id" ON "haravan"."products"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_products_uuid" ON "haravan"."products"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_id" ON "haravan"."purchase_receives"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_uuid" ON "haravan"."purchase_receives"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_purchase_receives_items_id" ON "haravan"."purchase_receives_items"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_items_product_id" ON "haravan"."purchase_receives_items"("product_id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_items_purchase_receive_id" ON "haravan"."purchase_receives_items"("purchase_receive_id");

-- CreateIndex
CREATE INDEX "ix_haravan_purchase_receives_items_uuid" ON "haravan"."purchase_receives_items"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_refunds_id" ON "haravan"."refunds"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_transactions_id" ON "haravan"."transactions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_users_id" ON "haravan"."users"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_users_uuid" ON "haravan"."users"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_variants_id" ON "haravan"."variants"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_variants_product_id" ON "haravan"."variants"("product_id");

-- CreateIndex
CREATE INDEX "ix_haravan_variants_uuid" ON "haravan"."variants"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_haravan_warehouse_inventories_id" ON "haravan"."warehouse_inventories"("id");

-- CreateIndex
CREATE INDEX "ix_haravan_warehouse_inventories_uuid" ON "haravan"."warehouse_inventories"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_check_lines_id_key" ON "inventory_cms"."inventory_check_lines"("id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_check_sheets_id_key" ON "inventory_cms"."inventory_check_sheets"("id");

-- CreateIndex
CREATE UNIQUE INDEX "buyback_exchange_approval_instances_instance_code_key" ON "larksuite"."buyback_exchange_approval_instances"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX "ix_larksuite_customer_appointments_id" ON "larksuite"."customer_appointments"("id");

-- CreateIndex
CREATE INDEX "ix_larksuite_customer_appointments_uuid" ON "larksuite"."customer_appointments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "departments_open_department_id_key" ON "larksuite"."departments"("open_department_id");

-- CreateIndex
CREATE UNIQUE INDEX "instances_serial_number_key" ON "larksuite"."instances"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "instances_instance_code_key" ON "larksuite"."instances"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX "ix_larksuite_warehouse_inventories_lark_id" ON "larksuite"."lark_warehouse_inventories"("id");

-- CreateIndex
CREATE UNIQUE INDEX "instance_code_unique" ON "larksuite"."promotion_approval"("instance_code");

-- CreateIndex
CREATE UNIQUE INDEX "records_record_id_key" ON "larksuite"."records"("record_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_open_id_key" ON "larksuite"."users"("open_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_union_id_key" ON "larksuite"."users"("union_id");

-- CreateIndex
CREATE INDEX "exchange_rate_time_idx" ON "market_data"."exchange_rate"("time" DESC);

-- CreateIndex
CREATE INDEX "gold_pricing_time_idx" ON "market_data"."gold_pricing"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_inventory_items_sku" ON "misa"."inventory_items"("sku");

-- CreateIndex
CREATE INDEX "ix_misa_inventory_items_uuid" ON "misa"."inventory_items"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_items_id" ON "misa"."items"("id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_voucher_details_ref_detail_id_key" ON "misa"."purchase_voucher_details"("ref_detail_id");

-- CreateIndex
CREATE INDEX "ix_misa_purchase_voucher_details_refid" ON "misa"."purchase_voucher_details"("refid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_purchase_vouchers_refid" ON "misa"."purchase_vouchers"("refid");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "misa"."users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_haravan_id_key" ON "misa"."users"("haravan_id");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pancake_conversation_id" ON "pancake"."conversation"("id");

-- CreateIndex
CREATE INDEX "idx_conversation_page_id" ON "pancake"."conversation"("page_id");

-- CreateIndex
CREATE INDEX "idx_id" ON "pancake"."conversation"("id");

-- CreateIndex
CREATE INDEX "ix_pancake_conversation_uuid" ON "pancake"."conversation"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_id_page_idx" ON "pancake"."conversation"("id", "page_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_page_customer_uuid_key" ON "pancake"."conversation_page_customer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_tag_uuid_key" ON "pancake"."conversation_tag"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pancake_page_id" ON "pancake"."page"("id");

-- CreateIndex
CREATE INDEX "idx_page_id" ON "pancake"."page"("id");

-- CreateIndex
CREATE INDEX "ix_pancake_page_uuid" ON "pancake"."page"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_pancake_page_customer_id" ON "pancake"."page_customer"("id");

-- CreateIndex
CREATE INDEX "ix_pancake_page_customer_uuid" ON "pancake"."page_customer"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "users_enterprise_email_key" ON "pancake"."users"("enterprise_email");

-- CreateIndex
CREATE UNIQUE INDEX "manual_payments_lark_record_id_key" ON "payment"."manual_payments"("lark_record_id");

-- CreateIndex
CREATE INDEX "manual_payments_uuid_idx" ON "payment"."manual_payments"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ix_promotion_order_promotions_id" ON "promotion"."order_promotions"("id");

-- CreateIndex
CREATE INDEX "fk_haravan_co_products_0_kxecf3y_" ON "workplace"."_nc_m2m_haravan_collect_products"("haravan_collections_id");

-- CreateIndex
CREATE INDEX "fk_haravan_co_products_tl93hnbjtq" ON "workplace"."_nc_m2m_haravan_collect_products"("products_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_design_color" ON "workplace"."design_images"("design_id", "material_color");

-- CreateIndex
CREATE UNIQUE INDEX "unique_id_constraint" ON "workplace"."designs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_code_constraint" ON "workplace"."designs"("code");

-- CreateIndex
CREATE INDEX "designs_collections_id_index" ON "workplace"."designs"("collections_id");

-- CreateIndex
CREATE UNIQUE INDEX "design_code_attributes_unique" ON "workplace"."designs"("design_type", "gender", "diamond_holder", "source", "design_year", "design_seq", "variant_number");

-- CreateIndex
CREATE UNIQUE INDEX "unique_diamond_barcode" ON "workplace"."diamonds"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "unique_variant_id" ON "workplace"."diamonds"("variant_id");

-- CreateIndex
CREATE INDEX "idx_variant_id_workplace_diamonds" ON "workplace"."diamonds"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_barcode_jewelries" ON "workplace"."jewelries"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "jewelries_unique_variant_id" ON "workplace"."jewelries"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "moissanite_barcode_key" ON "workplace"."moissanite"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "unique_moissannite_sku_attributes" ON "workplace"."moissanite"("product_group", "shape", "length", "width", "color", "clarity", "fluorescence", "cut", "polish", "symmetry");

-- CreateIndex
CREATE UNIQUE INDEX "unique_final_encoded_rfid" ON "workplace"."moissanite_serials"("final_encoded_rfid");

-- CreateIndex
CREATE UNIQUE INDEX "uniqe_product_id" ON "workplace"."products"("haravan_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_design_id" ON "workplace"."products"("design_id");

-- CreateIndex
CREATE INDEX "fk_haravan_co_products_v88qytf5oz" ON "workplace"."products"("haravan_collections_id");

-- CreateIndex
CREATE INDEX "products_order_idx" ON "workplace"."products"("nc_order");

-- CreateIndex
CREATE UNIQUE INDEX "unique_lark_base_record_id" ON "workplace"."temporary_products"("lark_base_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "temporary_products_variant_serial_id_key" ON "workplace"."temporary_products"("variant_serial_id");

-- CreateIndex
CREATE UNIQUE INDEX "temtab_design_code_key" ON "workplace"."temtab"("design_code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_serial_number" ON "workplace"."variant_serials"("serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "unique_final_encode_barcode" ON "workplace"."variant_serials"("final_encoded_barcode");

-- CreateIndex
CREATE INDEX "variant_serials_order_idx" ON "workplace"."variant_serials"("nc_order");

-- CreateIndex
CREATE UNIQUE INDEX "unique_serial_number_final_encoded_barcode" ON "workplace"."variant_serials"("serial_number", "final_encoded_barcode");

-- CreateIndex
CREATE UNIQUE INDEX "uniqe_variant_id" ON "workplace"."variants"("haravan_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_barcode" ON "workplace"."variants"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "unique_sku" ON "workplace"."variants"("sku");

-- CreateIndex
CREATE INDEX "idx_harvan_variant_id_workplace_variants" ON "workplace"."variants"("haravan_variant_id");

-- CreateIndex
CREATE INDEX "variants_order_idx" ON "workplace"."variants"("nc_order");

-- CreateIndex
CREATE UNIQUE INDEX "unique_sku_attributes" ON "workplace"."variants"("product_id", "category", "applique_material", "fineness", "material_color", "size_type", "ring_size");

-- AddForeignKey
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment"."manual_payments" ADD CONSTRAINT "manual_payments_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "fk_haravan_co_products_8v31fxenpy" FOREIGN KEY ("products_id") REFERENCES "workplace"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."_nc_m2m_haravan_collect_products" ADD CONSTRAINT "fk_haravan_co_products_q3phsaq_nx" FOREIGN KEY ("haravan_collections_id") REFERENCES "workplace"."haravan_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."design_images" ADD CONSTRAINT "design_images_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."design_melee_details" ADD CONSTRAINT "fk_design_detail" FOREIGN KEY ("design_detail_id") REFERENCES "workplace"."design_details"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."design_price_estimation" ADD CONSTRAINT "design_price_estimation_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."design_set" ADD CONSTRAINT "design_set_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "workplace"."sets"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "designs_wedding_ring_id_fkey" FOREIGN KEY ("wedding_ring_id") REFERENCES "workplace"."wedding_rings"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."designs" ADD CONSTRAINT "fk_collection_designs_0ry69f9nc6" FOREIGN KEY ("collections_id") REFERENCES "workplace"."collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."diamonds" ADD CONSTRAINT "diamonds_g1_collection_id_fkey" FOREIGN KEY ("g1_collection_id") REFERENCES "workplace"."haravan_collections"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."ecom_360" ADD CONSTRAINT "ecom_360_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "workplace"."products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."ecom_old_products" ADD CONSTRAINT "ecom_old_products_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "fk_designs" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."jewelries" ADD CONSTRAINT "fk_ring_pairs" FOREIGN KEY ("ring_pair_id") REFERENCES "workplace"."jewelries"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."moissanite_serials" ADD CONSTRAINT "moissanite_serials_moissanite_id_fkey" FOREIGN KEY ("moissanite_id") REFERENCES "workplace"."moissanite"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."products" ADD CONSTRAINT "fk_haravan_co_products_enlvmi264j" FOREIGN KEY ("haravan_collections_id") REFERENCES "workplace"."haravan_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."products" ADD CONSTRAINT "fk_product_design" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."size_details" ADD CONSTRAINT "fk_jewelries" FOREIGN KEY ("jewelry_id") REFERENCES "workplace"."jewelries"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "fk_variant_serial" FOREIGN KEY ("variant_serial_id") REFERENCES "workplace"."variant_serials"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."temporary_products" ADD CONSTRAINT "temporary_products_design_id_fkey" FOREIGN KEY ("design_id") REFERENCES "workplace"."designs"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."variant_serials" ADD CONSTRAINT "fk_variants_variant_serials" FOREIGN KEY ("variant_id") REFERENCES "workplace"."variants"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workplace"."variants" ADD CONSTRAINT "fk_variants_products" FOREIGN KEY ("product_id") REFERENCES "workplace"."products"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

