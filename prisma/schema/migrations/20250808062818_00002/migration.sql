-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "larksuite";

-- CreateTable
CREATE TABLE "larksuite"."records" (
    "uuid" UUID NOT NULL,
    "record_id" TEXT NOT NULL,
    "table_id" TEXT,
    "app_token" TEXT,
    "fields" JSONB NOT NULL,
    "database_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "records_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "records_record_id_key" ON "larksuite"."records"("record_id");
