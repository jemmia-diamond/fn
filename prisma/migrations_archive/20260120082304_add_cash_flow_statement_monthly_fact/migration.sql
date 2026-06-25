-- CreateTable
CREATE TABLE "misa"."cash_flow_monthly_fact" (
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
    "hidden" BOOLEAN,
    "is_bold" BOOLEAN,
    "is_italic" BOOLEAN,
    "sort_order" INTEGER,
    "from_date" TIMESTAMPTZ(6),
    "to_date" TIMESTAMPTZ(6),
    "sync_at" TIMESTAMPTZ(6),

    CONSTRAINT "cash_flow_monthly_fact_pkey" PRIMARY KEY ("time_id","item_name")
);
