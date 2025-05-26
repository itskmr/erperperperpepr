/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - The required column `username` was added to the `School` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "School" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "School_username_key" ON "School"("username");
