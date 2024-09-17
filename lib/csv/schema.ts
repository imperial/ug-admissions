import { FeeStatus, Gender, Role } from '@prisma/client'
import { formatISO } from 'date-fns'
import { parse as parseDate } from 'date-fns/parse'
import { ZodSchema, z } from 'zod'

// nested schema for upserting an applicant and creating a new application
export const schemaApplication = z.object({
  applicant: z.object({
    cid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
    ucasNumber: z.string().length(10, { message: 'UCAS number must be exactly 10 digits' }),
    gender: z.nativeEnum(Gender),
    firstName: z.string(),
    surname: z.string(),
    preferredName: z.string().nullable(),
    dateOfBirth: z
      .string()
      .transform((value) => formatISO(parseDate(value, 'dd/MM/yyyy', new Date()))),
    email: z.string().email(),
    primaryNationality: z.string(),
    otherNationality: z.string().nullable()
  }),
  application: z.object({
    hasDisability: z.preprocess((value) => String(value).toLowerCase() === 'true', z.boolean()),
    admissionsCycle: z.coerce.number().int().positive(),
    feeStatus: z.nativeEnum(FeeStatus).optional().default(FeeStatus.UNKNOWN),
    wideningParticipation: z.preprocess(
      (value) => String(value).toLowerCase() === 'true',
      z.boolean()
    ),
    applicationDate: z
      .string()
      .transform((value) => formatISO(parseDate(value, 'dd/MM/yyyy HH:mm', new Date()))),
    extenuatingCircumstances: z.string().nullable(),
    academicEligibilityNotes: z.string().nullable()
  })
})

// used to insert TMUA grades
export const schemaTMUAScores = z.object({
  cid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
  tmuaPaper1Score: z.coerce.number().min(1).max(9).optional(),
  tmuaPaper2Score: z.coerce.number().min(1).max(9).optional(),
  tmuaOverallScore: z.coerce.number().min(1).max(9).optional()
})

export const schemaUser = z.object({
  admissionsCycle: z.coerce.number().int().positive(),
  login: z.string(),
  role: z.nativeEnum(Role)
})

export function parseWithSchema<T extends ZodSchema>(
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
