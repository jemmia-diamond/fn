-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "misa";

-- CreateTable
CREATE TABLE "misa"."users" (
    "uuid" UUID NOT NULL,
    "employee_code" VARCHAR(255),
    "haravan_id" BIGINT NOT NULL,
    "email" VARCHAR(255),
    "database_created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_code_key" ON "misa"."users"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_haravan_id_key" ON "misa"."users"("haravan_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "misa"."users"("email");

-- CreateIndex
CREATE INDEX "users_haravan_id_idx" ON "misa"."users"("haravan_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "misa"."users"("email");
