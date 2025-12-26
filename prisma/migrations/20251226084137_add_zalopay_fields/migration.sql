-- AlterTable
ALTER TABLE "payment"."sepay_transaction" ADD COLUMN     "app_id" INTEGER,
ADD COLUMN     "app_time" BIGINT,
ADD COLUMN     "app_user" VARCHAR(255),
ADD COLUMN     "channel" INTEGER,
ADD COLUMN     "discount_amount" BIGINT,
ADD COLUMN     "embed_data" JSONB,
ADD COLUMN     "item" JSONB,
ADD COLUMN     "merchant_user_id" VARCHAR(255),
ADD COLUMN     "server_time" BIGINT,
ADD COLUMN     "user_fee_amount" BIGINT,
ADD COLUMN     "zp_trans_id" BIGINT;

-- DropTable
DROP TABLE "market_data"."exchange_rate";

-- DropTable
DROP TABLE "market_data"."gold_pricing";

-- DropTable
DROP TABLE "workplace"."_nc_m2m_haravan_collect_products";

-- DropTable
DROP TABLE "workplace"."collections";

-- DropTable
DROP TABLE "workplace"."design_details";

-- DropTable
DROP TABLE "workplace"."design_images";

-- DropTable
DROP TABLE "workplace"."design_melee_details";

-- DropTable
DROP TABLE "workplace"."design_price_estimation";

-- DropTable
DROP TABLE "workplace"."design_set";

-- DropTable
DROP TABLE "workplace"."designs";

-- DropTable
DROP TABLE "workplace"."designs_temporary_products";

-- DropTable
DROP TABLE "workplace"."diamond_price_list";

-- DropTable
DROP TABLE "workplace"."diamonds";

-- DropTable
DROP TABLE "workplace"."ecom_360";

-- DropTable
DROP TABLE "workplace"."ecom_old_products";

-- DropTable
DROP TABLE "workplace"."haravan_collections";

-- DropTable
DROP TABLE "workplace"."hrv_locations_1";

-- DropTable
DROP TABLE "workplace"."jewelries";

-- DropTable
DROP TABLE "workplace"."materials";

-- DropTable
DROP TABLE "workplace"."melee_diamonds";

-- DropTable
DROP TABLE "workplace"."moissanite";

-- DropTable
DROP TABLE "workplace"."moissanite_serials";

-- DropTable
DROP TABLE "workplace"."products";

-- DropTable
DROP TABLE "workplace"."promotions";

-- DropTable
DROP TABLE "workplace"."sets";

-- DropTable
DROP TABLE "workplace"."size_details";

-- DropTable
DROP TABLE "workplace"."submitted_codes";

-- DropTable
DROP TABLE "workplace"."temporary_products";

-- DropTable
DROP TABLE "workplace"."temporary_products_web";

-- DropTable
DROP TABLE "workplace"."temtab";

-- DropTable
DROP TABLE "workplace"."variant_serials";

-- DropTable
DROP TABLE "workplace"."variant_serials_lark";

-- DropTable
DROP TABLE "workplace"."variants";

-- DropTable
DROP TABLE "workplace"."wedding_rings";

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

-- CreateIndex
CREATE INDEX "marketDataExchangeRate_time_idx" ON "market_data"."marketDataExchangeRate"("time" DESC);

-- CreateIndex
CREATE INDEX "marketDataGoldPricing_time_idx" ON "market_data"."marketDataGoldPricing"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "marketDataGoldPricing_location_gold_type_time_key" ON "market_data"."marketDataGoldPricing"("location", "gold_type", "time");
