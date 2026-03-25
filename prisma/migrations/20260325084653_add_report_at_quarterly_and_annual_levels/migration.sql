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
CREATE TABLE "misa"."balance_sheet_quarterly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "item_index" INTEGER,
    "description" TEXT,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "category" INTEGER,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "quarter" INTEGER,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "balance_sheet_quarterly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."balance_sheet_yearly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "item_index" INTEGER,
    "description" TEXT,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "category" INTEGER,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "balance_sheet_yearly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."income_statement_quarterly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "quarter" INTEGER,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_statement_quarterly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."income_statement_yearly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "year" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_statement_yearly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."cash_flow_quarterly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR,
    "item_name" VARCHAR NOT NULL,
    "item_index" INTEGER,
    "description" TEXT,
    "category" INTEGER,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "formula" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "quarter" INTEGER,
    "year" INTEGER,
    "hidden" BOOLEAN,
    "is_bold" BOOLEAN,
    "is_italic" BOOLEAN,
    "sort_order" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "cash_flow_quarterly_fact_pkey" PRIMARY KEY ("time_id","item_name")
);

-- CreateTable
CREATE TABLE "misa"."cash_flow_yearly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR,
    "item_name" VARCHAR NOT NULL,
    "item_index" INTEGER,
    "description" TEXT,
    "category" INTEGER,
    "formula_type" INTEGER,
    "formula_front_end" TEXT,
    "formula" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "year" INTEGER,
    "hidden" BOOLEAN,
    "is_bold" BOOLEAN,
    "is_italic" BOOLEAN,
    "sort_order" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "cash_flow_yearly_fact_pkey" PRIMARY KEY ("time_id","item_name")
);

-- CreateIndex
CREATE INDEX "marketDataExchangeRate_time_idx" ON "market_data"."marketDataExchangeRate"("time" DESC);

-- CreateIndex
CREATE INDEX "marketDataGoldPricing_time_idx" ON "market_data"."marketDataGoldPricing"("time" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "marketDataGoldPricing_location_gold_type_time_key" ON "market_data"."marketDataGoldPricing"("location", "gold_type", "time");
