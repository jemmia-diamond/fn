-- DropForeignKey
ALTER TABLE "ecom"."qr_generator" DROP CONSTRAINT "qr_generator_haravan_order_id_fkey";

-- DropForeignKey
ALTER TABLE "payment"."manual_payments" DROP CONSTRAINT "manual_payments_haravan_order_id_fkey";
