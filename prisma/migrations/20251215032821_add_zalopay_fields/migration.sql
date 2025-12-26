-- AlterTable
ALTER TABLE "payment"."sepay_transaction" ADD COLUMN     "amount" BIGINT,
ADD COLUMN     "app_id" INTEGER,
ADD COLUMN     "app_time" BIGINT,
ADD COLUMN     "app_user" VARCHAR(255),
ADD COLUMN     "channel" INTEGER,
ADD COLUMN     "discount_amount" BIGINT,
ADD COLUMN     "embed_data" JSONB,
ADD COLUMN     "item" JSONB,
ADD COLUMN     "merchant_user_id" VARCHAR(255),
ADD COLUMN     "server_time" BIGINT,
ADD COLUMN     "user_fee_amount" BIGINT,
ADD COLUMN     "zp_trans_id" BIGINT;
