-- CreateTable
CREATE TABLE `TransferCertificate` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admissionNumber` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(191) NOT NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `nationality` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `dateOfAdmission` DATETIME(3) NOT NULL,
    `currentClass` VARCHAR(191) NOT NULL,
    `whetherFailed` ENUM('Yes', 'No', 'NA', 'CBSEBoard') NOT NULL DEFAULT 'No',
    `section` VARCHAR(191) NOT NULL,
    `rollNumber` VARCHAR(191) NULL,
    `examAppearedIn` ENUM('School', 'Board', 'NA', 'CBSEBoard', 'SchoolFailed', 'SchoolPassed', 'SchoolCompartment', 'BoardPassed', 'BoardFailed', 'BoardCompartment') NOT NULL DEFAULT 'School',
    `qualifiedForPromotion` ENUM('Yes', 'No', 'NA', 'Pass', 'Fail', 'Compartment', 'AsperCBSEBoardResult', 'AppearedinclassXExam', 'AppearedinclassXIIExam') NOT NULL DEFAULT 'Yes',
    `reasonForLeaving` ENUM('FamilyRelocation', 'AdmissionInOtherSchool', 'Duetolongabsencewithoutinformation', 'FatherJobTransfer', 'GetAdmissioninHigherClass', 'GoingtoNativePlace', 'ParentWill', 'Passedoutfromtheschool', 'Shiftingtootherplace', 'TransferCase', 'Other') NOT NULL,
    `dateOfLeaving` DATETIME(3) NOT NULL,
    `lastAttendanceDate` DATETIME(3) NOT NULL,
    `toClass` VARCHAR(191) NULL,
    `classInWords` VARCHAR(191) NULL,
    `maxAttendance` INTEGER NOT NULL,
    `obtainedAttendance` INTEGER NOT NULL,
    `subjectsStudied` TEXT NOT NULL,
    `generalConduct` ENUM('Excellent', 'Good', 'Satisfactory', 'NeedsImprovement', 'Poor') NOT NULL,
    `behaviorRemarks` TEXT NULL,
    `feesPaidUpTo` DATETIME(3) NOT NULL,
    `tcCharge` DOUBLE NOT NULL DEFAULT 0,
    `feeConcession` ENUM('None', 'Partial', 'Full') NULL DEFAULT 'None',
    `gamesPlayed` TEXT NULL,
    `extraActivities` TEXT NULL,
    `schoolId` INTEGER NOT NULL,
    `issuedDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tcNumber` VARCHAR(191) NOT NULL,
    `tcstatus` INTEGER NOT NULL DEFAULT 1,
    `studentId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TransferCertificate_tcNumber_key`(`tcNumber`),
    INDEX `TransferCertificate_admissionNumber_idx`(`admissionNumber`),
    INDEX `TransferCertificate_tcNumber_idx`(`tcNumber`),
    INDEX `TransferCertificate_issuedDate_idx`(`issuedDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransferCertificate` ADD CONSTRAINT `TransferCertificate_schoolId_fkey` FOREIGN KEY (`schoolId`) REFERENCES `School`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransferCertificate` ADD CONSTRAINT `TransferCertificate_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
