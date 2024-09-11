'use server'

import prisma from '@/db'
import { FeeStatus, Gender, Role, type User } from '@prisma/client'
import { CsvError, parse } from 'csv-parse/sync'
import { z } from 'zod'

import { DataUploadEnum, FormPassbackState } from './types'

const userInsertSchema = z.object({
  admissionsCycle: z.coerce.number().int().positive(),
  login: z.string(),
  role: z.nativeEnum(Role)
})

// nested schema for upserting an applicant and creating a new application
const applicantInsertSchema = z.object({
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
const tmuaInsertSchema = z.object({
  cid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
  tmuaPaper1Score: z.coerce.number().min(1).max(9).optional(),
  tmuaPaper2Score: z.coerce.number().min(1).max(9).optional(),
  tmuaOverallScore: z.coerce.number().min(1).max(9).optional()
})

const schemaMap: Record<DataUploadEnum, z.ZodObject<any>> = {
  [DataUploadEnum.APPLICANT]: applicantInsertSchema,
  [DataUploadEnum.TMUA_SCORES]: tmuaInsertSchema,
  [DataUploadEnum.USER_ROLES]: userInsertSchema
}

function parseWithSchema(
  objects: unknown[],
  validationSchema: z.ZodObject<any>
): { data: any[]; noErrors: number } {
  const parsedObjects = objects
    .map((o) => validationSchema.safeParse(o))
    .filter((o) => o.success)
    .map((o) => o.data)
  return { data: parsedObjects, noErrors: objects.length - parsedObjects.length }
}

async function executeUpsertPromises(upserts: Promise<any>[]): Promise<number> {
  const results = await Promise.allSettled(upserts)
  return results.map((r) => r.status).filter((s) => s === 'rejected').length
}

/**
 * If the applicant does not exist, create a new applicant and application.
 * If the applicant exists and the application is for the same admissions cycle, update both the applicant and application.
 * If the applicant exists and the application is for a different admissions cycle, update the applicant and create a new application.
 * @param applications - an array of schema objects with a nested applicant and application object
 */
function upsertApplicantWithNewApplication(applications: z.infer<typeof applicantInsertSchema>[]) {
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

function upsertTmuaScores(scores: any[]) {}

function upsertUsers(users: Omit<User, 'id'>[]): Promise<User>[] {
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

export const insertUploadedData = async (
  dataUploadType: DataUploadEnum,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const csv = formData.get('csv') as File
  if (csv.name.split('.').pop() !== 'csv') return { message: 'File must be a CSV', status: 'error' }
  const lines = await csv.text()

  let objects: Omit<any, 'id'>[]
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
  const { data: parsedObjects, noErrors: noParsingErrors } = parseWithSchema(
    objects,
    schemaMap[dataUploadType]
  )

  let upsertPromises
  switch (dataUploadType) {
    case DataUploadEnum.APPLICANT:
      upsertPromises = upsertApplicantWithNewApplication(
        parsedObjects as z.infer<typeof applicantInsertSchema>[]
      )
      break
    case DataUploadEnum.TMUA_SCORES:
      upsertPromises = upsertTmuaScores(parsedObjects)
      break
    case DataUploadEnum.USER_ROLES:
      upsertPromises = upsertUsers(parsedObjects as User[])
      break
  }

  const noPrismaErrors = await executeUpsertPromises(upsertPromises as Promise<any>[])
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
