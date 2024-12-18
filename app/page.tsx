import { signOutAction } from '@/actions/signOut'
import { auth } from '@/auth'
import { RoleBadge } from '@/components/general/RoleBadge'
import AdminControlPanel from '@/components/homepage/AdminControlPanel'
import SelectAdmissionsCycle from '@/components/homepage/SelectAdmissionsCycle'
import SignOutButton from '@/components/homepage/SignOutButton'
import { isSuperUser } from '@/lib/access'
import { allAllowedAdmissionsCycles, getAllAdminAndTutorEmails } from '@/lib/query/users'
import { Card, Container, Flex, Heading, Separator } from '@radix-ui/themes'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Redirect to login page if not authenticated
  const session = await auth()
  if (!session) {
    redirect('/auth/login')
  }
  const userEmail = session?.user?.email as string

  const allAdminsAndUgTutors = await getAllAdminAndTutorEmails()
  const isSystemAdmin = allAdminsAndUgTutors.includes(userEmail) || isSuperUser(userEmail)
  const admissionsCycles = await allAllowedAdmissionsCycles(userEmail)

  return (
    <Flex direction="column" gap="3">
      <Flex justify="between" gapX="5" className="mb-2">
        <Flex direction="column" gap="2">
          <Heading size="8">Undergraduate Admissions Portal</Heading>
          <Flex direction="column" gap="2">
            {/* only a super user will see a role on this page*/}
            <RoleBadge email={userEmail} />
          </Flex>
        </Flex>
        <SignOutButton signOutAction={signOutAction} />
      </Flex>

      <Container size="1" p="3">
        <Card className="bg-amber-300">
          <Flex direction="column" gap="4">
            <SelectAdmissionsCycle admissionsCycles={admissionsCycles} userEmail={userEmail} />
            {isSystemAdmin && <Separator size="4" />}
            {isSystemAdmin && <AdminControlPanel userEmail={userEmail} />}
          </Flex>
        </Card>
      </Container>
    </Flex>
  )
}
