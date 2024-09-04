import ApplicationTable from '@/components/ApplicationTable'
import prisma from '@/db'

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

  return <ApplicationTable applications={applications} />
}
