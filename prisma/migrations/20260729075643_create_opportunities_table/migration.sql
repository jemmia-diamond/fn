-- CreateTable
CREATE TABLE "erpnext"."opportunities" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "naming_series" VARCHAR(255),
    "doctype" VARCHAR(50),
    "opportunity_from" VARCHAR(255),
    "transaction_date" TIMESTAMP(6),
    "opportunity_owner" VARCHAR(255),
    "support_sales" JSONB,
    "party_name" VARCHAR(255),
    "customer_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "contact_email" VARCHAR(255),
    "gender" VARCHAR(50),
    "age_rage" VARCHAR(50),
    "status" VARCHAR(50),
    "purpose_lead" VARCHAR(255),
    "lead_budget" VARCHAR(255),
    "province" VARCHAR(255),
    "preferred_product_type" JSONB,
    "expected_delivery_date" DATE,
    "opportunity_amount" DECIMAL(18,6),
    "notes" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_name_key" ON "erpnext"."opportunities"("name");

-- CreateIndex
CREATE INDEX "opportunities_name_idx" ON "erpnext"."opportunities"("name");

-- CreateIndex
CREATE INDEX "opportunities_opportunity_from_idx" ON "erpnext"."opportunities"("opportunity_from");

-- CreateIndex
CREATE INDEX "opportunities_party_name_idx" ON "erpnext"."opportunities"("party_name");

-- CreateIndex
CREATE INDEX "opportunities_phone_idx" ON "erpnext"."opportunities"("phone");

-- CreateIndex
CREATE INDEX "opportunities_status_idx" ON "erpnext"."opportunities"("status");
