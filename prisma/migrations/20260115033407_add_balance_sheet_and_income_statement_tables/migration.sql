
-- CreateTable
CREATE TABLE "misa"."balance_sheet_monthly_fact" (
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
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "balance_sheet_monthly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);

-- CreateTable
CREATE TABLE "misa"."income_statement_monthly_fact" (
    "time_id" INTEGER NOT NULL,
    "item_code" VARCHAR NOT NULL,
    "item_name" TEXT,
    "amount" DECIMAL,
    "prev_amount" DECIMAL,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "income_statement_monthly_fact_pkey" PRIMARY KEY ("time_id","item_code")
);
