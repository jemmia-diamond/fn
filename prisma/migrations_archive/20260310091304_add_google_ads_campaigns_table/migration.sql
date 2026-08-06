-- CreateTable
CREATE TABLE "marketing"."google_ads_campaigns" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT,
    "channel_type" TEXT,
    "channel_sub_type" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_ads_campaigns_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_campaigns_id_key" ON "marketing"."google_ads_campaigns"("id");
