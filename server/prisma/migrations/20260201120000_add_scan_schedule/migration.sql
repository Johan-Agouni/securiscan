-- CreateEnum
CREATE TYPE "ScanSchedule" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "sites" ADD COLUMN "scan_schedule" "ScanSchedule" NOT NULL DEFAULT 'NONE';
ALTER TABLE "sites" ADD COLUMN "next_scan_at" TIMESTAMP(3);
