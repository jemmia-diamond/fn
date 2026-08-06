-- CreateTable
CREATE TABLE "reporting"."uptime_reports" (
    "id" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "monitorName" TEXT,
    "date" DATE NOT NULL,
    "totalTime" INTEGER,
    "uptime" INTEGER,
    "downtime" INTEGER,
    "uptimePercentage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "uptime_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uptime_reports_monitorId_date_idx" ON "reporting"."uptime_reports"("monitorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "uptime_reports_monitorId_date_key" ON "reporting"."uptime_reports"("monitorId", "date");
