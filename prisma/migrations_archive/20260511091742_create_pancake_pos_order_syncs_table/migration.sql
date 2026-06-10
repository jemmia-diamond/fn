-- AlterTable
ALTER TABLE "pancake"."page" ADD COLUMN     "pos_shop_id" INTEGER;
-- CreateTable
CREATE TABLE "pancake"."pancake_pos_order_syncs" (
    "haravan_order_id" BIGINT NOT NULL,
    "pancake_order_id" INTEGER,
    "shop_id" INTEGER,
    "ads_id" VARCHAR,
    "status" INTEGER,
    "synced_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "pancake_pos_order_syncs_pkey" PRIMARY KEY ("haravan_order_id")
);
