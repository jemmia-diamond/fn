-- AlterTable
ALTER TABLE "ecom"."qr_generator"
ADD COLUMN     "misa_sync_error_msg" TEXT,
ADD COLUMN     "misa_synced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "misa_sync_guid" VARCHAR(255);
