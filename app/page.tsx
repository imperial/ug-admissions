import { auth } from '@/auth'
import ApplicationTable from '@/components/ApplicationTable'
import prisma from '@/db'
import { Role } from '@prisma/client'
import { SessionProvider } from 'next-auth/react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Redirect to login page if not authenticated
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }

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

  return (
    <SessionProvider>
      <ApplicationTable
        applications={JSON.parse(JSON.stringify(applications))}
        reviewerIds={reviewerIds}
      />
    </SessionProvider>
  )
}
