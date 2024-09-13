/*
  Warnings:

  - The primary key for the `Applicant` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_applicantId_fkey";

-- AlterTable
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_pkey",
ADD CONSTRAINT "Applicant_pkey" PRIMARY KEY ("cid");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantCid_fkey" FOREIGN KEY ("applicantCid") REFERENCES "Applicant"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;
