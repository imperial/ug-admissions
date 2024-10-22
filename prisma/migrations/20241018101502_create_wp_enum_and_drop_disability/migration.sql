/*
  Warnings:

  - You are about to drop the column `hasDisability` on the `Application` table. All the data in the column will be lost.
  - The `wideningParticipation` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WP" AS ENUM ('YES', 'NO', 'NOT_CALCULATED');

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "hasDisability",
DROP COLUMN "wideningParticipation",
ADD COLUMN     "wideningParticipation" "WP" NOT NULL DEFAULT 'NOT_CALCULATED';
