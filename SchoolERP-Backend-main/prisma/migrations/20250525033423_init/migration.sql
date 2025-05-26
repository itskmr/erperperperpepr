/*
  Warnings:

  - You are about to drop the column `admissionDate` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `className` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `presentCity` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `presentHouseNo` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `presentPinCode` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `presentState` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `presentStreet` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `previousSchool` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `rollNumber` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `stream` on the `student` table. All the data in the column will be lost.
  - Added the required column `city` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `educationinfo` MODIFY `lastSchool` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `parentinfo` ADD COLUMN `guardianAadhaarNo` VARCHAR(191) NULL,
    ADD COLUMN `guardianAnnualIncome` VARCHAR(191) NULL,
    ADD COLUMN `guardianEmail` VARCHAR(191) NULL,
    ADD COLUMN `guardianOccupation` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sessioninfo` ADD COLUMN `admitDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `previousSchool` TEXT NULL;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `admissionDate`,
    DROP COLUMN `className`,
    DROP COLUMN `presentCity`,
    DROP COLUMN `presentHouseNo`,
    DROP COLUMN `presentPinCode`,
    DROP COLUMN `presentState`,
    DROP COLUMN `presentStreet`,
    DROP COLUMN `previousSchool`,
    DROP COLUMN `rollNumber`,
    DROP COLUMN `section`,
    DROP COLUMN `semester`,
    DROP COLUMN `stream`,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `houseNo` VARCHAR(191) NULL,
    ADD COLUMN `pinCode` VARCHAR(191) NULL,
    ADD COLUMN `sameAsPresentAddress` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `state` VARCHAR(191) NOT NULL,
    ADD COLUMN `street` TEXT NULL;

-- CreateIndex
CREATE INDEX `Student_admissionNo_idx` ON `Student`(`admissionNo`);

-- CreateIndex
CREATE INDEX `Student_email_idx` ON `Student`(`email`);

-- CreateIndex
CREATE INDEX `Student_mobileNumber_idx` ON `Student`(`mobileNumber`);

-- CreateIndex
CREATE INDEX `Student_aadhaarNumber_idx` ON `Student`(`aadhaarNumber`);
