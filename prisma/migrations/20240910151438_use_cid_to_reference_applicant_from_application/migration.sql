-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_applicantId_fkey";

-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "applicantId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;
