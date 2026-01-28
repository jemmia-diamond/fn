-- CreateTable
CREATE TABLE "misa"."accounts_payable_details" (
    "id" SERIAL NOT NULL,
    "account_object_code" VARCHAR(50) NOT NULL,
    "page_index" INTEGER NOT NULL,
    "session_id" UUID NOT NULL,
    "data_details" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_payable_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_payable_details_data_details_idx" ON "misa"."accounts_payable_details" USING GIN ("data_details");

-- CreateIndex
CREATE UNIQUE INDEX "unique_payable_account_page" ON "misa"."accounts_payable_details"("account_object_code", "page_index");
