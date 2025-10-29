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
