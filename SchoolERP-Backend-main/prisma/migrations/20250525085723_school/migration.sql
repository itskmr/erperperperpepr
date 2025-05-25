/*
  Warnings:

  - You are about to drop the column `fullName` on the `school` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `school` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `School_username_key` ON `school`;

-- AlterTable
ALTER TABLE `school` DROP COLUMN `fullName`,
    DROP COLUMN `username`,
    ADD COLUMN `image_url` TEXT NULL,
    ADD COLUMN `schoolName` VARCHAR(191) NOT NULL DEFAULT 'Unknown';
