/*
  Warnings:

  - You are about to drop the `exchange_rate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "pancake"."conversation" ADD COLUMN     "last_customer_message_at" TIMESTAMP(6),
ADD COLUMN     "last_sales_message_at" TIMESTAMP(6);
