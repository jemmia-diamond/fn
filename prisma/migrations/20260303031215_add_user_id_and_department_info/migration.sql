-- AlterTable
ALTER TABLE "larksuite"."buyback_exchange_approval_instances" ADD COLUMN     "department_id" VARCHAR,
ADD COLUMN     "department_name" VARCHAR,
ADD COLUMN     "user_id" VARCHAR,
ADD COLUMN     "product_handed_over_at" TIMESTAMP(6);
