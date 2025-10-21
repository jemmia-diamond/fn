-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payment";

-- CreateTable
CREATE TABLE "payment"."manual_payment" (
    "uuid" UUID NOT NULL,
    "payment_type" VARCHAR(255),
    "branch" VARCHAR(255),
    "shipping_code" VARCHAR(255),
    "send_date" TIMESTAMP(6),
    "receive_date" TIMESTAMP(6),
    "created_date" TIMESTAMP(6),
    "updated_date" TIMESTAMP(6),
    "bank_account" VARCHAR(255),
    "bank_name" VARCHAR(255),
    "transfer_amount" DECIMAL(18,6),
    "transfer_note" TEXT,
    "haravan_order_id" VARCHAR(255),
    "haravan_order_name" VARCHAR(255),
    "transfer_status" VARCHAR(255),
    "lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,

    CONSTRAINT "manual_payment_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "manual_payment_lark_record_id_key" ON "payment"."manual_payment"("lark_record_id");

-- CreateIndex
CREATE INDEX "manual_payment_uuid_idx" ON "payment"."manual_payment"("uuid");
