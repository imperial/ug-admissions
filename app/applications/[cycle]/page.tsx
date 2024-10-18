import { auth } from '@/auth'
import ApplicationTable from '@/components/ApplicationTable'
import DataUploadDialog from '@/components/DataUploadDialog'
import { HomepageLinkButton, StatisticsLinkButton } from '@/components/LinkButton'
import NotFoundPage from '@/components/NotFoundPage'
import { RoleBadge } from '@/components/RoleBadge'
import prisma from '@/db'
import { formatCycle } from '@/lib/utils'
import { Role } from '@prisma/client'
import { Flex, Heading } from '@radix-ui/themes'
import { SessionProvider } from 'next-auth/react'
import { redirect } from 'next/navigation'
import React from 'react'

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

  const user = await prisma.user.findUnique({
    where: {
      admissionsCycle_login: {
        admissionsCycle: cycle,
        login: userEmail
      }
    }
  })

  return user ? (
    <SessionProvider>
      <Flex direction="column" gap="1">
        <Flex justify="between" className="mb-3">
          <Flex direction="column" gap="1">
            <Flex>
              <Heading>Applications Table: {formatCycle(cycle)}</Heading>
            </Flex>
            <Flex>
              <RoleBadge role={user.role} />
            </Flex>
          </Flex>
          <Flex gap="1">
            <HomepageLinkButton />
            <StatisticsLinkButton admissionsCycle={params.cycle} />
            <DataUploadDialog
              disabled={user.role !== Role.UG_TUTOR && user.role !== Role.ADMIN}
              userEmail={user.login}
            />
          </Flex>
        </Flex>
        <ApplicationTable
          applications={JSON.parse(JSON.stringify(applications))}
          reviewerIds={reviewerIds}
          user={{ email: userEmail, role: user.role }}
        />
      </Flex>
    </SessionProvider>
  ) : (
    <NotFoundPage
      btnName="Return to homepage"
      btnUrl="/"
      explanation={`Admissions cycle ${params.cycle} does not exist or ${userEmail} has no role in this admissions cycle`}
    />
  )
}
