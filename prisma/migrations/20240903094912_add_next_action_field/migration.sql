-- CreateEnum
CREATE TYPE "NextAction" AS ENUM ('TMUA_CANDIDATE', 'TMUA_RESULT', 'ADMIN_SCORING', 'REVIEWER_SCORING', 'UG_TUTOR_REVIEW', 'INFORM_CANDIDATE', 'CANDIDATE_INFORMED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "nextAction" "NextAction" NOT NULL DEFAULT 'TMUA_CANDIDATE';