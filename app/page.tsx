import { signOutAction } from '@/actions/signOut'
import { auth } from '@/auth'
import AdminControlPanel from '@/components/AdminControlPanel'
import { RoleBadge } from '@/components/RoleBadge'
import SelectAdmissionsCycle from '@/components/SelectAdmissionsCycle'
import SignOutButton from '@/components/SignOutButton'
import prisma from '@/db'
import { isSuperUser } from '@/lib/access'
import { Card, Flex, Heading, Text } from '@radix-ui/themes'
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

  const allAdminsAndUgTutors = (
    await prisma.user.findMany({
      select: {
        login: true
      },
      where: {
        OR: [{ role: 'ADMIN' }, { role: 'UG_TUTOR' }]
      }
    })
  ).map((user) => user.login)
  // super users, admins and UG tutors should be able to view all admissions cycles
  // reviewers should only see cycles they play a role in
  // remove all duplicates
  const isSystemAdmin = allAdminsAndUgTutors.includes(userEmail) || isSuperUser(userEmail)
  const admissionsCycles = (
    isSystemAdmin
      ? await prisma.application.findMany({
          select: { admissionsCycle: true },
          orderBy: { admissionsCycle: 'asc' }
        })
      : await prisma.user.findMany({
          select: {
            admissionsCycle: true
          },
          where: {
            login: userEmail
          },
          orderBy: {
            login: 'asc'
          }
        })
  )
    .map((user) => user.admissionsCycle.toString())
    .filter((value, index, self) => self.indexOf(value) === index)

  return (
    <Flex direction="column" gap="3" justify="between">
      <Flex align="center" justify="between" gapX="5" className="mb-2">
        <Flex direction="column" gap="2">
          <Heading size="8">Undergraduate Admissions Portal</Heading>
          <Flex>
            {/* only a super user will see a role on this page*/}
            <RoleBadge email={userEmail} />
          </Flex>
        </Flex>
        <Flex align="center" gap="2">
          <Card className="bg-cyan-200">
            <Text>
              Logged in as: <strong>{userEmail}</strong>
            </Text>
          </Card>
          <SignOutButton signOutAction={signOutAction} />
        </Flex>
      </Flex>
      {isSystemAdmin && (
        <Flex justify="center">
          <AdminControlPanel userEmail={userEmail} />
        </Flex>
      )}
      <Flex align="center" justify="center" className="mt-4">
        <SelectAdmissionsCycle admissionsCycles={admissionsCycles} userEmail={userEmail} />
      </Flex>
    </Flex>
  )
}
