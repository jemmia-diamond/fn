-- CreateTable
CREATE TABLE "marketing"."google_ads_ads" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id" TEXT NOT NULL,
    "ad_group_id" TEXT NOT NULL,
    "ad_group_name" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "status" TEXT,
    "type" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_ads_ads_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_ads_id_key" ON "marketing"."google_ads_ads"("id");
