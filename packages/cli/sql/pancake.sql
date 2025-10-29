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
