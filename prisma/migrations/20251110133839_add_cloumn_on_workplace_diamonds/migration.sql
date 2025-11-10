-- AlterTable
ALTER TABLE "erpnext"."regions" ALTER COLUMN "region_name" SET DEFAULT '';

-- AlterTable
ALTER TABLE "larksuite"."records" ALTER COLUMN "fields" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "workplace"."diamonds" ADD COLUMN     "final_discounted_price" DECIMAL;
