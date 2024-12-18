'use server'

import prisma from '@/db'

export async function getApplicationsIncludingAllNested(cycle: number) {
  return prisma.application.findMany({
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
}

export async function getOutcomes(cycle: number) {
  return prisma.outcome.findMany({
    where: {
      application: {
        admissionsCycle: cycle
      }
    }
  })
}

export async function countNextActions(cycle: number) {
  return prisma.application.groupBy({
    by: ['nextAction'],
    where: {
      admissionsCycle: cycle
    },
    _count: {
      nextAction: true
    }
  })
}
