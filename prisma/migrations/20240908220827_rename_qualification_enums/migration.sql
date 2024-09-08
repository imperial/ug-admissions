/*
  Warnings:

  - The `age16ExamType` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `age18ExamType` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "GCSEQualification" AS ENUM ('GCSE', 'INDIAN_X', 'MALAYSIAN', 'SINGAPORE', 'OTHER');

-- CreateEnum
CREATE TYPE "AlevelQualification" AS ENUM ('A_LEVEL', 'INDIAN_XII', 'MALAYSIAN', 'SINGAPORE', 'ROMANIAN', 'OTHER');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "age16ExamType",
ADD COLUMN     "age16ExamType" "GCSEQualification",
DROP COLUMN "age18ExamType",
ADD COLUMN     "age18ExamType" "AlevelQualification";

-- DropEnum
DROP TYPE "QualificationType16";

-- DropEnum
DROP TYPE "QualificationType18";
