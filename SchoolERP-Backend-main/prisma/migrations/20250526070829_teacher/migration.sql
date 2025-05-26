/*
  Warnings:

  - You are about to drop the column `education` on the `teacher` table. All the data in the column will be lost.
  - Added the required column `gender` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `teacher` DROP COLUMN `education`,
    ADD COLUMN `accountHolderName` VARCHAR(191) NULL,
    ADD COLUMN `accountNumber` VARCHAR(191) NULL,
    ADD COLUMN `age` INTEGER NULL,
    ADD COLUMN `bankBranch` VARCHAR(191) NULL,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `bloodGroup` VARCHAR(191) NULL,
    ADD COLUMN `dateOfBirth` DATETIME(3) NULL,
    ADD COLUMN `documents` TEXT NULL,
    ADD COLUMN `facebook` VARCHAR(191) NULL,
    ADD COLUMN `gender` VARCHAR(191) NOT NULL,
    ADD COLUMN `joiningSalary` DOUBLE NULL,
    ADD COLUMN `linkedIn` VARCHAR(191) NULL,
    ADD COLUMN `maritalStatus` VARCHAR(191) NULL,
    ADD COLUMN `qualification` TEXT NULL,
    ADD COLUMN `religion` VARCHAR(191) NULL,
    ADD COLUMN `twitter` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Timetable` (
    `id` VARCHAR(191) NOT NULL,
    `classId` VARCHAR(191) NOT NULL,
    `sectionId` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `day` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `roomNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Timetable_classId_sectionId_idx`(`classId`, `sectionId`),
    INDEX `Timetable_teacherId_idx`(`teacherId`),
    INDEX `Timetable_day_idx`(`day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
