-- CreateIndex
CREATE INDEX "sales_orders_customer_idx" ON "erpnext"."sales_orders"("customer");

-- CreateIndex
CREATE INDEX "sales_orders_haravan_order_id_idx" ON "erpnext"."sales_orders"("haravan_order_id");

-- CreateIndex
CREATE INDEX "sales_orders_order_number_idx" ON "erpnext"."sales_orders"("order_number");

-- CreateIndex
CREATE INDEX "sales_orders_status_idx" ON "erpnext"."sales_orders"("status");

-- CreateIndex
CREATE INDEX "sales_orders_delivery_status_idx" ON "erpnext"."sales_orders"("delivery_status");

-- CreateIndex
CREATE INDEX "sales_orders_financial_status_idx" ON "erpnext"."sales_orders"("financial_status");

-- CreateIndex
CREATE INDEX "sales_orders_fulfillment_status_idx" ON "erpnext"."sales_orders"("fulfillment_status");

-- CreateIndex
CREATE INDEX "sales_orders_cancelled_status_idx" ON "erpnext"."sales_orders"("cancelled_status");

-- CreateIndex
CREATE INDEX "sales_orders_customer_transaction_date_idx" ON "erpnext"."sales_orders"("customer", "transaction_date");
