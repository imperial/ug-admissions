'use server'

import prisma from '@/db'
import { Applicant, Gender, Role, type User } from '@prisma/client'
import { CsvError, parse } from 'csv-parse/sync'
import { z } from 'zod'

import { DataUploadEnum, FormPassbackState } from './types'

const RoleEnum = z.nativeEnum(Role)
const userInsertSchema = z.object({
  admissionsCycle: z.coerce.number().int().positive(),
  login: z.string(),
  role: RoleEnum
})

const GenderEnum = z.nativeEnum(Gender)
const applicantInsertSchema = z.object({
  cid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
  ucasNumber: z.string().length(10, { message: 'UCAS number must be exactly 10 digits' }),
  gender: GenderEnum,
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
})

const courseInsertSchema = z.object({
  degreeCode: z.string()
})

// used to insert TMUA grades
const applicationInsertSchema = z.object({
  overallGrade: z.number()
})

const schemaMap: Record<DataUploadEnum, z.ZodObject<any>> = {
  [DataUploadEnum.APPLICANT]: applicantInsertSchema,
  [DataUploadEnum.COURSE]: courseInsertSchema,
  [DataUploadEnum.APPLICATION]: applicationInsertSchema,
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

function upsertApplicants(applicants: Omit<Applicant, 'id'>[]): Promise<Applicant>[] {
  return applicants.map((a) => {
    return prisma.applicant.upsert({
      where: {
        cid: a.cid
      },
      update: a,
      create: a
    })
  })
}

async function upsertCourses(courses: any) {}

async function upsertTmuaGrades(tmuaGrades: any) {}

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
      upsertPromises = upsertApplicants(parsedObjects as Applicant[])
      break
    case DataUploadEnum.COURSE:
      upsertPromises = upsertCourses(parsedObjects)
      break
    case DataUploadEnum.APPLICATION:
      upsertPromises = upsertTmuaGrades(parsedObjects)
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
      message: `${noSuccesses}/${objects.length} users updated or inserted successfully`,
      status: 'success'
    }
  }
  return {
    message: `${totalErrors}/${objects.length} updates or inserts failed`,
    status: 'error'
  }
}
