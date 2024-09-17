-- AlterTable
ALTER TABLE "InternalReview" ADD COLUMN     "academicComments" TEXT,
ADD COLUMN     "extracurricularReviewerScore" DECIMAL(3,1),
ADD COLUMN     "motivationReviewerScore" DECIMAL(3,1),
ADD COLUMN     "referenceReviewerScore" DECIMAL(3,1);
