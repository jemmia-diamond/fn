-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "marketing";


-- CreateTable
CREATE TABLE "marketing"."facebook_ads_campaigns" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "status" TEXT,
    "bid_strategy" TEXT,
    "buying_type" TEXT,
    "budget_remaining" TEXT,
    "budget_rebalance_flag" BOOLEAN NOT NULL DEFAULT false,
    "lifetime_budget" TEXT,
    "spend_cap" TEXT,
    "last_budget_toggling_time" TIMESTAMP(3),
    "pacing_type" JSONB,
    "is_budget_schedule_enabled" BOOLEAN NOT NULL DEFAULT false,
    "campaign_group_active_time" TEXT,
    "start_time" TIMESTAMP(3),
    "stop_time" TIMESTAMP(3),
    "is_message_campaign" BOOLEAN NOT NULL DEFAULT false,
    "is_direct_send_campaign" BOOLEAN NOT NULL DEFAULT false,
    "is_ska" BOOLEAN,
    "special_ad_category" TEXT,
    "special_ad_category_country" JSONB,
    "adlabels" JSONB,
    "source_campaign" JSONB,
    "source_campaign_id" TEXT,
    "topline_id" TEXT,
    "issues_info" JSONB,
    "brand_lift_studies" JSONB,
    "created_time" TIMESTAMP(3),
    "updated_time" TIMESTAMP(3),
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facebook_ads_campaigns_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_campaigns_id_key" ON "marketing"."facebook_ads_campaigns"("id");
