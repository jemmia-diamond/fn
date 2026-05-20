-- CreateTable
CREATE TABLE "larksuite"."appointments" (
    "record_id" TEXT NOT NULL,
    "store" TEXT,
    "name" TEXT,
    "phone_number" TEXT,
    "gender" TEXT,
    "product_images" JSONB,
    "note" TEXT,
    "date_time" TIMESTAMP(3),
    "conversation_greeting" TEXT,
    "customer_response" TEXT,
    "main_sales" JSONB,
    "offline_sales" JSONB,
    "status" TEXT,
    "policy" TEXT,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("record_id")
);
