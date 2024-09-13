-- Populate "Application".applicantCid
UPDATE "Application"
SET "applicantCid" = (
  SELECT cid
  FROM "Applicant"
  WHERE id = "Application"."applicantId"
);