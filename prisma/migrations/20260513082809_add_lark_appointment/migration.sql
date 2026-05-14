/*
  Warnings:

  - You are about to drop the `exchange_rate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "market_data"."exchange_rate";

-- DropTable
DROP TABLE "market_data"."gold_pricing";

-- CreateTable
CREATE TABLE "larksuite"."larksuiteAppointment" (
    "record_id" TEXT NOT NULL,
    "store" VARCHAR(200) NOT NULL DEFAULT '',
    "name" VARCHAR(200) NOT NULL DEFAULT '',
    "phone_number" VARCHAR(200) NOT NULL DEFAULT '',
    "gender" VARCHAR(200) NOT NULL DEFAULT '',
    "product_images" JSONB,
    "note" VARCHAR(200),
    "date_time" TIMESTAMP(6),
    "conversation_greeting" VARCHAR(200),
    "customer_response" VARCHAR(200),
    "main_sales" JSONB,
    "offline_sales" JSONB,
    "status" TEXT,
    "created_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "larksuiteAppointment_pkey" PRIMARY KEY ("record_id")
);

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
