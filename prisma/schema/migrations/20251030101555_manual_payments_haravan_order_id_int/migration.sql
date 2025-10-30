/*
  Warnings:

  - You are about to alter the column `haravan_order_id` on the `manual_payments` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "payment"."manual_payments" ALTER COLUMN "haravan_order_id" SET DATA TYPE INTEGER;
