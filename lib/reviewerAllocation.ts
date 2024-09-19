import prisma from '@/db'
import { Application, Role } from '@prisma/client'

/**
 * Retrieves reviewers with application count from the database
 */
const getReviewersWithApplicationCount = async () =>
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
    }
  })

/**
 * Accepts a list of applications to a specific reviewer
 * @param applications - a list of applications that will be assigned a reviewer
 * @param reviewerId - a reviewer id to be assigned to the applications
 */
const allocateApplicationsToReviewer = async (applications: Application[], reviewerId: number) => {
  await prisma.user.update({
    where: {
      id: reviewerId
    },
    data: {
      applications: {
        connect: applications.map((application) => ({ id: application.id }))
      }
    }
  })
}

/**
 *  Distributes a list of applications evenly among a set of reviewers. Each reviewer will be assigned
 *  a number of applications based on the total number of applications and the number of reviewers,
 *  attempting to balance the load across reviewers.
 *
 *  The function:
 *  - Retrieves the current application count per reviewer.
 *  - Computes the fair share of applications for each reviewer based on the total applications (new and already assigned).
 *  - Assigns applications accordingly, taking into account any remainder to ensure all applications are allocated.
 * @param applications
 */
export const allocateApplications = async (applications: Application[]) => {
  // assign reviewers only to applications that don't have one
  applications = applications.filter((application) => application.reviewerId === null)
  const applicationsCount = applications.length
  const reviewersWithCount = await getReviewersWithApplicationCount()
  const reviewersCount = reviewersWithCount.length
  if (reviewersCount === 0)
    throw new Error(
      'Reviewer allocation failed because no reviewers were found. Please upload reviewers and try again.'
    )
  const assignedApplicationsCount = reviewersWithCount.reduce(
    (acc, reviewer) => acc + reviewer._count.applications,
    0
  )
  const totalApplicationsCount = applicationsCount + assignedApplicationsCount
  const quotient = Math.floor(totalApplicationsCount / reviewersCount)
  const remainder = totalApplicationsCount % reviewersCount
  let assignedCount = 0
  for (const reviewer of reviewersWithCount) {
    const i = reviewersWithCount.indexOf(reviewer)
    const newApplicationsCount = quotient - reviewer._count.applications + Number(i < remainder)
    await allocateApplicationsToReviewer(
      applications.slice(assignedCount, assignedCount + newApplicationsCount),
      reviewer.id
    )
    assignedCount += newApplicationsCount
  }
}
