/*
  Warnings:

  - You are about to drop the column `class` on the `teacher` table. All the data in the column will be lost.
  - Added the required column `classes` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sections` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `class`,
    ADD COLUMN `address` TEXT NULL,
    ADD COLUMN `classes` TEXT NOT NULL,
    ADD COLUMN `designation` VARCHAR(191) NOT NULL DEFAULT 'Teacher',
    ADD COLUMN `education` TEXT NULL,
    ADD COLUMN `inchargeClass` VARCHAR(191) NULL,
    ADD COLUMN `inchargeSection` VARCHAR(191) NULL,
    ADD COLUMN `isClassIncharge` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `profileImage` TEXT NULL,
    ADD COLUMN `sections` TEXT NOT NULL,
    MODIFY `experience` VARCHAR(191) NOT NULL DEFAULT '0';

-- CreateIndex
CREATE INDEX `Teacher_isClassIncharge_inchargeClass_inchargeSection_idx` ON `Teacher`(`isClassIncharge`, `inchargeClass`, `inchargeSection`);

-- AddForeignKey
ALTER TABLE `StudentTransport` ADD CONSTRAINT `StudentTransport_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`admissionNo`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `teacher` RENAME INDEX `Teacher_schoolId_fkey` TO `Teacher_schoolId_idx`;
