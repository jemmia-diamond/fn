-- AlterTable
ALTER TABLE "ecom"."qr_generator" ADD COLUMN     "refund_amount" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "payment"."manual_payments" ADD COLUMN     "refund_amount" DECIMAL(12,2);
