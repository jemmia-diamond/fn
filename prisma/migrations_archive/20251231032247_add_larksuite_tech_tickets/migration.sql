-- CreateTable
CREATE TABLE "larksuite"."tech_tickets" (
    "record_id" TEXT NOT NULL,
    "ticket_id" TEXT,
    "ticket_name" TEXT,
    "ticket_type" TEXT,
    "ticket_priority" TEXT,
    "ticket_status" TEXT,
    "description" TEXT,
    "solution_update" TEXT,
    "created_time" TIMESTAMP(3),
    "updated_time" TIMESTAMP(3),
    "manual_updated_time" TIMESTAMP(3),
    "completed_time" TIMESTAMP(3),
    "expected_completion_time" TIMESTAMP(3),
    "ticket_no_in_month" TEXT,
    "current_number_in_month" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tech_tickets_pkey" PRIMARY KEY ("record_id")
);


-- CreateIndex
CREATE INDEX "tech_tickets_ticket_id_idx" ON "larksuite"."tech_tickets"("ticket_id");

-- CreateIndex
CREATE INDEX "tech_tickets_ticket_priority_idx" ON "larksuite"."tech_tickets"("ticket_priority");

-- CreateIndex
CREATE INDEX "tech_tickets_ticket_status_idx" ON "larksuite"."tech_tickets"("ticket_status");

-- CreateIndex
CREATE INDEX "tech_tickets_created_time_idx" ON "larksuite"."tech_tickets"("created_time");

-- CreateIndex
CREATE INDEX "tech_tickets_updated_time_idx" ON "larksuite"."tech_tickets"("updated_time");
