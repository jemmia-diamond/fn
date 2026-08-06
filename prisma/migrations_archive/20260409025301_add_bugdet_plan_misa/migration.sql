
-- CreateTable
CREATE TABLE "misa"."budget_plan" (
    "session_id" UUID,
    "detail_id" INTEGER,
    "item_id" UUID,
    "item_code" VARCHAR(50) NOT NULL,
    "item_type" INTEGER,
    "item_name" VARCHAR(255),
    "item_name_english" VARCHAR(255),
    "item_name_chinese" VARCHAR(255),
    "item_name_korean" VARCHAR(255),
    "is_bold" BOOLEAN,
    "grade" INTEGER,
    "year" INTEGER NOT NULL,
    "total_plan_amount" DECIMAL(36,8),
    "m01_plan_amount" DECIMAL(36,8),
    "m02_plan_amount" DECIMAL(36,8),
    "m03_plan_amount" DECIMAL(36,8),
    "m04_plan_amount" DECIMAL(36,8),
    "m05_plan_amount" DECIMAL(36,8),
    "m06_plan_amount" DECIMAL(36,8),
    "m07_plan_amount" DECIMAL(36,8),
    "m08_plan_amount" DECIMAL(36,8),
    "m09_plan_amount" DECIMAL(36,8),
    "m10_plan_amount" DECIMAL(36,8),
    "m11_plan_amount" DECIMAL(36,8),
    "m12_plan_amount" DECIMAL(36,8),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_plan_pkey" PRIMARY KEY ("item_code","year")
);

-- CreateIndex
CREATE INDEX "budget_plan_session_id_idx" ON "misa"."budget_plan"("session_id");
