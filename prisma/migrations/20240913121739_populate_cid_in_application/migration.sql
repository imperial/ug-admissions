-- Populate "Application".cid
UPDATE "Application"
SET "cid" = (
  SELECT cid
  FROM "Applicant"
  WHERE id = "Application"."applicantId"
);