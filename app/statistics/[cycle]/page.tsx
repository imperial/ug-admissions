import AdmissionsCycleStatistics from '@/components/AdmissionsCycleStatistics'
import prisma from '@/db'
import { Decision, NextAction } from '@prisma/client'
import _ from 'lodash'

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

  const applicationsCount = outcomes.length
  const offersCount = outcomes.filter((outcome) => outcome.decision === Decision.OFFER).length
  const rejectionsCount = outcomes.filter((outcome) => outcome.decision === Decision.REJECT).length

  const nextActionCountsQuery = await prisma.application.groupBy({
    by: ['nextAction'],
    where: {
      admissionsCycle: cycle
    },
    _count: {
      nextAction: true
    }
  })

  const nextActionCounts: { name: string; quantity: number }[] = _.map(NextAction, (na) => {
    return {
      name: na,
      quantity: nextActionCountsQuery.find((i) => i.nextAction === na)?._count.nextAction || 0
    }
  })

  return (
    <AdmissionsCycleStatistics
      cycle={params.cycle}
      applicationsCount={applicationsCount}
      offersCount={offersCount}
      rejectionsCount={rejectionsCount}
      nextActionCounts={nextActionCounts}
    />
  )
}
