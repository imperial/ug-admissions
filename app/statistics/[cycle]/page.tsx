import { auth } from '@/auth'
import AdmissionsCycleStatistics from '@/components/AdmissionsCycleStatistics'
import prisma from '@/db'
import { Decision, NextAction } from '@prisma/client'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdmissionsCycleStatisticsPage({
  params
}: {
  params: { cycle: string }
}) {
  // Redirect to login page if not authenticated
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }

  const userEmail = session?.user?.email as string
  const cycle = parseInt(params.cycle)

  // count applications because applicants don't have cycles
  // ignore different outcomes per degree code
  const noApplicants = await prisma.application.count({
    where: {
      admissionsCycle: cycle
    }
  })

  const outcomes = await prisma.outcome.findMany({
    where: {
      application: {
        admissionsCycle: cycle
      }
    }
  })
  const noOffers = outcomes.filter((outcome) => outcome.decision === Decision.OFFER).length
  const noRejections = outcomes.filter((outcome) => outcome.decision === Decision.REJECT).length

  // Count the number of applications with each type of nextAction
  const nextActionCounts: Record<NextAction, number> = {
    ADMIN_SCORING: 0,
    CANDIDATE_INFORMED: 0,
    INFORM_CANDIDATE: 0,
    REVIEWER_SCORING: 0,
    TMUA_CANDIDATE: 0,
    TMUA_RESULT: 0,
    UG_TUTOR_REVIEW: 0
  }
  for (const nextAction of Object.values(NextAction)) {
    nextActionCounts[nextAction] = await prisma.application.count({
      where: {
        admissionsCycle: cycle,
        nextAction
      }
    })
  }

  return (
    <AdmissionsCycleStatistics
      cycle={Number(params.cycle)}
      noApplicants={noApplicants}
      noOffers={noOffers}
      noRejections={noRejections}
      nextActionCounts={nextActionCounts}
    />
  )
}
