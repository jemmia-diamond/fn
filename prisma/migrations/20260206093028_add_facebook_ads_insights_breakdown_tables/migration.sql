/*
  Warnings:

  - The `conversions` column on the `facebook_ads_insights_ad_level_daily` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `conversion_values` column on the `facebook_ads_insights_ad_level_daily` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `conversions` column on the `facebook_ads_insights_daily` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `conversion_values` column on the `facebook_ads_insights_daily` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `exchange_rate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_pricing` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `account_name` to the `facebook_ads_ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adset_name` to the `facebook_ads_ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaign_name` to the `facebook_ads_ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_name` to the `facebook_ads_adsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `campaign_name` to the `facebook_ads_adsets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_name` to the `facebook_ads_campaigns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `facebook_ads_insights_ad_level_daily` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_name` to the `facebook_ads_insights_ad_level_daily` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_id` to the `facebook_ads_insights_daily` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_name` to the `facebook_ads_insights_daily` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "marketing"."facebook_ads_ads" ADD COLUMN     "account_name" TEXT NOT NULL,
ADD COLUMN     "adset_name" TEXT NOT NULL,
ADD COLUMN     "campaign_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "marketing"."facebook_ads_adsets" ADD COLUMN     "account_name" TEXT NOT NULL,
ADD COLUMN     "campaign_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "marketing"."facebook_ads_campaigns" ADD COLUMN     "account_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "marketing"."facebook_ads_insights_ad_level_daily" ADD COLUMN     "account_id" TEXT NOT NULL,
ADD COLUMN     "account_name" TEXT NOT NULL,
DROP COLUMN "conversions",
ADD COLUMN     "conversions" JSONB,
DROP COLUMN "conversion_values",
ADD COLUMN     "conversion_values" JSONB;

-- AlterTable
ALTER TABLE "marketing"."facebook_ads_insights_daily" ADD COLUMN     "account_id" TEXT NOT NULL,
ADD COLUMN     "account_name" TEXT NOT NULL,
DROP COLUMN "conversions",
ADD COLUMN     "conversions" JSONB,
DROP COLUMN "conversion_values",
ADD COLUMN     "conversion_values" JSONB;

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
CREATE TABLE "marketing"."facebook_ads_insights_demographic" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "ad_name" TEXT,
    "adset_id" TEXT NOT NULL,
    "adset_name" TEXT,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT,
    "date" DATE NOT NULL,
    "age" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "spend" DECIMAL(18,2),
    "impressions" BIGINT,
    "clicks" BIGINT,
    "reach" BIGINT,
    "frequency" DECIMAL(10,4),
    "inline_link_clicks" BIGINT,
    "inline_link_click_ctr" DECIMAL(10,4),
    "cpc" DECIMAL(18,6),
    "cpm" DECIMAL(18,6),
    "cpp" DECIMAL(18,6),
    "ctr" DECIMAL(10,4),
    "cost_per_inline_link_click" DECIMAL(18,6),
    "conversions" JSONB,
    "conversion_values" JSONB,
    "cost_per_conversion" DECIMAL(18,6),
    "purchase" BIGINT,
    "purchase_roas" JSONB,
    "actions" JSONB,
    "action_values" JSONB,
    "conversions_by_type" JSONB,
    "date_start" DATE,
    "date_stop" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facebook_ads_insights_demographic_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "marketing"."facebook_ads_insights_device" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "ad_name" TEXT,
    "adset_id" TEXT NOT NULL,
    "adset_name" TEXT,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT,
    "date" DATE NOT NULL,
    "publisher_platform" TEXT NOT NULL,
    "platform_position" TEXT NOT NULL,
    "device_platform" TEXT NOT NULL,
    "spend" DECIMAL(18,2),
    "impressions" BIGINT,
    "clicks" BIGINT,
    "reach" BIGINT,
    "frequency" DECIMAL(10,4),
    "inline_link_clicks" BIGINT,
    "inline_link_click_ctr" DECIMAL(10,4),
    "cpc" DECIMAL(18,6),
    "cpm" DECIMAL(18,6),
    "cpp" DECIMAL(18,6),
    "ctr" DECIMAL(10,4),
    "cost_per_inline_link_click" DECIMAL(18,6),
    "conversions" JSONB,
    "conversion_values" JSONB,
    "cost_per_conversion" DECIMAL(18,6),
    "purchase" BIGINT,
    "purchase_roas" JSONB,
    "actions" JSONB,
    "action_values" JSONB,
    "conversions_by_type" JSONB,
    "date_start" DATE,
    "date_stop" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facebook_ads_insights_device_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "marketing"."facebook_ads_insights_geo" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "ad_name" TEXT,
    "adset_id" TEXT NOT NULL,
    "adset_name" TEXT,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT,
    "date" DATE NOT NULL,
    "country" TEXT,
    "region" TEXT,
    "spend" DECIMAL(18,2),
    "impressions" BIGINT,
    "clicks" BIGINT,
    "reach" BIGINT,
    "frequency" DECIMAL(10,4),
    "inline_link_clicks" BIGINT,
    "inline_link_click_ctr" DECIMAL(10,4),
    "cpc" DECIMAL(18,6),
    "cpm" DECIMAL(18,6),
    "cpp" DECIMAL(18,6),
    "ctr" DECIMAL(10,4),
    "cost_per_inline_link_click" DECIMAL(18,6),
    "conversions" JSONB,
    "conversion_values" JSONB,
    "cost_per_conversion" DECIMAL(18,6),
    "purchase" BIGINT,
    "purchase_roas" JSONB,
    "actions" JSONB,
    "action_values" JSONB,
    "conversions_by_type" JSONB,
    "date_start" DATE,
    "date_stop" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facebook_ads_insights_geo_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "marketDataExchangeRate_time_idx" ON "market_data"."marketDataExchangeRate"("time" DESC);

-- CreateIndex
CREATE INDEX "marketDataGoldPricing_time_idx" ON "market_data"."marketDataGoldPricing"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "marketDataGoldPricing_location_gold_type_time_key" ON "market_data"."marketDataGoldPricing"("location", "gold_type", "time");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_demographic_date_idx" ON "marketing"."facebook_ads_insights_demographic"("date");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_demographic_ad_id_idx" ON "marketing"."facebook_ads_insights_demographic"("ad_id");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_demographic_campaign_id_idx" ON "marketing"."facebook_ads_insights_demographic"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_insights_demographic_ad_id_date_age_gender_key" ON "marketing"."facebook_ads_insights_demographic"("ad_id", "date", "age", "gender");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_device_date_idx" ON "marketing"."facebook_ads_insights_device"("date");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_device_ad_id_idx" ON "marketing"."facebook_ads_insights_device"("ad_id");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_device_campaign_id_idx" ON "marketing"."facebook_ads_insights_device"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_insights_device_ad_id_date_publisher_platform__key" ON "marketing"."facebook_ads_insights_device"("ad_id", "date", "publisher_platform", "platform_position", "device_platform");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_geo_date_idx" ON "marketing"."facebook_ads_insights_geo"("date");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_geo_ad_id_idx" ON "marketing"."facebook_ads_insights_geo"("ad_id");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_geo_campaign_id_idx" ON "marketing"."facebook_ads_insights_geo"("campaign_id");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_geo_country_idx" ON "marketing"."facebook_ads_insights_geo"("country");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_insights_geo_ad_id_date_country_region_key" ON "marketing"."facebook_ads_insights_geo"("ad_id", "date", "country", "region");
