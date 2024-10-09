import {
  AlevelQualification,
  CommentType,
  Decision,
  DegreeCode,
  FeeStatus,
  GCSEQualification,
  Gender,
  NextAction,
  Role
} from '@prisma/client'
import { formatISO } from 'date-fns'
import { parse as parseDate } from 'date-fns/parse'
import { ZodSchema, z } from 'zod'

function numberSchema(from: number, to: number, fieldName: string, isNullable: boolean = false) {
  let schema = z
    .number()
    .gte(from, { message: `${fieldName} must be ≥ ${from}` })
    .lte(to, { message: `${fieldName} must be ≤ ${to}` })

  return z.preprocess(
    (val) => (val === '' ? null : Number(val)),
    isNullable ? schema.nullable() : schema
  )
}

const schemaCid = z.string().length(8, { message: 'CID must be exactly 8 characters' })
const schemaAdmissionsCycle = z.coerce.number().int().positive()

export const schemaNextAction = z.nativeEnum(NextAction)

// Schemas for forms
export const schemaFormAdmin = z
  .object({
    gcseQualification: z.nativeEnum(GCSEQualification),
    gcseQualificationScore: numberSchema(0, 10, 'Age 16 exam score'),
    aLevelQualification: z.nativeEnum(AlevelQualification),
    aLevelQualificationScore: numberSchema(0, 10, 'Age 18 exam score'),
    motivationAdminScore: numberSchema(0, 10, 'Motivation score', true),
    extracurricularAdminScore: numberSchema(0, 10, 'Extracurricular score', true),
    examComments: z.string()
  })
  .partial()

export const schemaFormReviewer = z.object({
  motivationReviewerScore: numberSchema(0, 10, 'Motivation score'),
  extracurricularReviewerScore: numberSchema(0, 10, 'Extracurricular score'),
  referenceReviewerScore: numberSchema(0, 10, 'Reference score'),
  academicComments: z.string()
})

export const schemaFormOutcome = z.object({
  offerCode: z.string(),
  offerText: z.string(),
  decision: z.nativeEnum(Decision)
})

export const schemaFormComment = z.object({
  text: z.string(),
  authorLogin: z.string(),
  type: z.nativeEnum(CommentType)
})

// ----------------------------
// Schemas for CSV uploads

// nested schema for upserting an applicant and creating a new application

export const schemaCsvApplication = z.object({
  applicant: z.object({
    cid: schemaCid,
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
    admissionsCycle: schemaAdmissionsCycle,
    feeStatus: z.nativeEnum(FeeStatus).optional().default(FeeStatus.UNKNOWN),
    wideningParticipation: z.preprocess(
      (value) => String(value).toLowerCase() === 'true',
      z.boolean()
    ),
    applicationDate: z
      .string()
      .transform((value) => formatISO(parseDate(value, 'dd/MM/yyyy HH:mm', new Date()))),
    tmuaPaper1Score: z.coerce.number().min(1).max(9).optional(),
    tmuaPaper2Score: z.coerce.number().min(1).max(9).optional(),
    tmuaOverallScore: z.coerce.number().min(1).max(9).optional(),
    extenuatingCircumstances: z.string().nullable(),
    academicEligibilityNotes: z.string().nullable()
  }),
  outcome: z.object({
    degreeCode: z.nativeEnum(DegreeCode)
  })
})

// used to insert TMUA grades
export const schemaCsvTmuaScores = z.object({
  cid: schemaCid,
  admissionsCycle: schemaAdmissionsCycle,
  tmuaPaper1Score: z.coerce.number().min(1).max(9).optional(),
  tmuaPaper2Score: z.coerce.number().min(1).max(9).optional(),
  tmuaOverallScore: z.coerce.number().min(1).max(9).optional()
})

export const schemaCsvAdminScoring = z.object({
  cid: schemaCid,
  admissionsCycle: schemaAdmissionsCycle,
  gcseQualification: z.nativeEnum(GCSEQualification),
  gcseQualificationScore: numberSchema(0, 10, 'Age 16 exam score'),
  aLevelQualification: z.nativeEnum(AlevelQualification),
  aLevelQualificationScore: numberSchema(0, 10, 'Age 18 exam score'),
  motivationAdminScore: numberSchema(0, 10, 'Motivation score', true),
  extracurricularAdminScore: numberSchema(0, 10, 'Extracurricular score', true),
  examComments: z.string().nullable()
})

export const schemaCsvUser = z.object({
  admissionsCycle: schemaAdmissionsCycle,
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
