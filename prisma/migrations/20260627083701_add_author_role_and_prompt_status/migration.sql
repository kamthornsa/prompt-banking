-- CreateEnum
CREATE TYPE "PromptStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'AUTHOR';

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "status" "PromptStatus" NOT NULL DEFAULT 'PUBLISHED';
