
-- AlterTable
ALTER TABLE "erpnext"."sales_orders" 
ADD COLUMN     "is_split_order" INTEGER,
ADD COLUMN     "split_order_group" TEXT,
ADD COLUMN     "split_order_group_name" TEXT,
ADD COLUMN     "split_reason" TEXT;