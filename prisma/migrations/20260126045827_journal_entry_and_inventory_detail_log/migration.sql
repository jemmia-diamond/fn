-- DropIndex
DROP INDEX "misa"."idx_inv_log_item";

-- DropIndex
DROP INDEX "misa"."idx_inv_log_stock";

-- DropIndex
DROP INDEX "misa"."unique_stock_item_log";

-- AlterTable
ALTER TABLE "misa"."inventory_detail_log" DROP COLUMN "inventory_item_code",
DROP COLUMN "inventory_item_name",
DROP COLUMN "stock_code",
ADD COLUMN     "page_index" INTEGER NOT NULL,
ADD COLUMN     "session_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "misa"."journal_entries" DROP COLUMN "branch_name",
DROP COLUMN "created_at",
DROP COLUMN "posted_date",
DROP COLUMN "refdate",
DROP COLUMN "total_debit_amount",
ADD COLUMN     "page_index" INTEGER NOT NULL,
ADD COLUMN     "session_id" UUID NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "unique_stock_item_log" ON "misa"."inventory_detail_log"("page_index", "stock_id", "inventory_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_journal_entry" ON "misa"."journal_entries"("page_index", "refno");
