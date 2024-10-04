import AdmissionsCycleStatistics from '@/components/AdmissionsCycleStatistics'
import prisma from '@/db'
import { Decision, NextAction } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function AdmissionsCycleStatisticsPage({
  params
}: {
  params: { cycle: string }
}) {
  const cycle = parseInt(params.cycle)

  const outcomes = await prisma.outcome.findMany({
    where: {
      application: {
        admissionsCycle: cycle
      }
    }
  })

  const noApplications = outcomes.length
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
      noApplications={noApplications}
      noOffers={noOffers}
      noRejections={noRejections}
      nextActionCounts={nextActionCounts}
    />
  )
}
