/*
  Warnings:

  - A unique constraint covering the columns `[admissionsCycle,applicantId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_admissionsCycle_applicantId_key" ON "Application"("admissionsCycle", "applicantId");
