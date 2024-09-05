import prisma from '@/db'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const applicationId = parseInt(params.id)

  const previousAdminData = await prisma.application.findUnique({
    where: {
      id: applicationId
    },
    select: {
      age16ExamType: true,
      age16Score: true,
      age18ExamType: true,
      age18Score: true,
      imperialReview: {
        select: {
          motivationAssessments: true,
          extracurricularAssessments: true,
          examComments: true,
          examRatingBy: true,
          examRatingDone: true
        }
      }
    }
  })

  if (previousAdminData === null) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(JSON.stringify(previousAdminData), { status: 200 })
}
