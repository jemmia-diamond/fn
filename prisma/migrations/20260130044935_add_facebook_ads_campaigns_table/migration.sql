/*
  Warnings:

  - You are about to drop the `exchange_rate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "marketing";

-- DropTable
DROP TABLE "market_data"."exchange_rate";

-- DropTable
DROP TABLE "market_data"."gold_pricing";

-- CreateTable
CREATE TABLE "market_data"."marketDataExchangeRate" (
    "time" TIMESTAMP(6) NOT NULL,
    "code" VARCHAR,
    "bank" VARCHAR,
    "buy" DECIMAL,
    "sell" DECIMAL,
    "transfer" DECIMAL,
    "created_at" TIMESTAMP(6)
);

-- CreateTable
CREATE TABLE "market_data"."marketDataGoldPricing" (
    "time" TIMESTAMPTZ(6) NOT NULL,
    "location" VARCHAR,
    "gold_type" VARCHAR,
    "buy" DECIMAL,
    "sell" DECIMAL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6)
);

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
CREATE INDEX "marketDataExchangeRate_time_idx" ON "market_data"."marketDataExchangeRate"("time" DESC);

-- CreateIndex
CREATE INDEX "marketDataGoldPricing_time_idx" ON "market_data"."marketDataGoldPricing"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "marketDataGoldPricing_location_gold_type_time_key" ON "market_data"."marketDataGoldPricing"("location", "gold_type", "time");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_campaigns_id_key" ON "marketing"."facebook_ads_campaigns"("id");
