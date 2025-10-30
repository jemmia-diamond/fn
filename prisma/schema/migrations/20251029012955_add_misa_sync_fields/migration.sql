-- Create schemas if they do not exist to make the migration replayable
CREATE SCHEMA IF NOT EXISTS "payment";
CREATE SCHEMA IF NOT EXISTS "ecom";

-- CreateTable
-- Create the table only if it doesn't exist.
CREATE TABLE IF NOT EXISTS "payment"."manual_payments" (
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

    CONSTRAINT "manual_payments_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "manual_payments_lark_record_id_key" ON "payment"."manual_payments"("lark_record_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "manual_payments_uuid_idx" ON "payment"."manual_payments"("uuid");

-- AlterTable
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns WHERE table_schema = 'payment' AND table_name = 'manual_payments' AND column_name = 'misa_synced_at'
    ) THEN
        ALTER TABLE "payment"."manual_payments" ADD COLUMN "misa_synced_at" TIMESTAMP(6);
    END IF;
END;
$$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ecom"."qr_generator" (
    "id" VARCHAR NOT NULL,
    "bank_code" VARCHAR,
    "bank_account_number" VARCHAR,
    "customer_name" VARCHAR,
    "customer_phone_number" VARCHAR,
    "transfer_amount" BIGINT,
    "transfer_note" VARCHAR,
    "transfer_status" VARCHAR,
    "haravan_order_number" VARCHAR,
    "haravan_order_status" VARCHAR,
    "haravan_order_id" BIGINT,
    "haravan_order_total_price" BIGINT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),
    "is_deleted" BOOLEAN,
    "qr_url" TEXT,
    "lark_record_id" VARCHAR(255),
    "all_lark_record_id" VARCHAR(255),
    "misa_synced" BOOLEAN NOT NULL DEFAULT false,
    "misa_synced_at" TIMESTAMP(6),
    "misa_sync_guid" VARCHAR(255),
    "misa_sync_error_msg" TEXT,

    CONSTRAINT "qr_generator_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ix_ecom_qr_generator_id" ON "ecom"."qr_generator"("id");

-- AlterTable - Add columns to 'qr_generator' only if they do not already exist.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ecom' AND table_name = 'qr_generator' AND column_name = 'misa_synced') THEN
        ALTER TABLE "ecom"."qr_generator" ADD COLUMN "misa_synced" BOOLEAN NOT NULL DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ecom' AND table_name = 'qr_generator' AND column_name = 'misa_synced_at') THEN
        ALTER TABLE "ecom"."qr_generator" ADD COLUMN "misa_synced_at" TIMESTAMP(6);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ecom' AND table_name = 'qr_generator' AND column_name = 'misa_sync_guid') THEN
        ALTER TABLE "ecom"."qr_generator" ADD COLUMN "misa_sync_guid" VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'ecom' AND table_name = 'qr_generator' AND column_name = 'misa_sync_error_msg') THEN
        ALTER TABLE "ecom"."qr_generator" ADD COLUMN "misa_sync_error_msg" TEXT;
    END IF;
END;
$$;
