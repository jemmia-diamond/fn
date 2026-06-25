-- CreateTable
CREATE TABLE "marketing"."facebook_ads_ads" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "adset_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "configured_status" TEXT,
    "effective_status" TEXT,
    "creative" JSONB,
    "creative_asset_groups_spec" JSONB,
    "conversion_domain" TEXT,
    "tracking_specs" JSONB,
    "ad_schedule_start_time" TIMESTAMP(3),
    "ad_schedule_end_time" TIMESTAMP(3),
    "ad_active_time" TEXT,
    "adlabels" JSONB,
    "ad_review_feedback" JSONB,
    "issues_info" JSONB,
    "source_ad_id" TEXT,
    "preview_shareable_link" TEXT,
    "display_sequence" INTEGER,
    "recommendations" JSONB,
    "created_time" TIMESTAMP(3),
    "updated_time" TIMESTAMP(3),
    "last_updated_by_app_id" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facebook_ads_ads_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "facebook_ads_ads_id_key" ON "marketing"."facebook_ads_ads"("id");
