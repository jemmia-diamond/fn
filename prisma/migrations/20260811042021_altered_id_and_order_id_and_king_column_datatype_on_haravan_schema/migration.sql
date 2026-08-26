-- AlterTable
ALTER TABLE "haravan"."line_items" ALTER COLUMN "id" SET DATA TYPE BIGINT,
ALTER COLUMN "order_id" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "haravan"."transactions" ALTER COLUMN "kind" SET DATA TYPE VARCHAR(50);
