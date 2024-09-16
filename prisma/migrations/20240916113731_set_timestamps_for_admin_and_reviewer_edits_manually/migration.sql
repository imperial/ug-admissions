-- AlterTable
ALTER TABLE "InternalReview" ADD COLUMN     "lastReviewerEditOn" TIMESTAMP(3),
ALTER COLUMN "lastAdminEditOn" DROP NOT NULL;
