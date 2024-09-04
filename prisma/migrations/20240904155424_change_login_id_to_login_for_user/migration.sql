/*
  Warnings:

  - You are about to drop the column `loginId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admissionsCycle,login]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `login` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_admissionsCycle_loginId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "loginId",
ADD COLUMN     "login" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_admissionsCycle_login_key" ON "User"("admissionsCycle", "login");
