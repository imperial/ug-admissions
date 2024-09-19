import prisma from '@/db'
import { Application, Role } from '@prisma/client'

/**
 * Retrieves reviewers with application count sorted in ascending order
 */
const getReviewersWithAscApplicationCount = async () =>
  await prisma.user.findMany({
    where: {
      role: Role.REVIEWER
    },
    include: {
      _count: {
        select: {
          applications: true
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
const allocateApplicationsToReviewer = (applications: Application[], reviewerId: number) =>
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
 * Divides a total number into equal partitions and distributes the remainder evenly from the beginning.
 * @param total - The total number of items to be divided into partitions.
 * @param parts - The number of partitions to create.
 * @returns An array of tuples, where each tuple contains the start and end
 *          indices of each partition, represented as [startIndex, endIndex].
 *          The indices can be used to slice an array into the desired partitions.
 * @example
 * // Example: Dividing 10 items into 3 partitions
 * const partitions = getEqualPartition(10, 3);
 * // partitions will be: [[0, 4], [4, 7], [7, 10]]
 */
const getEqualPartition = (total: number, parts: number): [number, number][] => {
  const quotient = Math.floor(total / parts)
  const remainder = total % parts
  const result: [number, number][] = []
  let added = 0
  for (let i = 0; i < parts; i++) {
    const intervalLen = quotient + (i < remainder ? 1 : 0)
    result.push([added, added + intervalLen])
    added += intervalLen
  }
  return result
}

/**
 * Allocates a specified number of new applications among reviewers based on their
 * current application counts.
 *
 * PRECONDITION: applicationCounts must be sorted
 *
 * This function takes the current application count for each reviewer and distributes a given
 * number of new applications by prioritising reviewers with the smallest application count.
 * @param applicationCounts - A sorted array where each element represents the current number of
 *                            applications assigned to each reviewer
 * @param newApplications - The total number of new applications to be distributed.
 * @returns An array of tuples representing the start and end indices for application ranges.
 *          Each tuple corresponds to the range of applications assigned to a reviewer.
 *
 * @example
 * const ranges = allocateApplicationRanges([3, 5, 5], 4);
 * // ranges will be: [[0, 3], [3, 4], [4, 4]]
 * // Explanation: first reviewer is given 2 applications because he has the least,
 * // now application counts is [5, 5, 5]. The last 2 applications are distributed equally among
 * // the first two reviewers, and the final application count is [6, 6, 5]
 */
const allocateApplicationRanges = (
  applicationCounts: number[],
  newApplications: number
): [number, number][] => {
  // PRE: applicationCounts is sorted
  const arr = [...applicationCounts]
  let i = 0
  const res = new Array(arr.length).fill(0)

  while (newApplications > 0) {
    while (i < arr.length - 1 && arr[i + 1] == arr[i]) i++
    if (i < arr.length - 1 && (i + 1) * (arr[i + 1] - arr[i]) <= newApplications) {
      for (let j = 0; j < i + 1; j++) {
        const applicationsToAdd = arr[i + 1] - arr[i]
        res[j] += applicationsToAdd
        arr[j] += applicationsToAdd
        newApplications -= applicationsToAdd
      }
    } else {
      const quotient = Math.floor(newApplications / (i + 1))
      const remainder = newApplications % (i + 1)
      for (let j = 0; j < i + 1; j++) {
        const applicationsToAdd = quotient + (j < remainder ? 1 : 0)
        res[j] += applicationsToAdd
        arr[j] += applicationsToAdd
        newApplications -= applicationsToAdd
      }
    }
  }

  const slices: [number, number][] = []
  let added = 0
  for (let i = 0; i < res.length; i++) {
    slices.push([added, added + res[i]])
    added += res[i]
  }
  return slices
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
  const reviewersWithCount = await getReviewersWithAscApplicationCount()
  const reviewersCount = reviewersWithCount.length
  if (reviewersCount === 0)
    throw new Error(
      'Reviewer allocation failed because no reviewers were found. Please upload reviewers and try again.'
    )

  // Allocator 1
  //const slices = getEqualPartition(applications.length, reviewersCount)
  // Allocator 2
  const slices = allocateApplicationRanges(
    reviewersWithCount.map((reviewer) => reviewer._count.applications),
    applications.length
  )
  const allocations = reviewersWithCount.map((reviewer, i) =>
    allocateApplicationsToReviewer(applications.slice(...slices[i]), reviewer.id)
  )
  await Promise.all(allocations)
}
