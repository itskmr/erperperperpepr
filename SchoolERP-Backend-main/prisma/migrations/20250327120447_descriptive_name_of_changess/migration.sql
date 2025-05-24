/*
  Warnings:

  - The primary key for the `student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[email]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `attendance` DROP FOREIGN KEY `Attendance_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `documents` DROP FOREIGN KEY `Documents_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `educationinfo` DROP FOREIGN KEY `EducationInfo_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `otherinfo` DROP FOREIGN KEY `OtherInfo_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `parentinfo` DROP FOREIGN KEY `ParentInfo_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `sessioninfo` DROP FOREIGN KEY `SessionInfo_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `transfercertificate` DROP FOREIGN KEY `TransferCertificate_studentId_fkey`;

-- DropForeignKey
ALTER TABLE `transportinfo` DROP FOREIGN KEY `TransportInfo_studentId_fkey`;

-- DropIndex
DROP INDEX `TransferCertificate_studentId_fkey` ON `transfercertificate`;

-- AlterTable
ALTER TABLE `attendance` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `documents` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `educationinfo` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `otherinfo` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `parentinfo` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `sessioninfo` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `student` DROP PRIMARY KEY,
    ADD COLUMN `lastLogin` DATETIME(3) NULL,
    ADD COLUMN `loginEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `password` VARCHAR(191) NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `transfercertificate` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `transportinfo` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_email_key` ON `Student`(`email`);

-- AddForeignKey
ALTER TABLE `ParentInfo` ADD CONSTRAINT `ParentInfo_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SessionInfo` ADD CONSTRAINT `SessionInfo_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransportInfo` ADD CONSTRAINT `TransportInfo_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Documents` ADD CONSTRAINT `Documents_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EducationInfo` ADD CONSTRAINT `EducationInfo_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherInfo` ADD CONSTRAINT `OtherInfo_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferCertificate` ADD CONSTRAINT `TransferCertificate_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
