-- AlterTable
ALTER TABLE "payment"."manual_payment" ADD COLUMN     "misa_sync_error_msg" TEXT,
ADD COLUMN     "misa_sync_guid" VARCHAR(255),
ADD COLUMN     "misa_synced" BOOLEAN NOT NULL DEFAULT false;
