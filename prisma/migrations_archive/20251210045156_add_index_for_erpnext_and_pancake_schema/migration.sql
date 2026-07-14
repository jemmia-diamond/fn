
CREATE INDEX "contacts_pancake_conversation_id_idx" ON "erpnext"."contacts"("pancake_conversation_id");

-- CreateIndex
CREATE INDEX "customers_lead_name_idx" ON "erpnext"."customers"("lead_name");

-- CreateIndex
CREATE INDEX "leads_purpose_lead_idx" ON "erpnext"."leads"("purpose_lead");

-- CreateIndex
CREATE INDEX "leads_budget_lead_idx" ON "erpnext"."leads"("budget_lead");

-- CreateIndex
CREATE INDEX "leads_province_idx" ON "erpnext"."leads"("province");

-- CreateIndex
CREATE INDEX "leads_region_idx" ON "erpnext"."leads"("region");

-- CreateIndex
CREATE INDEX "conversation_ad_ids_idx" ON "pancake"."conversation" USING GIN ("ad_ids");
