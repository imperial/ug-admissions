-- CreateEnum
CREATE TYPE "NextAction" AS ENUM ('ADMIN_SCORING_MISSING_TMUA', 'ADMIN_SCORING_WITH_TMUA', 'PENDING_TMUA', 'REVIEWER_SCORING', 'UG_TUTOR_REVIEW', 'INFORM_CANDIDATE', 'CANDIDATE_INFORMED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "nextAction" "NextAction" NOT NULL DEFAULT 'ADMIN_SCORING_MISSING_TMUA';
