import ApplicationTable from '@/components/ApplicationTable'
import FilterDropdown from '@/components/TanstackTable/FilterDropdown'
import prisma from '@/db'
import { Role } from '@prisma/client'
import { Card } from '@radix-ui/themes'

import FilterBar from './FilterBar'

export default async function Home() {
  const applications = await prisma.application.findMany({
    select: {
      applicant: {
        select: {
          cid: true,
          ucasNumber: true,
          firstName: true,
          surname: true
        }
      },
      feeStatus: true,
      wideningParticipation: true,
      nextAction: true,
      reviewer: {
        select: {
          loginId: true
        }
      }
    }
  })

  const reviewerIds = (
    await prisma.user.findMany({
      select: {
        id: true
      },
      where: {
        role: Role.REVIEWER
      }
    })
  ).map((user) => user.id)

  return (
    <>
      <ApplicationTable applications={applications} reviewerIds={reviewerIds} />
    </>
  )
}
