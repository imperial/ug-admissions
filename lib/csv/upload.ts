'use server'

import prisma from '@/db'
import { preprocessCsvData } from '@/lib/csv/preprocessing'
import { parseWithSchema, schemaApplication, schemaTMUAScores, schemaUser } from '@/lib/csv/schema'
import { allocateApplications } from '@/lib/reviewerAllocation'
import { Application, NextAction, Prisma, type User } from '@prisma/client'
import { isNumber } from 'lodash'
import { z } from 'zod'

import { DataUploadEnum, FormPassbackState } from '../types'

import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError

async function executePromises(promises: Promise<unknown>[]): Promise<unknown[]> {
  const results = await Promise.allSettled(promises)
  results.forEach((result) => {
    if (result.status === 'rejected') {
      if (result.reason instanceof PrismaClientKnownRequestError) {
        console.error(
          `${result.reason.code}: ${result.reason.message
            .trimStart()
            .split('\n')
            .filter((line) => !!line)
            .join('\n')}`
        )
      } else console.error(result.reason?.message ?? 'Unknown Prisma error.')
    }
  })
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
}

async function getCurrentNextAction(
  admissionsCycle: number,
  cid: string
): Promise<NextAction | undefined> {
  return prisma.application
    .findUnique({
      where: {
        admissionsCycle_applicantCid: {
          admissionsCycle: admissionsCycle,
          applicantCid: cid
        }
      }
    })
    .then((app) => app?.nextAction)
}

/**
 * If application does not exist:
 *   - creates a new outcome
 *   - creates/updates the applicant depending on whether it exists
 *
 * If application does exist:
 *   - updates the applicant (applicant must exist because application exists)
 *   - updates the outcome if degree code is the same or creates a new outcome if it is different
 * @param applications - an array of schema objects with a nested applicant and application object
 */
function upsertApplication(applications: z.infer<typeof schemaApplication>[]) {
  function calculateNextAction(currentNextAction: NextAction | undefined, isTmuaPresent: boolean) {
    if (!currentNextAction)
      return isTmuaPresent
        ? NextAction.ADMIN_SCORING_WITH_TMUA
        : NextAction.ADMIN_SCORING_MISSING_TMUA
    // don't backtrack the application state
    if (currentNextAction >= NextAction.REVIEWER_SCORING) return currentNextAction
    if (currentNextAction === NextAction.PENDING_TMUA && isTmuaPresent)
      return NextAction.REVIEWER_SCORING
    if (currentNextAction === NextAction.ADMIN_SCORING_MISSING_TMUA && isTmuaPresent)
      return NextAction.ADMIN_SCORING_WITH_TMUA
    return currentNextAction
  }

  return applications.map(async ({ applicant, application, outcome }) => {
    const currentNextAction = await getCurrentNextAction(application.admissionsCycle, applicant.cid)
    const isTmuaPresent = [
      application.tmuaPaper1Score,
      application.tmuaPaper2Score,
      application.tmuaOverallScore
    ].every(isNumber)

    const nextNextAction = calculateNextAction(currentNextAction, isTmuaPresent)

    return prisma.application.upsert({
      where: {
        admissionsCycle_applicantCid: {
          admissionsCycle: application.admissionsCycle,
          applicantCid: applicant.cid
        }
      },
      update: {
        ...application,
        nextAction: nextNextAction,
        applicant: {
          update: applicant
        },
        outcomes: {
          upsert: {
            where: {
              cid_cycle_degree: {
                cid: applicant.cid,
                admissionsCycle: application.admissionsCycle,
                degreeCode: outcome.degreeCode
              }
            },
            update: outcome,
            create: outcome
          }
        }
      },
      create: {
        ...application,
        nextAction: nextNextAction,
        applicant: {
          connectOrCreate: {
            where: {
              cid: applicant.cid
            },
            create: applicant
          }
        },
        internalReview: {
          create: {}
        },
        outcomes: {
          create: outcome
        }
      }
    })
  })
}

/**
 * Updates the TMUA scores for existing applications
 * - If current nextAction is ADMIN_SCORING_MISSING_TMUA, set nextAction to ADMIN_SCORING_WITH_TMUA
 * - If current nextAction is PENDING_TMUA, move to REVIEWER_SCORING
 * - Otherwise, nextAction is unchanged by the upload
 *
 * @param scores - an array of schema objects containing TMUA scores
 */
function updateTmuaScores(scores: z.infer<typeof schemaTMUAScores>[]) {
  return scores.map(async (s) => {
    const currentNextAction = await getCurrentNextAction(s.admissionsCycle, s.cid)
    // cannot update non-existent application
    if (!currentNextAction) return

    let nextNextAction = currentNextAction
    if (currentNextAction === NextAction.ADMIN_SCORING_MISSING_TMUA) {
      nextNextAction = NextAction.ADMIN_SCORING_WITH_TMUA
    } else if (currentNextAction === NextAction.PENDING_TMUA) {
      nextNextAction = NextAction.REVIEWER_SCORING
    }
    // if another nextAction, keep it as is

    return prisma.application.update({
      where: {
        admissionsCycle_applicantCid: {
          admissionsCycle: s.admissionsCycle,
          applicantCid: s.cid
        }
      },
      data: {
        tmuaPaper1Score: s.tmuaPaper1Score,
        tmuaPaper2Score: s.tmuaPaper2Score,
        tmuaOverallScore: s.tmuaOverallScore,
        nextAction: nextNextAction
      }
    })
  })
}

/**
 * Inserts roles as specified for the users
 */
function upsertUsers(users: z.infer<typeof schemaUser>[]): Promise<User>[] {
  return users.map((u) => {
    return prisma.user.upsert({
      where: {
        admissionsCycle_login: {
          admissionsCycle: u.admissionsCycle,
          login: u.login
        }
      },
      update: u,
      create: u
    })
  })
}

/**
 * Process a CSV upload and upsert the data into the database
 * @param _ - unused form passback state
 * @param formData - the form data containing the CSV file and the dataUploadType
 */
export const processCsvUpload = async (
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const dataUploadTypeParseResult = z
    .nativeEnum(DataUploadEnum)
    .safeParse(formData.get('dataUploadType'))
  if (!dataUploadTypeParseResult.success) {
    return { status: 'error', message: 'Invalid dataUploadType.' }
  }
  const dataUploadType = dataUploadTypeParseResult.data
  const csv = formData.get('csv') as File

  const preprocessingResult = await preprocessCsvData(csv, dataUploadType)
  if (!preprocessingResult.success) {
    return { status: 'error', message: preprocessingResult.errorMessage }
  }
  const objects = preprocessingResult.data

  let upsertPromises: Promise<unknown>[]
  let noParsingErrors: number

  switch (dataUploadType) {
    case DataUploadEnum.APPLICANT: {
      const { data: parsedApplicantData, noErrors } = parseWithSchema(objects, schemaApplication)
      noParsingErrors = noErrors
      upsertPromises = upsertApplication(parsedApplicantData)
      break
    }
    case DataUploadEnum.TMUA_SCORES: {
      const { data: parsedTMUAData, noErrors } = parseWithSchema(objects, schemaTMUAScores)
      noParsingErrors = noErrors
      upsertPromises = updateTmuaScores(parsedTMUAData)
      break
    }
    case DataUploadEnum.USER_ROLES: {
      const { data: parsedUserData, noErrors } = parseWithSchema(objects, schemaUser)
      noParsingErrors = noErrors
      upsertPromises = upsertUsers(parsedUserData)
      break
    }
  }

  const successfulUpserts = await executePromises(upsertPromises)
  // Assign reviewers to applications
  if (dataUploadType === DataUploadEnum.APPLICANT) {
    try {
      await allocateApplications(successfulUpserts as Application[])
    } catch (e: any) {
      return { status: 'error', message: e.message }
    }
  }

  const noPrismaErrors = upsertPromises.length - successfulUpserts.length
  const totalErrors = noParsingErrors + noPrismaErrors
  const noSuccesses = objects.length - totalErrors

  if (totalErrors === 0) {
    return {
      message: `${noSuccesses}/${objects.length} updates or inserts succeeded`,
      status: 'success'
    }
  }
  return {
    message: `${totalErrors}/${objects.length} updates or inserts failed`,
    status: 'error'
  }
}
