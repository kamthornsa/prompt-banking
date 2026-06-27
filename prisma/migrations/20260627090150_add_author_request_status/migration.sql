-- CreateEnum
CREATE TYPE "AuthorRequestStatus" AS ENUM ('PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "authorRequestStatus" "AuthorRequestStatus";
