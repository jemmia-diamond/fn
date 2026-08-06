-- AlterTable
ALTER TABLE "payment"."manual_payments" ADD COLUMN     "gateway" VARCHAR(255),
ADD COLUMN     "payment_entry_name" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "manual_payments_payment_entry_name_key" ON "payment"."manual_payments"("payment_entry_name");
