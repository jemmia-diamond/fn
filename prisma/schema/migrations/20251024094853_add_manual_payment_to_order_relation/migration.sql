-- AddForeignKey
ALTER TABLE "payment"."manual_payments" ADD CONSTRAINT "manual_payments_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
