-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('PENDING', 'REJECT', 'OFFER');

-- CreateEnum
CREATE TYPE "DegreeCode" AS ENUM ('G400', 'G401', 'G700', 'GG47', 'G402', 'G501', 'G600', 'G610', 'GG14', 'GG41');

-- CreateTable
CREATE TABLE "Outcome" (
    "id" SERIAL NOT NULL,
    "cid" TEXT NOT NULL,
    "admissionsCycle" INTEGER NOT NULL,
    "degreeCode" "DegreeCode" NOT NULL,
    "decision" "Decision" NOT NULL DEFAULT 'PENDING',
    "offerCode" TEXT,
    "offerText" TEXT,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outcome_cid_admissionsCycle_degreeCode_key" ON "Outcome"("cid", "admissionsCycle", "degreeCode");

-- AddForeignKey
ALTER TABLE "Outcome" ADD CONSTRAINT "Outcome_cid_admissionsCycle_fkey" FOREIGN KEY ("cid", "admissionsCycle") REFERENCES "Application"("applicantCid", "admissionsCycle") ON DELETE RESTRICT ON UPDATE CASCADE;
