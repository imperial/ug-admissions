/*
  Warnings:

  - You are about to drop the column `age16ExamType` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `age16Score` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `age18ExamType` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `age18Score` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "age16ExamType",
DROP COLUMN "age16Score",
DROP COLUMN "age18ExamType",
DROP COLUMN "age18Score",
ADD COLUMN     "aLevelQualification" "AlevelQualification",
ADD COLUMN     "aLevelQualificationScore" DECIMAL(3,1),
ADD COLUMN     "gcseQualification" "GCSEQualification",
ADD COLUMN     "gcseQualificationScore" DECIMAL(3,1);
