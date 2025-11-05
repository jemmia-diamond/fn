-- CreateTable
CREATE TABLE "erpnext"."promotions" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" VARCHAR(255),
    "scope" VARCHAR(255),
    "is_active" INTEGER,
    "is_expired" INTEGER,
    "priority" VARCHAR(255),
    "discount_type" VARCHAR(255),
    "discount_amount" DECIMAL(18,6),
    "discount_percent" DECIMAL(18,6),
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "bizfly_id" VARCHAR(255),

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."purchase_purposes" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" VARCHAR(255),

    CONSTRAINT "purchase_purposes_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."product_categories" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "title" VARCHAR(255),

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_name_key" ON "erpnext"."promotions"("name");

-- CreateIndex
CREATE INDEX "promotions_name_idx" ON "erpnext"."promotions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_purposes_name_key" ON "erpnext"."purchase_purposes"("name");

-- CreateIndex
CREATE INDEX "purchase_purposes_name_idx" ON "erpnext"."purchase_purposes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_name_key" ON "erpnext"."product_categories"("name");

-- CreateIndex
CREATE INDEX "product_categories_name_idx" ON "erpnext"."product_categories"("name");
