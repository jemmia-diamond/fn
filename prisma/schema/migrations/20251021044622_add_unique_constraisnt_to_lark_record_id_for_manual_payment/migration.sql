/*
  Warnings:

  - A unique constraint covering the columns `[lark_record_id]` on the table `manual_payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "manual_payment_lark_record_id_key" ON "payment"."manual_payment"("lark_record_id");
