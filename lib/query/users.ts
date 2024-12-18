'use server'

import prisma from '@/db'
import { isSuperUser } from '@/lib/access'
import { Role } from '@prisma/client'

export async function getAllAdminAndTutorEmails(): Promise<string[]> {
  return (
    await prisma.user.findMany({
      select: {
        login: true
      },
      where: {
        OR: [{ role: 'ADMIN' }, { role: 'UG_TUTOR' }]
      }
    })
  ).map((user) => user.login)
}

/**
 * Only allow people who play a role in a cycle or are super users to access the platform
 */
export async function allowedAccess(userEmail: string): Promise<boolean> {
  return (
    isSuperUser(userEmail) ||
    (await prisma.user.findFirst({
      where: {
        login: userEmail
      }
    })) !== null
  )
}

/**
 * Super users, admins, and UG tutors should be able to view all admissions cycles.
 * Reviewers should only see cycles they play a role in.
 * No duplicates are returned.
 */
export async function allAllowedAdmissionsCycles(userEmail: string): Promise<string[]> {
  const allAdminsAndUgTutors = await getAllAdminAndTutorEmails()
  const isSystemAdmin = allAdminsAndUgTutors.includes(userEmail) || isSuperUser(userEmail)
  return (
    isSystemAdmin
      ? await prisma.user.findMany({
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
}

export async function getUserFromCycleAndEmail(cycle: number, userEmail: string) {
  return prisma.user.findUnique({
    where: {
      admissionsCycle_login: {
        admissionsCycle: cycle,
        login: userEmail
      }
    }
  })
}

export async function getAllReviewerLogins(cycle: number) {
  return (
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
}
