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