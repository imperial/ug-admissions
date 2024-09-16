/*
  Warnings:

  - A unique constraint covering the columns `[admissionsCycle,applicantCid]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_admissionsCycle_applicantCid_key" ON "Application"("admissionsCycle", "applicantCid");
