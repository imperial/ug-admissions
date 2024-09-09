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
    include: {
      applicant: true,
      internalReview: true,
      reviewer: true
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
