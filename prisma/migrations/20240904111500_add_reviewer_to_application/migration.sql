-- CreateEnum
CREATE TYPE "Role" AS ENUM ('UG_TUTOR', 'REVIEWER', 'ADMIN', 'DEV');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "reviewerId" INTEGER;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "admissionsCycle" INTEGER NOT NULL,
    "loginId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_admissionsCycle_loginId_key" ON "User"("admissionsCycle", "loginId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
