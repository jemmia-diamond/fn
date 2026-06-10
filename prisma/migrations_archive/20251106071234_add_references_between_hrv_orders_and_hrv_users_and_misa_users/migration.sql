-- Adding relation between misa_user - haravan_users - haravan_orders

-- AddForeignKey
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_haravan_user_fkey" FOREIGN KEY ("user_id") REFERENCES "haravan"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "misa"."users" ADD CONSTRAINT "misa_user_user_fkey" FOREIGN KEY ("haravan_id") REFERENCES "haravan"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

