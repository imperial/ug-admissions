import prisma from '@/db'
import { Application, Role } from '@prisma/client'

/**
 * Retrieves for the admissions cycle reviewers with application count sorted in ascending order
 */
const getReviewersWithAscApplicationCount = async (cycle: number) =>
  await prisma.user.findMany({
    where: {
      role: Role.REVIEWER,
      admissionsCycle: cycle
    },
    include: {
      _count: {
        select: {
          applications: {
            where: {
              admissionsCycle: cycle
            }
          }
        }
      }
    },
    orderBy: {
      applications: {
        _count: 'asc'
      }
    }
  })

/**
 * Accepts a list of applications and assigns to a specific reviewer
 * @param applications - a list of applications that will be assigned a reviewer
 * @param reviewerId - a reviewer id to be assigned to the applications
 * @returns - a Promise that resolves to the updated user object
 */
const assignApplicationsToReviewer = (applications: Application[], reviewerId: number) =>
  prisma.user.update({
    where: {
      id: reviewerId
    },
    data: {
      applications: {
        connect: applications.map((application) => ({ id: application.id }))
      }
    }
  })

/**
 * Allocates a specified number of new applications among reviewers based on their
 * current application counts.
 *
 * PRECONDITION: initialApplicationCounts is sorted in ascending order.
 *
 * This function takes the current application count for each reviewer and distributes a given
 * number of new applications by prioritising reviewers with the smallest application count.
 * The algorithm flattens the staircase distribution of applications from left/minimum to right/maximum.
 *
 * @param initialApplicationCounts - A sorted array where each element represents the current number of
 *                            applications assigned to each reviewer
 * @param newApplications - The total number of new applications to be distributed.
 * @returns An array of tuples representing the start and end indices for application ranges.
 *          Each tuple corresponds to the range of applications assigned to a reviewer.
 *
 *                               ____
 *                             |    |
 *                         ____|    |
 *                        |         |
 *                    ____|         |
 *                   |              |
 *               ____|              |
 *              |                   |
 *          ____|                   |
 *         |                        |
 *         |_______________________|
 *
 *
 * @example
 * const ranges = allocateApplicationRanges([3, 5, 5], 4);
 * // ranges will be: [[0, 3], [3, 4], [4, 4]]
 * // Explanation: first reviewer is given 2 applications because he has the least,
 * // now application counts is [5, 5, 5]. The last 2 applications are distributed equally among
 * // the first two reviewers, and the final application count is [6, 6, 5]
 */
const allocateApplicationRanges = (
  initialApplicationCounts: number[],
  newApplications: number
): [number, number][] => {
  // PRE: initialApplicationCounts is sorted
  const currentApplicationCounts = [...initialApplicationCounts]

  let x = 0 // the horizontal coordinate along the staircase
  const lastReviewerIndex = currentApplicationCounts.length - 1

  while (newApplications > 0) {
    // skip reviewers who have same number of applications
    while (x < lastReviewerIndex && currentApplicationCounts[x + 1] == currentApplicationCounts[x])
      x++

    // enough applications to fill in the current gap at the bottom left of staircase
    let differenceInApplications: number
    if (
      x < lastReviewerIndex &&
      (x + 1) *
        (differenceInApplications =
          currentApplicationCounts[x + 1] - currentApplicationCounts[x]) <=
        newApplications
    ) {
      for (let i = 0; i < x + 1; i++) {
        currentApplicationCounts[i] += differenceInApplications
        newApplications -= differenceInApplications
      }
      // every reviewer up to and including x+1 has the same number of applications
    } else {
      // staircase is entirely flat or not enough applications to fully level staircase
      // in either case, distribute applications from left to right
      const quotient = Math.floor(newApplications / (x + 1))
      const remainder = newApplications % (x + 1)
      for (let i = 0; i < x + 1; i++) {
        const applicationsToAdd = quotient + (i < remainder ? 1 : 0)
        currentApplicationCounts[i] += applicationsToAdd
        newApplications -= applicationsToAdd
      }
    }
  }

  const allocationRanges: [number, number][] = []
  let intervalStart = 0
  for (let i = 0; i < currentApplicationCounts.length; i++) {
    const toAdd = currentApplicationCounts[i] - initialApplicationCounts[i]
    allocationRanges.push([intervalStart, intervalStart + toAdd])
    intervalStart += toAdd
  }
  return allocationRanges
}

/**
 *  Distributes a list of applications evenly among a set of reviewers. Each reviewer will be assigned
 *  a number of applications based on the total number of applications and the number of reviewers,
 *  attempting to balance the load across reviewers.
 *
 *  The function:
 *  - Retrieves the current application count per reviewer.
 *  - Gets a partition to split the total applications evenly across the reviewers (including the remainder).
 *  - Assigns applications accordingly in an asynchronous manner.
 * @param applications
 */
export const allocateApplications = async (applications: Application[]) => {
  // assign reviewers only to applications that don't have one
  applications = applications.filter((application) => application.reviewerId === null)
  if (applications.length === 0) return
  const reviewersWithCount = await getReviewersWithAscApplicationCount(
    applications[0].admissionsCycle
  )
  if (reviewersWithCount.length === 0)
    throw new Error(
      'Reviewer allocation failed because no reviewers were found. Please upload reviewers and try again.'
    )

  const slices = allocateApplicationRanges(
    reviewersWithCount.map((reviewer) => reviewer._count.applications),
    applications.length
  )
  const allocations = reviewersWithCount.map((reviewer, i) =>
    assignApplicationsToReviewer(applications.slice(...slices[i]), reviewer.id)
  )
  await Promise.all(allocations)
}
