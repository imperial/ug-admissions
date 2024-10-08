import { auth } from '@/auth'
import ApplicationTable from '@/components/ApplicationTable'
import NotFoundPage from '@/components/NotFoundPage'
import prisma from '@/db'
import { Role } from '@prisma/client'
import { SessionProvider } from 'next-auth/react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdmissionsCycleApplicationsPage({
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

  const applications = await prisma.application.findMany({
    orderBy: {
      applicant: {
        surname: 'asc'
      }
    },
    include: {
      applicant: true,
      internalReview: {
        include: {
          generalComments: true
        }
      },
      reviewer: true,
      outcomes: true
    },
    where: {
      admissionsCycle: cycle
    }
  })

  const reviewerIds = (
    await prisma.user.findMany({
      select: {
        login: true
      },
      where: {
        role: Role.REVIEWER,
        admissionsCycle: cycle
      },
      orderBy: {
        login: 'asc'
      }
    })
  ).map((user) => user.login)

  const userRole = await prisma.user.findUnique({
    where: {
      admissionsCycle_login: {
        admissionsCycle: cycle,
        login: userEmail
      }
    }
  })

  return userRole ? (
    <SessionProvider>
      <ApplicationTable
        applications={JSON.parse(JSON.stringify(applications))}
        reviewerIds={reviewerIds}
        user={{ email: userEmail, role: userRole.role }}
        cycle={params.cycle}
      />
    </SessionProvider>
  ) : (
    <NotFoundPage
      btnName={'Return to homepage'}
      btnUrl={'/'}
      explanation={`Admissions cycle ${params.cycle} does not exist or ${userEmail} has no role in this admissions cycle`}
    />
  )
}
