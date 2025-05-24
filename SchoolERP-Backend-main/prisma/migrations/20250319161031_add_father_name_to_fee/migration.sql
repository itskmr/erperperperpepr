/*
  Warnings:

  - Added the required column `fatherName` to the `Fee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Fee` ADD COLUMN `fatherName` VARCHAR(191) NOT NULL DEFAULT 'Not Available';
