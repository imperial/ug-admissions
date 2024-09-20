-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('NOTE', 'CANDIDATE_CHANGE_REQUEST', 'OFFER_CONDITION');

-- CreateTable
CREATE TABLE "Comment" (
    "commentNo" SERIAL NOT NULL,
    "cid" TEXT NOT NULL,
    "admissionsCycle" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "authorLogin" TEXT NOT NULL,
    "madeOn" TIMESTAMP(3) NOT NULL,
    "type" "CommentType" NOT NULL,
    "internalReviewId" INTEGER NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("commentNo")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorLogin_admissionsCycle_fkey" FOREIGN KEY ("authorLogin", "admissionsCycle") REFERENCES "User"("login", "admissionsCycle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_internalReviewId_fkey" FOREIGN KEY ("internalReviewId") REFERENCES "InternalReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
