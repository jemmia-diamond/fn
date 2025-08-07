-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "erpnext";

-- CreateTable
CREATE TABLE "erpnext"."users" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "email" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."employees" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "user_id" TEXT,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("uuid")
);

-- CreateTable
CREATE TABLE "erpnext"."sales_persons" (
    "uuid" UUID NOT NULL,
    "name" TEXT,
    "employee" TEXT,

    CONSTRAINT "sales_persons_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "erpnext"."users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "employees_name_key" ON "erpnext"."employees"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sales_persons_name_key" ON "erpnext"."sales_persons"("name");
