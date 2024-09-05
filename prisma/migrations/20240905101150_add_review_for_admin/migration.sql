/*
  Warnings:

  - You are about to drop the `Qualification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QualificationType16" AS ENUM ('GCSE', 'INDIAN_X', 'MALAYSIAN', 'SINGAPORE', 'OTHER');

-- CreateEnum
CREATE TYPE "QualificationType18" AS ENUM ('A_LEVEL', 'INDIAN_XII', 'MALAYSIAN', 'SINGAPORE', 'ROMANIAN', 'OTHER');

-- DropForeignKey
ALTER TABLE "Qualification" DROP CONSTRAINT "Qualification_applicationId_fkey";

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "age16ExamType" "QualificationType16",
ADD COLUMN     "age16Score" DECIMAL(3,1),
ADD COLUMN     "age18ExamType" "QualificationType18",
ADD COLUMN     "age18Score" DECIMAL(3,1),
ALTER COLUMN "tmuaPaper1Score" DROP NOT NULL,
ALTER COLUMN "tmuaPaper2Score" DROP NOT NULL,
ALTER COLUMN "tmuaOverallScore" DROP NOT NULL;

-- DropTable
DROP TABLE "Qualification";

-- DropEnum
DROP TYPE "QualificationType";

-- CreateTable
CREATE TABLE "ImperialReview" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "motivationAssessments" DECIMAL(3,1),
    "extracurricularAssessments" DECIMAL(3,1),
    "examComments" TEXT,
    "examRatingBy" TEXT,
    "examRatingDone" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImperialReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImperialReview_applicationId_key" ON "ImperialReview"("applicationId");

-- AddForeignKey
ALTER TABLE "ImperialReview" ADD CONSTRAINT "ImperialReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
