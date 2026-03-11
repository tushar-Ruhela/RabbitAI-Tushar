-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "fileName" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
