/*
  Warnings:

  - A unique constraint covering the columns `[fatherEmail]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailPassword` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherEmail` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherEmailPassword` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `student` ADD COLUMN `emailPassword` VARCHAR(191) NOT NULL,
    ADD COLUMN `fatherEmail` VARCHAR(191) NOT NULL,
    ADD COLUMN `fatherEmailPassword` VARCHAR(191) NOT NULL,
    ADD COLUMN `motherEmail` VARCHAR(191) NULL,
    ADD COLUMN `motherEmailPassword` VARCHAR(191) NULL,
    MODIFY `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_fatherEmail_key` ON `Student`(`fatherEmail`);
