-- AlterTable
ALTER TABLE "erpnext"."leads" ADD COLUMN     "first_visited_at" TIMESTAMP(6),
ADD COLUMN     "last_customer_message_at" TIMESTAMP(6),
ADD COLUMN     "last_sales_message_at" TIMESTAMP(6),
ADD COLUMN     "store" VARCHAR(255),
ADD COLUMN     "store_name" VARCHAR(255);
