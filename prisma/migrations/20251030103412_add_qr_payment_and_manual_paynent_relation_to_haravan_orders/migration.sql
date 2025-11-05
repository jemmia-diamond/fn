-- AddForeignKey
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment"."manual_payments" ADD CONSTRAINT "manual_payments_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
