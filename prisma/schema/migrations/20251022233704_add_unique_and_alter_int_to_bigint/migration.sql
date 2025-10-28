-- AlterTable
ALTER TABLE "ecom"."qr_generator" ALTER COLUMN "haravan_order_id" SET DATA TYPE BIGINT;
ALTER TABLE "haravan"."orders" ALTER COLUMN "id" SET DATA TYPE BIGINT;
ALTER TABLE "haravan"."users" ALTER COLUMN "id" SET DATA TYPE BIGINT;
ALTER TABLE "misa"."users" ALTER COLUMN "haravan_id" SET DATA TYPE BIGINT;

-- Create Indexes
CREATE INDEX IF NOT EXISTS "ix_ecom_qr_generator_id" ON "ecom"."qr_generator"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "ix_haravan_customers_id" ON "haravan"."customers"("id");
CREATE INDEX IF NOT EXISTS "ix_haravan_customers_uuid" ON "haravan"."customers"("uuid");
CREATE UNIQUE INDEX IF NOT EXISTS "ix_haravan_orders_id" ON "haravan"."orders"("id");
CREATE UNIQUE INDEX IF NOT EXISTS "ix_haravan_users_id" ON "haravan"."users"("id");
CREATE INDEX IF NOT EXISTS "ix_haravan_users_uuid" ON "haravan"."users"("uuid");

-- Add Foreign Keys
ALTER TABLE "ecom"."qr_generator" ADD CONSTRAINT "qr_generator_haravan_order_id_fkey" FOREIGN KEY ("haravan_order_id") REFERENCES "haravan"."orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_misa_user_fkey" FOREIGN KEY ("user_id") REFERENCES "misa"."users"("haravan_id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "haravan"."orders" ADD CONSTRAINT "orders_haravan_user_fkey" FOREIGN KEY ("user_id") REFERENCES "haravan"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
