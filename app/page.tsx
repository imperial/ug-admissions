import { auth } from '@/auth'
import SelectAdmissionsCycle from '@/components/SelectAdmissionsCycle'
import prisma from '@/db'
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

  const admissionsCyclesWithRoles = (
    await prisma.user.findMany({
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
  ).map((user) => user.admissionsCycle.toString())

  return (
    <Flex direction="column">
      <Flex align="center" justify="between" gapX="5" className="mb-2">
        <Heading>Undergraduate Admissions Portal</Heading>
        <Card className="bg-cyan-200">
          <Text>
            Logged in as: <strong>{userEmail}</strong>
          </Text>
        </Card>
      </Flex>
      <Flex align="center" justify="center" className="mt-4">
        <SelectAdmissionsCycle admissionsCycles={admissionsCyclesWithRoles} />
      </Flex>
    </Flex>
  )
}
