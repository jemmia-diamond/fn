-- Add Foreign Keys
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_misa_user_fkey" FOREIGN KEY ("user_id") REFERENCES "misa"."users"("haravan_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_haravan_user_fkey" FOREIGN KEY ("user_id") REFERENCES "haravan"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
