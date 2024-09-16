-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('PENDING', 'REJECT', 'OFFER');

-- CreateTable
CREATE TABLE "Outcome" (
    "id" SERIAL NOT NULL,
    "cid" TEXT NOT NULL,
    "admissionsCycle" INTEGER NOT NULL,
    "degreeCode" TEXT NOT NULL,
    "decision" "Decision" NOT NULL DEFAULT 'PENDING',
    "offerCode" TEXT,
    "offerText" TEXT,

    CONSTRAINT "Outcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Outcome_cid_admissionsCycle_degreeCode_key" ON "Outcome"("cid", "admissionsCycle", "degreeCode");
