/*
  Warnings:

  - The primary key for the `Applicant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Applicant` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Applicant_cid_key" CASCADE;

-- AlterTable
ALTER TABLE "Applicant" DROP CONSTRAINT "Applicant_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Applicant_pkey" PRIMARY KEY ("cid");
