/*
  Warnings:

  - The primary key for the `Documents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `aadhaarCardPath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `academicRegistrationNo` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `addressProof1Path` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `addressProof2Path` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `affidavitCertificatePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `birthCertificatePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `fatherAadharPath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `fatherImagePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `guardianImagePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `incomeCertificatePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `migrationCertificatePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `motherAadharPath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `motherImagePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `parentSignaturePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `signaturePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `studentImagePath` on the `Documents` table. All the data in the column will be lost.
  - You are about to drop the column `age` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `bloodGroup` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `branchName` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `caste` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `emailPassword` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `emergencyContact` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `loginEnabled` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `nationality` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetExpires` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `penNo` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentCity` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentHouseNo` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentPinCode` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentState` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `permanentStreet` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `religion` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `sameAsPresentAddress` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `studentId` on the `Student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aadhaarNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[apaarId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aadhaarCard` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `birthCertificate` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyId` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentPhoto` to the `Documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `apaarId` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `aadhaarNumber` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_studentId_fkey";

-- AlterTable
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_pkey",
DROP COLUMN "aadhaarCardPath",
DROP COLUMN "academicRegistrationNo",
DROP COLUMN "addressProof1Path",
DROP COLUMN "addressProof2Path",
DROP COLUMN "affidavitCertificatePath",
DROP COLUMN "birthCertificatePath",
DROP COLUMN "fatherAadharPath",
DROP COLUMN "fatherImagePath",
DROP COLUMN "guardianImagePath",
DROP COLUMN "incomeCertificatePath",
DROP COLUMN "migrationCertificatePath",
DROP COLUMN "motherAadharPath",
DROP COLUMN "motherImagePath",
DROP COLUMN "parentSignaturePath",
DROP COLUMN "signaturePath",
DROP COLUMN "studentImagePath",
ADD COLUMN     "aadhaarCard" TEXT NOT NULL,
ADD COLUMN     "birthCertificate" TEXT NOT NULL,
ADD COLUMN     "familyId" TEXT NOT NULL,
ADD COLUMN     "studentPhoto" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Documents_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Documents_id_seq";

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "age",
DROP COLUMN "bloodGroup",
DROP COLUMN "branchName",
DROP COLUMN "caste",
DROP COLUMN "category",
DROP COLUMN "emailPassword",
DROP COLUMN "emergencyContact",
DROP COLUMN "isVerified",
DROP COLUMN "lastLogin",
DROP COLUMN "loginEnabled",
DROP COLUMN "nationality",
DROP COLUMN "passwordResetExpires",
DROP COLUMN "passwordResetToken",
DROP COLUMN "penNo",
DROP COLUMN "permanentCity",
DROP COLUMN "permanentHouseNo",
DROP COLUMN "permanentPinCode",
DROP COLUMN "permanentState",
DROP COLUMN "permanentStreet",
DROP COLUMN "religion",
DROP COLUMN "sameAsPresentAddress",
DROP COLUMN "studentId",
ADD COLUMN     "apaarId" TEXT NOT NULL,
ADD COLUMN     "class" TEXT,
ADD COLUMN     "section" TEXT,
ALTER COLUMN "aadhaarNumber" SET NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "houseNo" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pinCode" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportDetails" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "area" TEXT,
    "busStand" TEXT,
    "busRoute" TEXT,
    "driverName" TEXT,
    "driverPhone" TEXT,
    "pickupLocation" TEXT,
    "dropLocation" TEXT,
    "studentId" TEXT NOT NULL,

    CONSTRAINT "TransportDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_studentId_key" ON "Address"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "TransportDetails_studentId_key" ON "TransportDetails"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_aadhaarNumber_key" ON "Student"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_apaarId_key" ON "Student"("apaarId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportDetails" ADD CONSTRAINT "TransportDetails_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
