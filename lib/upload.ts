'use server'

import prisma from '@/db'
import { FeeStatus, Gender, Prisma, Role, type User } from '@prisma/client'
import { CsvError, parse } from 'csv-parse/sync'
import { ZodSchema, z } from 'zod'

import { DataUploadEnum, FormPassbackState } from './types'

import PrismaClientKnownRequestError = Prisma.PrismaClientKnownRequestError

const schemaUser = z.object({
  admissionsCycle: z.coerce.number().int().positive(),
  login: z.string(),
  role: z.nativeEnum(Role)
})

// nested schema for upserting an applicant and creating a new application
const schemaApplication = z.object({
  applicant: z.object({
    cid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
    ucasNumber: z.string().length(10, { message: 'UCAS number must be exactly 10 digits' }),
    gender: z.nativeEnum(Gender),
    firstName: z.string(),
    surname: z.string(),
    preferredName: z
      .string()
      .optional()
      .transform((value) => (!!value ? value : null)),
    email: z.string().email(),
    primaryNationality: z.string(),
    otherNationality: z
      .string()
      .optional()
      .transform((value) => (!!value ? value : null))
  }),
  application: z.object({
    hasDisability: z.boolean().optional().default(false),
    admissionsCycle: z.coerce.number().int().positive(),
    feeStatus: z.nativeEnum(FeeStatus).optional().default(FeeStatus.UNKNOWN),
    wideningParticipation: z.boolean().optional().default(false),
    applicationDate: z.string().date()
  })
})

// used to insert TMUA grades
const schemaTMUAScores = z.object({
  cid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
  tmuaPaper1Score: z.coerce.number().min(1).max(9).optional(),
  tmuaPaper2Score: z.coerce.number().min(1).max(9).optional(),
  tmuaOverallScore: z.coerce.number().min(1).max(9).optional()
})

function parseWithSchema<T extends ZodSchema>(
  objects: unknown[],
  validationSchema: T
): { data: z.infer<T>[]; noErrors: number } {
  const parsedObjects = objects.map((o) => validationSchema.safeParse(o))
  parsedObjects.forEach((o, i) => {
    if (!o.success)
      console.error(
        `Parsing error on row ${i + 1}: ${o.error.issues.map((issue) => issue.message).join('; ')}`
      )
  })
  const validObjects = parsedObjects.filter((o) => o.success).map((o) => o.data)
  return {
    data: validObjects,
    noErrors: objects.length - validObjects.length
  }
}

async function executePromises(promises: Promise<unknown>[]): Promise<number> {
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
      } else {
        console.error('Unknown prisma error')
      }
    }
  })
  return results.map((r) => r.status).filter((s) => s === 'rejected').length
}

/**
 * If the applicant does not exist, create a new applicant and application.
 * If the applicant exists and the application is for the same admissions cycle, update both the applicant and application.
 * If the applicant exists and the application is for a different admissions cycle, update the applicant and create a new application.
 * @param applications - an array of schema objects with a nested applicant and application object
 */
function upsertApplication(applications: z.infer<typeof schemaApplication>[]) {
  return applications.map((a) => {
    return prisma.applicant.upsert({
      where: {
        cid: a.applicant.cid
      },
      create: {
        ...a.applicant,
        applications: {
          create: a.application
        }
      },
      update: {
        ...a.applicant,
        applications: {
          upsert: {
            where: {
              admissionsCycle_cid: {
                admissionsCycle: a.application.admissionsCycle,
                cid: a.applicant.cid
              }
            },
            update: a.application,
            create: a.application
          }
        }
      }
    })
  })
}

function upsertTMUAScores(scores: any[]) {
  return [new Promise((resolve, reject) => {})]
}

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

export const processCsvUpload = async (
  dataUploadType: DataUploadEnum,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const csv = formData.get('csv') as File
  if (csv.name.split('.').pop() !== 'csv') return { message: 'File must be a CSV', status: 'error' }
  const lines = await csv.text()

  let objects: unknown[]
  try {
    objects = parse(lines, {
      columns: true,
      skip_empty_lines: true
    })
  } catch (e: any) {
    if (e instanceof CsvError) {
      return { message: `Error reading CSV: ${e.message}`, status: 'error' }
    }
    return { message: 'Unexpected parsing error occurred.', status: 'error' }
  }

  let upsertPromises: Promise<unknown>[]
  let noParsingErrors = 0
  switch (dataUploadType) {
    case DataUploadEnum.APPLICANT: {
      const parseResult = parseWithSchema(objects, schemaApplication)
      noParsingErrors = parseResult.noErrors
      upsertPromises = upsertApplication(parseResult.data)
      break
    }
    case DataUploadEnum.TMUA_SCORES: {
      const parseResult = parseWithSchema(objects, schemaTMUAScores)
      noParsingErrors = parseResult.noErrors
      upsertPromises = upsertTMUAScores(parseResult.data)
      break
    }
    case DataUploadEnum.USER_ROLES: {
      const parseResult = parseWithSchema(objects, schemaUser)
      noParsingErrors = parseResult.noErrors
      upsertPromises = upsertUsers(parseResult.data)
      break
    }
  }

  const noPrismaErrors = await executePromises(upsertPromises)
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
