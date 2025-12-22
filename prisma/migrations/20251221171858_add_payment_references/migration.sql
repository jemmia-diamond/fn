-- AlterTable
ALTER TABLE "ecom"."qr_generator" ADD COLUMN     "payment_references" JSONB;

-- AlterTable
ALTER TABLE "payment"."manual_payments" ADD COLUMN     "payment_references" JSONB;