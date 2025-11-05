-- AlterTable
ALTER TABLE "erpnext"."sales_orders" ADD COLUMN     "consultation_date" DATE,
ADD COLUMN     "primary_sales_person" TEXT,
ADD COLUMN     "sales_order_purposes" JSONB;
