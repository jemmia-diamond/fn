/*
  Warnings:

  - You are about to drop the column `type` on the `gold_pricing` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[location,gold_type,time]` on the table `gold_pricing` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "market_data"."gold_pricing" DROP COLUMN "type",
ADD COLUMN     "gold_type" VARCHAR,
ADD COLUMN     "location" VARCHAR,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6),
ALTER COLUMN "time" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "gold_pricing_location_gold_type_time_key" ON "market_data"."gold_pricing"("location", "gold_type", "time");
