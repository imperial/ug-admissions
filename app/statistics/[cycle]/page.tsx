import { auth } from '@/auth'
import AdmissionsCycleStatistics from '@/components/AdmissionsCycleStatistics'
import { ApplicationsLinkButton, HomepageLinkButton } from '@/components/general/LinkButton'
import { countNextActions, getOutcomes } from '@/lib/query/applications'
import { formatCycle, prettifyOption } from '@/lib/utils'
import { Decision, NextAction } from '@prisma/client'
import { Flex, Heading } from '@radix-ui/themes'
import { map } from 'lodash'
import { redirect } from 'next/navigation'
import React from 'react'

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

  const cycle = parseInt(params.cycle)

  const outcomes = await getOutcomes(cycle)
  const applicationsCount = outcomes.length
  const offersCount = outcomes.filter((outcome) => outcome.decision === Decision.OFFER).length
  const rejectionsCount = outcomes.filter((outcome) => outcome.decision === Decision.REJECT).length

  const nextActionCountsQuery = await countNextActions(cycle)
  const nextActionCounts: { name: string; quantity: number }[] = map(NextAction, (na) => {
    return {
      name: prettifyOption(na),
      quantity: nextActionCountsQuery.find((i) => i.nextAction === na)?._count.nextAction || 0
    }
  })

  return (
    <Flex direction="column" gap="5">
      <Flex justify="between">
        <Heading size="6">Admissions Cycle Statistics: {formatCycle(cycle)}</Heading>
        <Flex gapX="2">
          <HomepageLinkButton />
          <ApplicationsLinkButton admissionsCycle={cycle.toString()} />
        </Flex>
      </Flex>

      <AdmissionsCycleStatistics
        applicationsCount={applicationsCount}
        offersCount={offersCount}
        rejectionsCount={rejectionsCount}
        nextActionCounts={nextActionCounts}
      />
    </Flex>
  )
}
