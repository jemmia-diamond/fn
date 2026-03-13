-- CreateTable
CREATE TABLE "marketing"."google_ads_metrics_daily_geo" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "ad_group_id" TEXT NOT NULL,
    "ad_group_name" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "ad_network_type" TEXT NOT NULL,
    "geo_target_city" TEXT,
    "geo_target_region" TEXT,
    "country_criterion_id" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_micros" BIGINT NOT NULL DEFAULT 0,
    "average_cpc" BIGINT NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "all_conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversions_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_ads_metrics_daily_geo_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_geo_date_idx" ON "marketing"."google_ads_metrics_daily_geo"("date");

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_geo_campaign_id_idx" ON "marketing"."google_ads_metrics_daily_geo"("campaign_id");

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_geo_ad_group_id_idx" ON "marketing"."google_ads_metrics_daily_geo"("ad_group_id");

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_geo_country_criterion_id_idx" ON "marketing"."google_ads_metrics_daily_geo"("country_criterion_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_metrics_daily_geo_date_campaign_id_ad_group_id_d_key" ON "marketing"."google_ads_metrics_daily_geo"("date", "campaign_id", "ad_group_id", "device", "ad_network_type", "geo_target_city", "geo_target_region", "country_criterion_id");
