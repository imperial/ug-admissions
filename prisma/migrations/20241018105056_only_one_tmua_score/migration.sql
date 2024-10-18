/*
  Warnings:

  - You are about to drop the column `tmuaOverallScore` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `tmuaPaper1Score` on the `Application` table. All the data in the column will be lost.
  - You are about to drop the column `tmuaPaper2Score` on the `Application` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" DROP COLUMN "tmuaOverallScore",
DROP COLUMN "tmuaPaper1Score",
DROP COLUMN "tmuaPaper2Score",
ADD COLUMN     "tmuaScore" DECIMAL(2,1);
