-- CreateEnum
CREATE TYPE "ShowcaseType" AS ENUM ('IMAGE', 'LINK');

-- CreateTable
CREATE TABLE "Showcase" (
    "id" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" VARCHAR(300),
    "type" "ShowcaseType" NOT NULL,
    "imageKey" TEXT,
    "externalUrl" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Showcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShowcaseRating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showcaseId" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "comment" VARCHAR(200),
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShowcaseRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Showcase_promptId_idx" ON "Showcase"("promptId");

-- CreateIndex
CREATE INDEX "Showcase_authorId_idx" ON "Showcase"("authorId");

-- CreateIndex
CREATE INDEX "ShowcaseRating_showcaseId_idx" ON "ShowcaseRating"("showcaseId");

-- CreateIndex
CREATE UNIQUE INDEX "ShowcaseRating_userId_showcaseId_key" ON "ShowcaseRating"("userId", "showcaseId");

-- AddForeignKey
ALTER TABLE "Showcase" ADD CONSTRAINT "Showcase_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Showcase" ADD CONSTRAINT "Showcase_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseRating" ADD CONSTRAINT "ShowcaseRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShowcaseRating" ADD CONSTRAINT "ShowcaseRating_showcaseId_fkey" FOREIGN KEY ("showcaseId") REFERENCES "Showcase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
