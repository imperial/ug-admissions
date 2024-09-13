/*
  Warnings:

  - You are about to drop the column `id` on the `Applicant` table. All the data in the column will be lost.
  - You are about to drop the column `applicantId` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "id";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "applicantId";
