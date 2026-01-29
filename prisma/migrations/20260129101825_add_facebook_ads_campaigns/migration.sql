-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "marketing";

-- CreateTable
CREATE TABLE "marketing"."facebook_ads_campaigns" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "bid_strategy" TEXT,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "pacing_type" JSONB,
    "is_message_campaign" BOOLEAN NOT NULL DEFAULT false,
    "is_direct_send_campaign" BOOLEAN NOT NULL DEFAULT false,
    "is_budget_schedule_enabled" BOOLEAN NOT NULL DEFAULT false,
    "budget_rebalance_flag" BOOLEAN NOT NULL DEFAULT false,
    "budget_remaining" TEXT,
    "buying_type" TEXT,
    "campaign_group_active_time" TEXT,
    "created_time" TIMESTAMP(3),
    "source_campaign" JSONB,
    "source_campaign_id" TEXT,
    "special_ad_category" TEXT,
    "start_time" TIMESTAMP(3),
    "status" TEXT,
    "topline_id" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facebook_ads_campaigns_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_campaigns_campaign_id_key" ON "marketing"."facebook_ads_campaigns"("campaign_id");
