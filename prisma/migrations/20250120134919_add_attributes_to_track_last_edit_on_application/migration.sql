-- AlterTable
ALTER TABLE "InternalReview" ADD COLUMN     "lastUserEditBy" TEXT,
ADD COLUMN     "lastUserEditOn" TIMESTAMP(3);
