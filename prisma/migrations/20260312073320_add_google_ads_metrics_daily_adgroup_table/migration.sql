-- CreateTable
CREATE TABLE "marketing"."google_ads_metrics_daily_adgroup" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "ad_group_id" TEXT NOT NULL,
    "ad_group_name" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "ad_network_type" TEXT NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "active_view_impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cost_micros" BIGINT NOT NULL DEFAULT 0,
    "average_cpc" BIGINT NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "all_conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "conversions_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "search_impression_share" DOUBLE PRECISION,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_ads_metrics_daily_adgroup_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_adgroup_date_idx" ON "marketing"."google_ads_metrics_daily_adgroup"("date");

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_adgroup_campaign_id_idx" ON "marketing"."google_ads_metrics_daily_adgroup"("campaign_id");

-- CreateIndex
CREATE INDEX "google_ads_metrics_daily_adgroup_ad_group_id_idx" ON "marketing"."google_ads_metrics_daily_adgroup"("ad_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_metrics_daily_adgroup_date_ad_group_id_device_ad_key" ON "marketing"."google_ads_metrics_daily_adgroup"("date", "ad_group_id", "device", "ad_network_type");
