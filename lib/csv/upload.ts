'use server'

import prisma from '@/db'
import { preprocessCsvData } from '@/lib/csv/preprocessing'
import { parseWithSchema, schemaApplication, schemaTMUAScores, schemaUser } from '@/lib/csv/schema'
import { allocateApplications } from '@/lib/reviewerAllocation'
import { Application, Prisma, type User } from '@prisma/client'
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
  return applications.map(({ applicant, application, outcome }) => {
    return prisma.application.upsert({
      where: {
        admissionsCycle_applicantCid: {
          admissionsCycle: application.admissionsCycle,
          applicantCid: applicant.cid
        }
      },
      update: {
        ...application,
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

function upsertTMUAScores(scores: any[]) {
  return [new Promise((resolve, reject) => {})]
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
      upsertPromises = upsertTMUAScores(parsedTMUAData)
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
