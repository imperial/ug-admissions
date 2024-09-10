/*
  Warnings:

  - You are about to drop the column `applicantId` on the `Application` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[admissionsCycle,cid]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cid` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_applicantId_fkey";

-- DropIndex
DROP INDEX "Application_admissionsCycle_applicantId_key";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "applicantId",
ADD COLUMN     "cid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Application_admissionsCycle_cid_key" ON "Application"("admissionsCycle", "cid");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_cid_fkey" FOREIGN KEY ("cid") REFERENCES "Applicant"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;
