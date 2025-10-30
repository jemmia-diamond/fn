-- CreateIndex
CREATE INDEX "sales_order_notification_tracking_order_name_idx" ON "erpnext"."sales_order_notification_tracking"("order_name");

-- CreateIndex
CREATE INDEX "sales_order_notification_tracking_haravan_order_id_idx" ON "erpnext"."sales_order_notification_tracking"("haravan_order_id");
