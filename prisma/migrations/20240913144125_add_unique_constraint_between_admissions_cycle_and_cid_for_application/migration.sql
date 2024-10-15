/*
  Warnings:

  - A unique constraint covering the columns `[admissionsCycle,cid]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Application_admissionsCycle_cid_key" ON "Application"("admissionsCycle", "cid");
