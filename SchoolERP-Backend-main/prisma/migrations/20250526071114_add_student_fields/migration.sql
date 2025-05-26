/*
  Warnings:

  - The primary key for the `Documents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aadhaarCard` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `birthCertificate` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `familyId` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `studentPhoto` on the `Documents` table. All the data in the column will be lost.
  - The `id` column on the `Documents` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `class` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransportDetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_studentId_fkey";

-- DropForeignKey
ALTER TABLE "TransportDetails" DROP CONSTRAINT "TransportDetails_studentId_fkey";

-- DropIndex
DROP INDEX "Student_aadhaarNumber_key";

-- DropIndex
DROP INDEX "Student_apaarId_key";

-- AlterTable
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_pkey",
DROP COLUMN "aadhaarCard",
DROP COLUMN "birthCertificate",
DROP COLUMN "familyId",
DROP COLUMN "studentPhoto",
ADD COLUMN     "aadhaarCardPath" TEXT,
ADD COLUMN     "academicRegistrationNo" TEXT,
ADD COLUMN     "addressProof1Path" TEXT,
ADD COLUMN     "addressProof2Path" TEXT,
ADD COLUMN     "affidavitCertificatePath" TEXT,
ADD COLUMN     "birthCertificatePath" TEXT,
ADD COLUMN     "familyIdPath" TEXT,
ADD COLUMN     "fatherAadharPath" TEXT,
ADD COLUMN     "fatherImagePath" TEXT,
ADD COLUMN     "guardianImagePath" TEXT,
ADD COLUMN     "incomeCertificatePath" TEXT,
ADD COLUMN     "migrationCertificatePath" TEXT,
ADD COLUMN     "motherAadharPath" TEXT,
ADD COLUMN     "motherImagePath" TEXT,
ADD COLUMN     "parentSignaturePath" TEXT,
ADD COLUMN     "signaturePath" TEXT,
ADD COLUMN     "studentImagePath" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Documents_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "class",
DROP COLUMN "section",
ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "branchName" TEXT,
ADD COLUMN     "caste" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "emailPassword" TEXT,
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "loginEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "passwordResetExpires" TIMESTAMP(3),
ADD COLUMN     "passwordResetToken" TEXT,
ADD COLUMN     "penNo" TEXT,
ADD COLUMN     "permanentCity" TEXT,
ADD COLUMN     "permanentHouseNo" TEXT,
ADD COLUMN     "permanentPinCode" TEXT,
ADD COLUMN     "permanentState" TEXT,
ADD COLUMN     "permanentStreet" TEXT,
ADD COLUMN     "religion" TEXT,
ADD COLUMN     "sameAsPresentAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studentId" TEXT,
ALTER COLUMN "aadhaarNumber" DROP NOT NULL,
ALTER COLUMN "apaarId" DROP NOT NULL;

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "TransportDetails";

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
