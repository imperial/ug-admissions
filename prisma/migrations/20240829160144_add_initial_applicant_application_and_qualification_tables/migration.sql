-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('HOME', 'OVERSEAS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "QualificationType" AS ENUM ('GCSE_COMPATIBLE', 'A_LEVELS_COMPATIBLE');

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "cid" TEXT NOT NULL,
    "ucasNumber" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "firstName" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "primaryNationality" TEXT NOT NULL,
    "otherNationality" TEXT,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "applicantId" INTEGER NOT NULL,
    "admissionsCycle" INTEGER NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL,
    "wideningParticipation" BOOLEAN NOT NULL,
    "hasDisability" BOOLEAN NOT NULL,
    "feeStatus" "FeeStatus" NOT NULL,
    "tmuaPaper1Score" DECIMAL(2,1) NOT NULL,
    "tmuaPaper2Score" DECIMAL(2,1) NOT NULL,
    "tmuaOverallScore" DECIMAL(2,1) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Qualification" (
    "id" SERIAL NOT NULL,
    "type" "QualificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "score" DECIMAL(3,1) NOT NULL,
    "applicationId" INTEGER NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_cid_key" ON "Applicant"("cid");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_ucasNumber_key" ON "Applicant"("ucasNumber");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
