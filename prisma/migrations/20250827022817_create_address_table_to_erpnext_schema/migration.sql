-- CreateTable
CREATE TABLE "erpnext"."addresses" (
    "uuid" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255),
    "creation" TIMESTAMP(6),
    "modified" TIMESTAMP(6),
    "modified_by" VARCHAR(255),
    "docstatus" INTEGER,
    "idx" INTEGER,
    "address_type" VARCHAR(255),
    "address_name" VARCHAR(255),
    "phone" VARCHAR(255),
    "email_id" VARCHAR(255),
    "address_line2" TEXT,
    "address_title" VARCHAR(255),
    "city" VARCHAR(255),
    "county" VARCHAR(255),
    "state" VARCHAR(255),
    "pincode" VARCHAR(255),
    "country" VARCHAR(255),
    "province" VARCHAR(255),
    "district" VARCHAR(255),
    "ward" VARCHAR(255),
    "address_line1" TEXT,
    "fax" VARCHAR(255),
    "tax_category" VARCHAR(255),
    "is_primary_address" INTEGER,
    "is_shipping_address" INTEGER,
    "disabled" INTEGER,
    "haravan_id" VARCHAR(255),
    "is_your_company_address" INTEGER,
    "links" JSONB,
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "addresses_name_key" ON "erpnext"."addresses"("name");
