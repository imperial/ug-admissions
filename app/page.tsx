import ApplicationTable from '@/components/ApplicationTable'
import prisma from '@/db'
import { Role } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const applications = await prisma.application.findMany({
    orderBy: {
      applicant: {
        surname: 'asc'
      }
    },
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
      id: true,
      reviewer: {
        select: {
          login: true
        }
      }
    }
  })

  const reviewerIds = (
    await prisma.user.findMany({
      select: {
        login: true
      },
      where: {
        role: Role.REVIEWER
      },
      orderBy: {
        login: 'asc'
      }
    })
  ).map((user) => user.login)

  return <ApplicationTable applications={applications} reviewerIds={reviewerIds} />
}
