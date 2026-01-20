-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "InfraTask" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TACandidate" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TAExecMonthly" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TAInterview" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TAJoiner" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TAOffer" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TARecruiterMonthly" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "TARequisition" ADD COLUMN     "customerName" TEXT;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "customerName" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "customerName" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "place" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "passwordHash" TEXT,
    "resetToken" TEXT,
    "resetTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
