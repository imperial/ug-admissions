-- Prisma Database Comments Generator v1.0.1

-- Application comments
COMMENT ON COLUMN "Application"."gcseQualification" IS 'gcseQualification is an enum that corresponds to age 16, GCSE-equivalent qualification type';
COMMENT ON COLUMN "Application"."aLevelQualification" IS 'aLevelQualification is an enum that corresponds to age 18, A-Level-equivalent qualification type';
COMMENT ON COLUMN "Application"."nextAction" IS 'nextAction is an enum referring to the action pending completion for the application to progress';
