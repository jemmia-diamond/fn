-- CreateTable
CREATE TABLE "erpnext"."lead_demands" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "demand_label" VARCHAR(255),
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_demands_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."lead_budgets" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "budget_label" VARCHAR(255),
    "budget_from" DECIMAL(18,6),
    "budget_to" DECIMAL(18,6),
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "lead_budgets_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."provinces" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "province_name" VARCHAR(255),
    "region" VARCHAR(255) NOT NULL,
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."regions" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "region_name" VARCHAR(255) NOT NULL,
    "database_created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "regions_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_demands_name_key" ON "erpnext"."lead_demands"("name");

-- CreateIndex
CREATE INDEX "lead_demands_name_idx" ON "erpnext"."lead_demands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lead_budgets_name_key" ON "erpnext"."lead_budgets"("name");

-- CreateIndex
CREATE INDEX "lead_budgets_name_idx" ON "erpnext"."lead_budgets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "erpnext"."provinces"("name");

-- CreateIndex
CREATE INDEX "provinces_name_idx" ON "erpnext"."provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "erpnext"."regions"("name");

-- CreateIndex
CREATE INDEX "regions_name_idx" ON "erpnext"."regions"("name");
