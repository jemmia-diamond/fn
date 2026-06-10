
-- DropIndex
DROP INDEX "misa"."unique_payable_account_page";

-- DropIndex
DROP INDEX "misa"."unique_stock_item_log";

-- DropIndex
DROP INDEX "misa"."unique_journal_entry";

-- AlterTable
ALTER TABLE "misa"."accounts_payable_details" ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "misa"."inventory_detail_log" ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "misa"."journal_entries" ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "accounts_payable_details_year_idx" ON "misa"."accounts_payable_details"("year");

-- CreateIndex
CREATE UNIQUE INDEX "unique_year_payable_account_page" ON "misa"."accounts_payable_details"("year", "account_object_code", "page_index");

-- CreateIndex
CREATE INDEX "inventory_detail_log_year_stock_id_idx" ON "misa"."inventory_detail_log"("year", "stock_id");

-- CreateIndex
CREATE INDEX "inventory_detail_log_year_inventory_item_id_idx" ON "misa"."inventory_detail_log"("year", "inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_year_stock_item_log" ON "misa"."inventory_detail_log"("year", "page_index", "stock_id", "inventory_item_id");

-- CreateIndex
CREATE INDEX "journal_entries_year_idx" ON "misa"."journal_entries"("year");

-- CreateIndex
CREATE UNIQUE INDEX "unique_year_journal_entry" ON "misa"."journal_entries"("year", "page_index", "refno");
