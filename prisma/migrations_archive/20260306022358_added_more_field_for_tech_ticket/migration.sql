-- AlterTable
ALTER TABLE "larksuite"."tech_tickets" ADD COLUMN     "manager" TEXT,
ADD COLUMN     "new_deadline" TIMESTAMP(3),
ADD COLUMN     "reminder_time" TIMESTAMP(3),
ADD COLUMN     "sla_50_percent" TIMESTAMP(3);
