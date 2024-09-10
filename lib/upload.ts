'use server'

import prisma from '@/db'
import { Role, type User } from '@prisma/client'
import { CsvError, parse } from 'csv-parse/sync'
import { z } from 'zod'

import { DataUploadEnum, FormPassbackState } from './types'

const RoleEnum = z.nativeEnum(Role)

const userInsertSchema = z.object({
  admissionsCycle: z.coerce.number().int().positive(),
  login: z.string(),
  role: RoleEnum
})

const applicantInsertSchema = z.object({
  cid: z.number().int().positive()
})

const courseInsertSchema = z.object({
  degreeCode: z.string()
})

const tmuaGradesInsertSchema = z.object({
  overallGrade: z.number()
})

const schemaMap: Record<DataUploadEnum, z.ZodObject<any>> = {
  [DataUploadEnum.APPLICANT]: applicantInsertSchema,
  [DataUploadEnum.COURSE]: courseInsertSchema,
  [DataUploadEnum.TMUA_GRADES]: tmuaGradesInsertSchema,
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

async function upsertUsers(users: Omit<User, 'id'>[]) {
  const userUpserts = users.map((u) => {
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
  await Promise.all(userUpserts)
}

async function upsertApplicants(applicants: any) {}

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

  let validationSchema: z.ZodObject<any> = schemaMap[dataUploadType]
  const { data: parsedObjects, noErrors: noParsingErrors } = parseWithSchema(
    objects,
    validationSchema
  )

  switch (dataUploadType) {
    case DataUploadEnum.APPLICANT:
      await upsertApplicants(parsedObjects)
      break
    case DataUploadEnum.COURSE:
      await upsertCourses(parsedObjects)
      break
    case DataUploadEnum.TMUA_GRADES:
      await upsertTmuaGrades(parsedObjects)
      break
    case DataUploadEnum.USER_ROLES:
      await upsertUsers(parsedObjects as User[])
      break
  }

  const noSuccesses = objects.length - noParsingErrors
  if (noParsingErrors === 0) {
    return {
      message: `${noSuccesses}/${objects.length} users updated or inserted successfully`,
      status: 'success'
    }
  }
  return {
    message: `${noParsingErrors}/${objects.length} updates or inserts failed`,
    status: 'error'
  }
}
