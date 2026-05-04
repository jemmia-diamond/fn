-- AlterTable
ALTER TABLE "erpnext"."leads" ADD COLUMN     "proposed_budget" VARCHAR(255);

-- CreateIndex
CREATE INDEX "leads_proposed_budget_idx" ON "erpnext"."leads"("proposed_budget");
