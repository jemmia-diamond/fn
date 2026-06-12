/*
  Warnings:

  - You are about to drop the `exchange_rate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `gold_pricing` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "pancake"."page_customer" ADD COLUMN     "phone_normalize" VARCHAR(255),
ADD COLUMN     "phone_numbers_normalize" JSONB;
