import { auth } from '@/auth'
import DataUploadDialog from '@/components/dialog/DataUploadDialog'
import { HomepageLinkButton, StatisticsLinkButton } from '@/components/general/LinkButton'
import NotFoundPage from '@/components/general/NotFoundPage'
import { RoleBadge } from '@/components/general/RoleBadge'
import ApplicationTable from '@/components/table/ApplicationTable'
import { adminAccess, isSuperUser } from '@/lib/access'
import { getApplicationsIncludingAllNested } from '@/lib/query/applications'
import { getAllReviewerLogins, getUserFromCycleAndEmail } from '@/lib/query/users'
import { formatCycle } from '@/lib/utils'
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

  const applications = await getApplicationsIncludingAllNested(cycle)
  const user = await getUserFromCycleAndEmail(cycle, userEmail)
  const reviewerLogins = await getAllReviewerLogins(cycle)

  return isSuperUser(userEmail) || user ? (
    <SessionProvider>
      <Flex direction="column" gap="1">
        <Flex justify="between" className="mb-3">
          <Flex direction="column" gap="1">
            <Flex>
              <Heading>Applications Table: {formatCycle(cycle)}</Heading>
            </Flex>
            <Flex>
              <RoleBadge email={userEmail} role={user?.role} />
            </Flex>
          </Flex>
          <Flex gap="1">
            <HomepageLinkButton />
            <StatisticsLinkButton admissionsCycle={params.cycle} />
            <DataUploadDialog
              disabled={!adminAccess(userEmail, user?.role)}
              userEmail={userEmail}
            />
          </Flex>
        </Flex>
        <ApplicationTable
          cycle={cycle}
          applications={JSON.parse(JSON.stringify(applications))}
          reviewerLogins={reviewerLogins}
          user={{ email: userEmail, role: user?.role }}
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
