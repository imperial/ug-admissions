import prisma from '@/db'
import { Application, Role } from '@prisma/client'

/**
 * Retrieves reviewers with application count from the database
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

  const slices = getEqualPartition(applications.length, reviewersCount)
  const allocations = reviewersWithCount.map((reviewer, i) =>
    allocateApplicationsToReviewer(applications.slice(...slices[i]), reviewer.id)
  )
  await Promise.all(allocations)
}
