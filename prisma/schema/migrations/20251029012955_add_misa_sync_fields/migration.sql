-- AlterTable
ALTER TABLE "payment"."manual_payments" ADD COLUMN     "misa_synced_at" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "ecom"."qr_generator"
  ADD COLUMN  "misa_synced" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN  "misa_synced_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN  "misa_sync_guid" VARCHAR(255),
  ADD COLUMN  "misa_sync_error_msg" TEXT;
