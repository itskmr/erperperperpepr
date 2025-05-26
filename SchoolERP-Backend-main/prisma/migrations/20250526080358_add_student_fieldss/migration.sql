/*
  Warnings:

  - A unique constraint covering the columns `[fatherLoginId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[motherLoginId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `studentPassword` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "aadhaarCardUrl" TEXT,
ADD COLUMN     "belongToBPL" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthCertificateSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "birthCertificateUrl" TEXT,
ADD COLUMN     "disability" TEXT,
ADD COLUMN     "documentsVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "familyIdUrl" TEXT,
ADD COLUMN     "fatherAadharSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fatherImageUrl" TEXT,
ADD COLUMN     "fatherLoginId" TEXT,
ADD COLUMN     "fatherPassword" TEXT,
ADD COLUMN     "guardianImageUrl" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "markSheetUrl" TEXT,
ADD COLUMN     "marksheetSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motherAadharSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motherImageUrl" TEXT,
ADD COLUMN     "motherLoginId" TEXT,
ADD COLUMN     "motherPassword" TEXT,
ADD COLUMN     "parentSignatureUrl" TEXT,
ADD COLUMN     "signatureUrl" TEXT,
ADD COLUMN     "studentAadharSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studentImageUrl" TEXT,
ADD COLUMN     "studentPassword" TEXT NOT NULL,
ADD COLUMN     "tcSubmitted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "transferCertificateUrl" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PreviousSchool" (
    "id" TEXT NOT NULL,
    "schoolName" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "tcNumber" TEXT,
    "issueDate" TIMESTAMP(3),
    "subjects" TEXT,
    "board" TEXT,
    "result" TEXT,
    "obtainedMarks" DOUBLE PRECISION,
    "maxMarks" DOUBLE PRECISION,
    "percentage" DOUBLE PRECISION,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "PreviousSchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sibling" (
    "id" TEXT NOT NULL,
    "admissionNo" TEXT,
    "name" TEXT NOT NULL,
    "class" TEXT,
    "age" INTEGER,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Sibling_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeDetails" (
    "id" TEXT NOT NULL,
    "admissionNo" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "admittedClass" TEXT NOT NULL,
    "receiptNo" TEXT,
    "paymentMode" TEXT,
    "paidAmount" DOUBLE PRECISION,
    "checkedBy" TEXT,
    "verifiedBy" TEXT,
    "approvedBy" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "OfficeDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreviousSchool_studentId_key" ON "PreviousSchool"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficeDetails_studentId_key" ON "OfficeDetails"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_fatherLoginId_key" ON "Student"("fatherLoginId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_motherLoginId_key" ON "Student"("motherLoginId");

-- CreateIndex
CREATE INDEX "Student_fatherLoginId_idx" ON "Student"("fatherLoginId");

-- CreateIndex
CREATE INDEX "Student_motherLoginId_idx" ON "Student"("motherLoginId");

-- AddForeignKey
ALTER TABLE "PreviousSchool" ADD CONSTRAINT "PreviousSchool_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sibling" ADD CONSTRAINT "Sibling_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeDetails" ADD CONSTRAINT "OfficeDetails_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
