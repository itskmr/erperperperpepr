/*
  Warnings:

  - You are about to drop the column `city` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `houseNo` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `pinCode` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `student` table. All the data in the column will be lost.
  - Added the required column `presentCity` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `presentState` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `documents` ADD COLUMN `addressProof1Path` TEXT NULL,
    ADD COLUMN `addressProof2Path` TEXT NULL,
    ADD COLUMN `affidavitCertificatePath` TEXT NULL,
    ADD COLUMN `incomeCertificatePath` TEXT NULL,
    ADD COLUMN `parentSignaturePath` TEXT NULL;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `city`,
    DROP COLUMN `houseNo`,
    DROP COLUMN `pinCode`,
    DROP COLUMN `state`,
    DROP COLUMN `street`,
    ADD COLUMN `age` INTEGER NULL,
    ADD COLUMN `penNo` VARCHAR(191) NULL,
    ADD COLUMN `permanentCity` VARCHAR(191) NULL,
    ADD COLUMN `permanentHouseNo` VARCHAR(191) NULL,
    ADD COLUMN `permanentPinCode` VARCHAR(191) NULL,
    ADD COLUMN `permanentState` VARCHAR(191) NULL,
    ADD COLUMN `permanentStreet` TEXT NULL,
    ADD COLUMN `presentCity` VARCHAR(191) NOT NULL,
    ADD COLUMN `presentHouseNo` VARCHAR(191) NULL,
    ADD COLUMN `presentPinCode` VARCHAR(191) NULL,
    ADD COLUMN `presentState` VARCHAR(191) NOT NULL,
    ADD COLUMN `presentStreet` TEXT NULL,
    ADD COLUMN `semester` VARCHAR(191) NULL,
    ADD COLUMN `stream` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `transportinfo` ADD COLUMN `dropLocation` VARCHAR(191) NULL,
    ADD COLUMN `pickupLocation` VARCHAR(191) NULL;
