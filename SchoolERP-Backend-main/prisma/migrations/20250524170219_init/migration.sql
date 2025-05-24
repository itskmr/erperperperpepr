-- DropForeignKey
ALTER TABLE `studenttransport` DROP FOREIGN KEY `StudentTransport_studentId_fkey`;

-- AddForeignKey
ALTER TABLE `StudentTransport` ADD CONSTRAINT `StudentTransport_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
