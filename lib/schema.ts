import {
  AlevelQualification,
  CommentType,
  Decision,
  DegreeCode,
  FeeStatus,
  GCSEQualification,
  Gender,
  NextAction,
  Role,
  WP
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

const cidField = z.string().length(8, { message: 'CID must be exactly 8 characters' })
const admissionsCycleField = z.coerce
  .number()
  .int()
  .min(2020, { message: 'Admissions cycle must be in the 2020s or later' })

export const nextActionField = z.nativeEnum(NextAction)

// Schemas for forms
export const formAdminSchema = z
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

export const formReviewerSchema = z.object({
  motivationReviewerScore: numberSchema(0, 10, 'Motivation score'),
  extracurricularReviewerScore: numberSchema(0, 10, 'Extracurricular score'),
  referenceReviewerScore: numberSchema(0, 10, 'Reference score'),
  academicComments: z.string()
})

export const formOutcomeSchema = z.object({
  offerCode: z.string(),
  offerText: z.string(),
  decision: z.nativeEnum(Decision)
})

export const formCommentSchema = z.object({
  text: z.string(),
  authorLogin: z.string(),
  type: z.nativeEnum(CommentType)
})

// ----------------------------
// Schemas for CSV uploads

// nested schema for upserting an applicant and creating a new application
export const csvApplicationSchema = z.object({
  applicant: z.object({
    cid: cidField,
    ucasNumber: z.string().length(10, { message: 'UCAS number must be exactly 10 digits' }),
    gender: z.nativeEnum(Gender),
    firstName: z.string(),
    surname: z.string(),
    preferredName: z.string().nullable(),
    dateOfBirth: z
      .string()
      .transform((value) => formatISO(parseDate(value, 'dd/MM/yyyy', new Date()))),
    email: z.string().email(),
    primaryNationality: z.string()
  }),
  application: z.object({
    admissionsCycle: admissionsCycleField,
    feeStatus: z.nativeEnum(FeeStatus).optional().default(FeeStatus.UNKNOWN),
    wideningParticipation: z.nativeEnum(WP).optional().default(WP.NOT_CALCULATED),
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

export const csvTmuaScoresSchema = z.object({
  cid: cidField,
  admissionsCycle: admissionsCycleField,
  tmuaPaper1Score: numberSchema(1, 9, 'TMUA Paper 1 score'),
  tmuaPaper2Score: numberSchema(1, 9, 'TMUA Paper 2 score'),
  tmuaOverallScore: numberSchema(1, 9, 'TMUA overall score')
})

export const csvAdminScoringSchema = z.object({
  cid: cidField,
  admissionsCycle: admissionsCycleField,
  gcseQualification: z.nativeEnum(GCSEQualification),
  gcseQualificationScore: numberSchema(0, 10, 'Age 16 exam score'),
  aLevelQualification: z.nativeEnum(AlevelQualification),
  aLevelQualificationScore: numberSchema(0, 10, 'Age 18 exam score'),
  motivationAdminScore: numberSchema(0, 10, 'Motivation score', true),
  extracurricularAdminScore: numberSchema(0, 10, 'Extracurricular score', true),
  examComments: z.string().nullable()
})

export const csvUserRolesSchema = z.object({
  admissionsCycle: admissionsCycleField,
  login: z.string().email(),
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
