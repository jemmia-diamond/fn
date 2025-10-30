-- AddForeignKey
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_misa_user_fkey" FOREIGN KEY ("user_id") REFERENCES "misa"."users"("haravan_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_haravan_user_fkey" FOREIGN KEY ("user_id") REFERENCES "haravan"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
