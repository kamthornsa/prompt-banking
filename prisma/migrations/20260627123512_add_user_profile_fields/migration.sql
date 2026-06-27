/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TeachingSubject" AS ENUM ('THAI', 'MATH', 'SCIENCE', 'SOCIAL', 'HEALTH_PE', 'ART', 'CAREER_TECH', 'FOREIGN_LANG', 'OTHER');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" VARCHAR(300),
ADD COLUMN     "school" VARCHAR(200),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "teachingSubjects" "TeachingSubject"[];

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
