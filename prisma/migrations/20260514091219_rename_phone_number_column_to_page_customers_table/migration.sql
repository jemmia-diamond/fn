-- AlterTable
ALTER TABLE "pancake"."page_customer" DROP COLUMN "phone_normalize",
DROP COLUMN "phone_numbers_normalize",
ADD COLUMN     "normalized_phone" VARCHAR(255),
ADD COLUMN     "normalized_phone_numbers" JSONB;