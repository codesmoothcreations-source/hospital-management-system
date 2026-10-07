-- CreateEnum
CREATE TYPE "TransferStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DIFFICULTY', 'CANCELLED');

-- AlterTable
ALTER TABLE "Transfer" ADD COLUMN     "status" "TransferStatus" NOT NULL DEFAULT 'PENDING';
