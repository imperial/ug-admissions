import { DegreeCode, FeeStatus, Gender, Role } from '@prisma/client'
import { formatISO } from 'date-fns'
import { parse as parseDate } from 'date-fns/parse'
import { ZodSchema, z } from 'zod'

export const schemaNumberWithRange = (
  from: number,
  to: number,
  fieldName: string,
  isNullable: boolean = false,
  minStep: number = 0.1
) => {
  let schema = z
    .number()
    .step(minStep, { message: `${fieldName} can only be specified to a precision of ${minStep}` })
    .gte(from, { message: `${fieldName} must be ≥ ${from}` })
    .lte(to, { message: `${fieldName} must be ≤ ${to}` })

  return z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    isNullable ? schema.nullable() : schema
  )
}

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
  }),
  outcome: z.object({
    degreeCode: z.nativeEnum(DegreeCode)
  })
})

// used to insert TMUA grades
export const schemaTmuaScores = z.object({
  applicantCid: z.string().length(8, { message: 'CID must be exactly 8 characters' }),
  admissionsCycle: z.coerce.number().int().positive(),
  tmuaPaper1Score: schemaNumberWithRange(1, 9, 'TMUA Paper 1 Score'),
  tmuaPaper2Score: schemaNumberWithRange(1, 9, 'TMUA Paper 2 Score'),
  tmuaOverallScore: schemaNumberWithRange(1, 9, 'TMUA Overall Score')
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
