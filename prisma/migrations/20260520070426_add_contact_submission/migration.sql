-- CreateEnum
CREATE TYPE "ContactInquiryType" AS ENUM ('TECHNICAL_INTERN', 'SPECIFIED_SKILL', 'OTHER');

-- CreateTable
CREATE TABLE "ContactSubmission" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "furigana" TEXT NOT NULL,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "prefecture" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "inquiryType" "ContactInquiryType" NOT NULL,
    "message" TEXT NOT NULL,
    "sourcePage" TEXT,
    "locale" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactSubmission_createdAt_idx" ON "ContactSubmission"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ContactSubmission_email_idx" ON "ContactSubmission"("email");
