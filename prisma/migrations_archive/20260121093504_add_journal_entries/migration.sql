-- CreateTable
CREATE TABLE "misa"."journal_entries" (
    "id" SERIAL NOT NULL,
    "refno" VARCHAR(50) NOT NULL,
    "posted_date" TIMESTAMP(6),
    "refdate" TIMESTAMP(6),
    "branch_name" TEXT,
    "total_debit_amount" DECIMAL(18,2),
    "data_details" JSONB NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_refno_key" ON "misa"."journal_entries"("refno");

-- CreateIndex
CREATE INDEX "journal_entries_data_details_idx" ON "misa"."journal_entries" USING GIN ("data_details");
