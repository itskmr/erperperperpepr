/*
  Warnings:

  - You are about to drop the column `fatherContact` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherEmail` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `fatherOccupation` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `motherContact` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `motherEmail` on the `student` table. All the data in the column will be lost.
  - You are about to drop the column `motherOccupation` on the `student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `student` DROP COLUMN `fatherContact`,
    DROP COLUMN `fatherEmail`,
    DROP COLUMN `fatherOccupation`,
    DROP COLUMN `motherContact`,
    DROP COLUMN `motherEmail`,
    DROP COLUMN `motherOccupation`,
    ADD COLUMN `branchName` VARCHAR(191) NULL,
    ADD COLUMN `caste` VARCHAR(191) NULL,
    ADD COLUMN `studentId` VARCHAR(191) NULL,
    MODIFY `previousSchool` TEXT NULL,
    MODIFY `street` TEXT NULL;

-- CreateTable
CREATE TABLE `ParentInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fatherQualification` VARCHAR(191) NULL,
    `fatherOccupation` VARCHAR(191) NULL,
    `fatherContact` VARCHAR(191) NULL,
    `fatherEmail` VARCHAR(191) NULL,
    `fatherAadhaarNo` VARCHAR(191) NULL,
    `fatherAnnualIncome` VARCHAR(191) NULL,
    `fatherIsCampusEmployee` VARCHAR(191) NULL DEFAULT 'no',
    `motherQualification` VARCHAR(191) NULL,
    `motherOccupation` VARCHAR(191) NULL,
    `motherContact` VARCHAR(191) NULL,
    `motherEmail` VARCHAR(191) NULL,
    `motherAadhaarNo` VARCHAR(191) NULL,
    `motherAnnualIncome` VARCHAR(191) NULL,
    `motherIsCampusEmployee` VARCHAR(191) NULL DEFAULT 'no',
    `guardianName` VARCHAR(191) NULL,
    `guardianAddress` TEXT NULL,
    `guardianContact` VARCHAR(191) NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `ParentInfo_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SessionInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admitGroup` VARCHAR(191) NULL,
    `admitStream` VARCHAR(191) NULL,
    `admitClass` VARCHAR(191) NULL,
    `admitSection` VARCHAR(191) NULL,
    `admitRollNo` VARCHAR(191) NULL,
    `admitSemester` VARCHAR(191) NULL,
    `admitFeeGroup` VARCHAR(191) NULL,
    `admitHouse` VARCHAR(191) NULL,
    `currentGroup` VARCHAR(191) NULL,
    `currentStream` VARCHAR(191) NULL,
    `currentClass` VARCHAR(191) NULL,
    `currentSection` VARCHAR(191) NULL,
    `currentRollNo` VARCHAR(191) NULL,
    `currentSemester` VARCHAR(191) NULL,
    `currentFeeGroup` VARCHAR(191) NULL,
    `currentHouse` VARCHAR(191) NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `SessionInfo_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransportInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transportMode` VARCHAR(191) NULL,
    `transportArea` VARCHAR(191) NULL,
    `transportStand` VARCHAR(191) NULL,
    `transportRoute` VARCHAR(191) NULL,
    `transportDriver` VARCHAR(191) NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `TransportInfo_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentImagePath` TEXT NULL,
    `fatherImagePath` TEXT NULL,
    `motherImagePath` TEXT NULL,
    `guardianImagePath` TEXT NULL,
    `signaturePath` TEXT NULL,
    `fatherAadharPath` TEXT NULL,
    `motherAadharPath` TEXT NULL,
    `birthCertificatePath` TEXT NULL,
    `migrationCertificatePath` TEXT NULL,
    `aadhaarCardPath` TEXT NULL,
    `academicRegistrationNo` VARCHAR(191) NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `Documents_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EducationInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lastSchool` TEXT NULL,
    `lastSchoolAddress` TEXT NULL,
    `lastTcDate` DATETIME(3) NULL,
    `lastClass` VARCHAR(191) NULL,
    `lastPercentage` VARCHAR(191) NULL,
    `lastAttendance` VARCHAR(191) NULL,
    `lastExtraActivity` TEXT NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `EducationInfo_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherInfo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `belongToBPL` VARCHAR(191) NULL DEFAULT 'no',
    `minority` VARCHAR(191) NULL DEFAULT 'no',
    `disability` VARCHAR(191) NULL,
    `accountNo` VARCHAR(191) NULL,
    `bank` VARCHAR(191) NULL,
    `ifscCode` VARCHAR(191) NULL,
    `medium` VARCHAR(191) NULL,
    `lastYearResult` VARCHAR(191) NULL,
    `singleParent` VARCHAR(191) NULL DEFAULT 'no',
    `onlyChild` VARCHAR(191) NULL DEFAULT 'no',
    `onlyGirlChild` VARCHAR(191) NULL DEFAULT 'no',
    `adoptedChild` VARCHAR(191) NULL DEFAULT 'no',
    `siblingAdmissionNo` VARCHAR(191) NULL,
    `transferCase` VARCHAR(191) NULL DEFAULT 'no',
    `livingWith` VARCHAR(191) NULL,
    `motherTongue` VARCHAR(191) NULL,
    `admissionType` VARCHAR(191) NULL DEFAULT 'new',
    `udiseNo` VARCHAR(191) NULL,
    `studentId` INTEGER NOT NULL,

    UNIQUE INDEX `OtherInfo_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
