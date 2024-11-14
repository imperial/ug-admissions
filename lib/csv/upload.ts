'use server'

import prisma from '@/db'
import { preprocessCsvData } from '@/lib/csv/preprocessing'
import { allocateApplications } from '@/lib/reviewerAllocation'
import {
  csvAdminScoringSchema,
  csvApplicationSchema,
  csvTmuaScoresSchema,
  csvUserRolesSchema,
  parseWithSchema
} from '@/lib/schema'
import { ord } from '@/lib/utils'
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
        admissionsCycle_cid: {
          admissionsCycle,
          cid
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
function upsertApplication(applications: z.infer<typeof csvApplicationSchema>[]) {
  function calculateNextAction(currentNextAction: NextAction | undefined, isTmuaPresent: boolean) {
    if (!currentNextAction)
      return isTmuaPresent
        ? NextAction.ADMIN_SCORING_WITH_TMUA
        : NextAction.ADMIN_SCORING_MISSING_TMUA
    // don't backtrack the application state
    if (ord(currentNextAction) >= ord(NextAction.REVIEWER_SCORING)) return currentNextAction
    if (currentNextAction === NextAction.PENDING_TMUA && isTmuaPresent)
      return NextAction.REVIEWER_SCORING
    if (currentNextAction === NextAction.ADMIN_SCORING_MISSING_TMUA && isTmuaPresent)
      return NextAction.ADMIN_SCORING_WITH_TMUA
    return currentNextAction
  }

  return applications.map(async ({ applicant, application, outcome }) => {
    const currentNextAction = await getCurrentNextAction(application.admissionsCycle, applicant.cid)
    const nextNextAction = calculateNextAction(currentNextAction, isNumber(application.tmuaScore))

    return prisma.application.upsert({
      where: {
        admissionsCycle_cid: {
          admissionsCycle: application.admissionsCycle,
          cid: applicant.cid
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
function updateTmuaScores(scores: z.infer<typeof csvTmuaScoresSchema>[]) {
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
        admissionsCycle_cid: {
          admissionsCycle: s.admissionsCycle,
          cid: s.cid
        }
      },
      data: {
        tmuaScore: s.tmuaScore,
        nextAction: nextNextAction
      }
    })
  })
}

// application must already exist
function updateAdminScoring(
  assessments: z.infer<typeof csvAdminScoringSchema>[],
  userEmail: string
) {
  return assessments.map(async (a) => {
    const currentNextAction = await getCurrentNextAction(a.admissionsCycle, a.cid)
    if (!currentNextAction) return

    let nextNextAction: NextAction = currentNextAction
    if (currentNextAction === NextAction.ADMIN_SCORING_MISSING_TMUA)
      nextNextAction = NextAction.PENDING_TMUA
    if (currentNextAction === NextAction.ADMIN_SCORING_WITH_TMUA)
      nextNextAction = NextAction.REVIEWER_SCORING

    return prisma.application.update({
      where: {
        admissionsCycle_cid: {
          admissionsCycle: a.admissionsCycle,
          cid: a.cid
        }
      },
      data: {
        nextAction: nextNextAction,
        gcseQualification: a.gcseQualification,
        gcseQualificationScore: a.gcseQualificationScore,
        aLevelQualification: a.aLevelQualification,
        aLevelQualificationScore: a.aLevelQualificationScore,
        internalReview: {
          update: {
            motivationAdminScore: a.motivationAdminScore,
            extracurricularAdminScore: a.extracurricularAdminScore,
            examComments: a.examComments,
            lastAdminEditBy: userEmail,
            lastAdminEditOn: new Date()
          }
        }
      }
    })
  })
}

/**
 * Inserts roles as specified for the users
 */
function upsertUsers(users: z.infer<typeof csvUserRolesSchema>[]): Promise<User>[] {
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

function handleParsing(
  objects: unknown[],
  schema: z.ZodObject<any>,
  onSuccess: (data: any[]) => FormPassbackState | Promise<unknown>[]
) {
  const { data, errorMessage } = parseWithSchema(objects, schema)
  if (errorMessage) return { status: 'error', message: errorMessage }
  return onSuccess(data!)
}

/**
 * Process a CSV upload and upsert the data into the database
 * @param _ - unused form passback state
 * @param formData - the form data containing the CSV file and the dataUploadType
 * @param userEmail - the email of the user uploading the data for logging
 */
export const processCsvUpload = async (
  _: FormPassbackState,
  formData: FormData,
  userEmail: string
): Promise<FormPassbackState> => {
  const dataUploadTypeParseResult = z
    .nativeEnum(DataUploadEnum)
    .safeParse(formData.get('dataUploadType'))
  if (!dataUploadTypeParseResult.success) {
    return { status: 'error', message: 'Invalid dataUploadType.' }
  }
  const dataUploadType = dataUploadTypeParseResult.data
  const csv = formData.get('csv') as File
  const cycle = Number(formData.get('cycle'))

  const preprocessingResult = await preprocessCsvData(csv, dataUploadType, cycle)
  if (!preprocessingResult.success) {
    return { status: 'error', message: preprocessingResult.errorMessage }
  }
  const objects = preprocessingResult.data

  let errorMessageOrPromises: FormPassbackState | Promise<unknown>[]
  switch (dataUploadType) {
    case DataUploadEnum.APPLICATION:
      errorMessageOrPromises = handleParsing(objects, csvApplicationSchema, upsertApplication)
      break
    case DataUploadEnum.TMUA_SCORES:
      errorMessageOrPromises = handleParsing(objects, csvTmuaScoresSchema, updateTmuaScores)
      break
    case DataUploadEnum.ADMIN_SCORING:
      errorMessageOrPromises = handleParsing(objects, csvAdminScoringSchema, (data) =>
        updateAdminScoring(data, userEmail)
      )
      break
    case DataUploadEnum.USER_ROLES:
      errorMessageOrPromises = handleParsing(objects, csvUserRolesSchema, upsertUsers)
      break
  }

  if ('status' in errorMessageOrPromises) {
    return errorMessageOrPromises as FormPassbackState
  }

  const promises = errorMessageOrPromises as Promise<unknown>[]
  const successfulUpserts = await executePromises(promises)
  // Assign reviewers to applications
  if (dataUploadType === DataUploadEnum.APPLICATION) {
    try {
      await allocateApplications(successfulUpserts as Application[])
    } catch (e: any) {
      return { status: 'error', message: e.message }
    }
  }

  const noPrismaErrors = promises.length - successfulUpserts.length
  const noSuccesses = objects.length - noPrismaErrors

  if (noPrismaErrors === 0) {
    return {
      message: `All ${noSuccesses} updates or inserts succeeded`,
      status: 'success'
    }
  }
  return {
    message: `${noPrismaErrors}/${objects.length} updates or inserts failed from database errors`,
    status: 'error'
  }
}
