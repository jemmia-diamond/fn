-- CreateIndex
CREATE INDEX "idx_conv_sync_filter" ON "pancake"."conversation"("type", "updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_tag_sync_window" ON "pancake"."conversation_tag"("conversation_id", "tag_page_id", "database_updated_at" DESC);

-- CreateIndex
CREATE INDEX "idx_customer_sync_lookup" ON "pancake"."page_customer"("customer_id", "updated_at");
