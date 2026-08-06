-- CreateTable
CREATE TABLE "marketing"."facebook_ads_insights_ad_level_daily" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "adset_id" TEXT NOT NULL,
    "adset_name" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "ad_name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "spend" DECIMAL(18,2),
    "impressions" BIGINT,
    "clicks" BIGINT,
    "reach" BIGINT,
    "frequency" DECIMAL(10,4),
    "inline_link_clicks" BIGINT,
    "inline_link_click_ctr" DECIMAL(10,4),
    "cost_per_inline_link_click" DECIMAL(18,6),
    "cpc" DECIMAL(18,6),
    "cpm" DECIMAL(18,6),
    "cpp" DECIMAL(18,6),
    "ctr" DECIMAL(10,4),
    "conversions" BIGINT,
    "conversion_values" DECIMAL(18,2),
    "cost_per_conversion" DECIMAL(18,6),
    "purchase" BIGINT,
    "video_30_sec_watched_actions" BIGINT,
    "video_p25_watched_actions" BIGINT,
    "video_p50_watched_actions" BIGINT,
    "video_p75_watched_actions" BIGINT,
    "video_p100_watched_actions" BIGINT,
    "video_avg_time_watched_actions" DECIMAL(10,2),
    "post_engagements" BIGINT,
    "post_reactions" BIGINT,
    "post_comments" BIGINT,
    "post_shares" BIGINT,
    "page_likes" BIGINT,
    "actions" JSONB,
    "action_values" JSONB,
    "conversions_by_type" JSONB,
    "purchase_roas" JSONB,
    "date_start" DATE,
    "date_stop" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facebook_ads_insights_ad_level_daily_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "facebook_ads_insights_ad_level_daily_campaign_id_date_idx" ON "marketing"."facebook_ads_insights_ad_level_daily"("campaign_id", "date");

-- CreateIndex
CREATE INDEX "facebook_ads_insights_ad_level_daily_adset_id_date_idx" ON "marketing"."facebook_ads_insights_ad_level_daily"("adset_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_insights_ad_level_daily_ad_id_date_key" ON "marketing"."facebook_ads_insights_ad_level_daily"("ad_id", "date");
