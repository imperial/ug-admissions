import ApplicationTable from '@/components/ApplicationTable'
import prisma from '@/db'

export const dynamic = 'force-dynamic'

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
      nextAction: true
    }
  })

  return <ApplicationTable applications={applications} />
}
