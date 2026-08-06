-- CreateTable
CREATE TABLE "misa"."customers" (
    "uuid" VARCHAR(36) NOT NULL,
    "haravan_id" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "address" TEXT,
    "haravan_created_at" TIMESTAMP(6),
    "last_synced_at" TIMESTAMP(6),
    "database_created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "database_updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "ix_misa_customers_haravan_id" ON "misa"."customers"("haravan_id");

-- CreateIndex
CREATE INDEX "ix_misa_customers_phone" ON "misa"."customers"("phone");

-- CreateIndex
CREATE INDEX "ix_misa_customers_email" ON "misa"."customers"("email");
