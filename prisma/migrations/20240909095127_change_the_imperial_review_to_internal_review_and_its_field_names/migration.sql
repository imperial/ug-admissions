/*
  Warnings:

  - You are about to drop the `ImperialReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ImperialReview" DROP CONSTRAINT "ImperialReview_applicationId_fkey";

-- DropTable
DROP TABLE "ImperialReview";

-- CreateTable
CREATE TABLE "InternalReview" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "motivationAdminScore" DECIMAL(3,1),
    "extracurricularAdminScore" DECIMAL(3,1),
    "examComments" TEXT,
    "lastAdminEditBy" TEXT,
    "lastAdminEditOn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternalReview_applicationId_key" ON "InternalReview"("applicationId");

-- AddForeignKey
ALTER TABLE "InternalReview" ADD CONSTRAINT "InternalReview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
