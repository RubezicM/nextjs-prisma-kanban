-- CreateEnum
CREATE TYPE "CardPriority" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "priority" "CardPriority" NOT NULL DEFAULT 'NONE';
