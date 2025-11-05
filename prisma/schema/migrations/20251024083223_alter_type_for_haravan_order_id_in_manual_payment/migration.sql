/*
  Warnings:

  - The `haravan_order_id` column on the `manual_payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "payment"."manual_payments"
ALTER COLUMN "haravan_order_id" TYPE BIGINT USING "haravan_order_id"::BIGINT;
