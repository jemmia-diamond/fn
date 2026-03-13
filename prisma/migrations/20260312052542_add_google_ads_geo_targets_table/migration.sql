-- CreateTable
CREATE TABLE "marketing"."google_ads_geo_targets" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "criterion_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "canonical_name" TEXT,
    "country_code" TEXT,
    "target_type" TEXT,
    "status" TEXT,
    "parent_id" TEXT,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "google_ads_geo_targets_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "google_ads_geo_targets_criterion_id_key" ON "marketing"."google_ads_geo_targets"("criterion_id");

-- CreateIndex
CREATE INDEX "google_ads_geo_targets_country_code_idx" ON "marketing"."google_ads_geo_targets"("country_code");

-- CreateIndex
CREATE INDEX "google_ads_geo_targets_target_type_idx" ON "marketing"."google_ads_geo_targets"("target_type");
