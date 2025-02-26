'use server'

import prisma from '@/db'
import { preprocessCsvData } from '@/lib/csv/preprocessing'
import {
  csvAdminScoringSchema,
  csvApplicationSchema,
  csvTmuaScoresSchema,
  csvUserRolesSchema,
  parseWithSchema
} from '@/lib/schema'
import { ord } from '@/lib/utils'
import { NextAction, Prisma, type User } from '@prisma/client'
import { isNumber } from 'lodash'
import { z } from 'zod'

import { DataUploadEnum, FormPassbackState } from '../types'

import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError

async function executePromisesAndReturnFulfilled(promises: Promise<unknown>[]): Promise<unknown[]> {
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

function upsertApplicant(applicants: z.infer<typeof csvApplicationSchema>[]) {
  return applicants.map(async ({ applicant }) => {
    return prisma.applicant.upsert({
      where: {
        cid: applicant.cid
      },
      update: applicant,
      create: applicant
    })
  })
}

function upsertOutcome(outcomes: z.infer<typeof csvApplicationSchema>[]) {
  return outcomes.flatMap(({ applicant, courses, application }) => {
    return courses.map(async (degree) => {
      return prisma.outcome.upsert({
        where: {
          cid_cycle_degree: {
            cid: applicant.cid,
            admissionsCycle: application.admissionsCycle,
            degreeCode: degree.degreeCode
          }
        },
        update: {
          ...degree
        },
        create: {
          ...degree,
          application: {
            connect: {
              admissionsCycle_cid: {
                admissionsCycle: application.admissionsCycle,
                cid: applicant.cid
              }
            }
          }
        }
      })
    })
  })
}

function upsertApplication(applications: z.infer<typeof csvApplicationSchema>[]) {
  function calculateNextAction(currentNextAction: NextAction | undefined, isTmuaPresent: boolean) {
    if (!currentNextAction)
      return isTmuaPresent
        ? NextAction.ADMIN_SCORING_WITH_TMUA
        : NextAction.ADMIN_SCORING_MISSING_TMUA
    // don't backtrack the application state
    if (ord(currentNextAction) >= ord(NextAction.ADMIN_SCORED)) return currentNextAction
    if (currentNextAction === NextAction.PENDING_TMUA && isTmuaPresent)
      return NextAction.ADMIN_SCORED
    if (currentNextAction === NextAction.ADMIN_SCORING_MISSING_TMUA && isTmuaPresent)
      return NextAction.ADMIN_SCORING_WITH_TMUA
    return currentNextAction
  }

  return applications.map(async ({ applicant, application }) => {
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
        nextAction: nextNextAction
      },
      create: {
        ...application,
        nextAction: nextNextAction,
        internalReview: {
          create: {}
        },
        applicant: {
          connect: {
            cid: applicant.cid
          }
        }
      }
    })
  })
}

/**
 * Updates the TMUA scores for existing applications
 * - If current nextAction is ADMIN_SCORING_MISSING_TMUA, set nextAction to ADMIN_SCORING_WITH_TMUA
 * - If current nextAction is PENDING_TMUA, move to ADMIN_SCORED
 * - Otherwise, nextAction is unchanged by the upload to prevent backtracking
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
      nextNextAction = NextAction.ADMIN_SCORED
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
        tmuaScore: s.tmuaScore === 'CLEAR' ? null : s.tmuaScore,
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
      nextNextAction = NextAction.ADMIN_SCORED

    const currentTimestamp = new Date()
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
            lastAdminEditOn: currentTimestamp,
            lastUserEditBy: userEmail,
            lastUserEditOn: currentTimestamp
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

  if (dataUploadType === DataUploadEnum.APPLICATION) {
    const applicantResult = await createAndExecutePromises(
      objects,
      csvApplicationSchema,
      upsertApplicant
    )
    if (applicantResult.errorMessage) {
      return { status: 'error', message: applicantResult.errorMessage }
    }

    const applicationResult = await createAndExecutePromises(
      objects,
      csvApplicationSchema,
      upsertApplication
    )
    if (applicationResult.errorMessage) {
      console.error('Upserted applicants but failed on applications')
      return { status: 'error', message: applicationResult.errorMessage }
    }

    const outcomeResult = await createAndExecutePromises(
      objects,
      csvApplicationSchema,
      upsertOutcome
    )
    if (outcomeResult.errorMessage) {
      console.error('Upserted applicants and applications but failed on outcomes')
      return { status: 'error', message: outcomeResult.errorMessage }
    }
    // application allocation briefly disabled
    const numApplicants = applicantResult.fulfilledUpserts?.length
    const numOutcomes = outcomeResult.fulfilledUpserts?.length
    return {
      status: 'success',
      message: `Successfully input ${numApplicants} applicants applying for ${numOutcomes} courses`
    }
  } else if (dataUploadType === DataUploadEnum.TMUA_SCORES) {
    const tmuaScoresResult = await createAndExecutePromises(
      objects,
      csvTmuaScoresSchema,
      updateTmuaScores
    )
    if (tmuaScoresResult.errorMessage) {
      return { status: 'error', message: tmuaScoresResult.errorMessage }
    }
    return { status: 'success', message: tmuaScoresResult.successMessage! }
  } else if (dataUploadType === DataUploadEnum.ADMIN_SCORING) {
    const adminScoringResult = await createAndExecutePromises(
      objects,
      csvAdminScoringSchema,
      (data) => updateAdminScoring(data, userEmail)
    )
    if (adminScoringResult.errorMessage) {
      return { status: 'error', message: adminScoringResult.errorMessage }
    }
    return { status: 'success', message: adminScoringResult.successMessage! }
  } else {
    // user roles
    const userRolesResult = await createAndExecutePromises(objects, csvUserRolesSchema, upsertUsers)
    if (userRolesResult.errorMessage) {
      return { status: 'error', message: userRolesResult.errorMessage }
    }
    return { status: 'success', message: userRolesResult.successMessage! }
  }
}

async function createAndExecutePromises(
  objects: unknown[],
  schema: z.ZodObject<any>,
  upsertFunction: (data: any[]) => Promise<unknown>[]
): Promise<{
  errorMessage?: string
  successMessage?: string
  fulfilledUpserts?: unknown[]
}> {
  const errorOrPromises = handleParsing(objects, schema, upsertFunction)
  if ('status' in errorOrPromises) {
    // error occurred during parsing
    return { errorMessage: errorOrPromises.message }
  }
  const promises = errorOrPromises as Promise<unknown>[]
  const fulfilledUpserts = await executePromisesAndReturnFulfilled(promises)
  const noPrismaErrors = promises.length - fulfilledUpserts.length
  const noSuccesses = objects.length - noPrismaErrors

  if (noPrismaErrors === 0)
    return {
      successMessage: `All ${noSuccesses} updates or inserts succeeded`,
      fulfilledUpserts
    }

  return {
    errorMessage: `${noPrismaErrors}/${objects.length} updates or inserts failed from database errors`
  }
}
