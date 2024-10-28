/*
  Warnings:

  - Added the required column `entryYear` to the `Application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "entryYear" INTEGER;

UPDATE "Application" SET "entryYear" = "admissionsCycle";
ALTER TABLE "Application" ALTER COLUMN "entryYear" SET NOT NULL;
