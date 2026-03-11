-- AlterTable
ALTER TABLE "larksuite"."tech_tickets" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "processed_at" TIMESTAMP(3),
ADD COLUMN     "responded_at" TIMESTAMP(3);
