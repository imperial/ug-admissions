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

  const nextActionCountsQuery = await prisma.application.groupBy({
    by: ['nextAction'],
    where: {
      admissionsCycle: cycle
    },
    _count: {
      nextAction: true
    }
  })

  const nextActionCounts: { name: string; quantity: number }[] = []
  for (const nextAction of Object.keys(NextAction)) {
    const correspondingNumber = nextActionCountsQuery.find((item) => item.nextAction === nextAction)
      ?._count.nextAction
    nextActionCounts.push({ name: nextAction, quantity: correspondingNumber ?? 0 })
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
