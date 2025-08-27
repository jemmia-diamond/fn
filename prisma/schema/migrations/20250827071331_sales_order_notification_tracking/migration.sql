-- CreateTable
CREATE TABLE "erpnext"."sales_order_notification_tracking" (
    "uuid" UUID NOT NULL,
    "order_name" TEXT NOT NULL,
    "haravan_order_id" TEXT NOT NULL,
    "lark_message_id" TEXT NOT NULL,
    "database_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_order_notification_tracking_pkey" PRIMARY KEY ("uuid")
);
