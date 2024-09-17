'use server'

import prisma from '@/db'
import { AlevelQualification, GCSEQualification, NextAction } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { FormPassbackState, NextActionEnum } from './types'

const gcseQualificationEnum = z.nativeEnum(GCSEQualification)
const aLevelQualificationEnum = z.nativeEnum(AlevelQualification)

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

const adminFormSchema = z
  .object({
    gcseQualification: gcseQualificationEnum,
    gcseQualificationScore: numberSchema(0, 10, 'Age 16 exam score'),
    aLevelQualification: aLevelQualificationEnum,
    aLevelQualificationScore: numberSchema(0, 10, 'Age 18 exam score'),
    motivationAdminScore: numberSchema(0, 10, 'Motivation Assessments', true),
    extracurricularAdminScore: numberSchema(0, 10, 'Extracurricular Assessments', true),
    examComments: z.string()
  })
  .partial()

export const upsertAdminScoring = async (
  currentAction: NextActionEnum,
  applicationId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const result = adminFormSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { status: 'error', message: result.error.issues[0].message }
  const {
    gcseQualification,
    gcseQualificationScore,
    aLevelQualification,
    aLevelQualificationScore,
    motivationAdminScore,
    extracurricularAdminScore,
    examComments
  } = result.data

  // admin form can be updated at later stages so make sure to reset to the furthest stage
  const nextActionEnum = Math.max(currentAction, NextActionEnum.REVIEWER_SCORING)
  const nextAction = Object.keys(NextAction)[nextActionEnum] as NextAction

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      gcseQualification,
      gcseQualificationScore,
      aLevelQualification,
      aLevelQualificationScore,
      nextAction
    }
  })

  await prisma.internalReview.upsert({
    where: {
      applicationId
    },
    create: {
      applicationId,
      motivationAdminScore,
      extracurricularAdminScore,
      examComments,
      lastAdminEditBy: 'admin', // TODO: get the actual admin user
      lastAdminEditOn: new Date()
    },
    update: {
      motivationAdminScore,
      extracurricularAdminScore,
      examComments,
      lastAdminEditBy: 'admin', // TODO: get the actual admin user
      lastAdminEditOn: new Date()
    }
  })

  revalidatePath('/')
  return { status: 'success', message: 'Admin scoring form updated successfully.' }
}

const reviewerFormSchema = z.object({
  motivationReviewerScore: numberSchema(0, 10, 'Motivation Score'),
  extracurricularReviewerScore: numberSchema(0, 10, 'Extracurricular Score'),
  referenceReviewerScore: numberSchema(0, 10, 'Reference Score'),
  academicComments: z.string()
})

export const upsertReviewerScoring = async (
  applicationId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const result = reviewerFormSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { status: 'error', message: result.error.issues[0].message }
  const {
    motivationReviewerScore,
    extracurricularReviewerScore,
    referenceReviewerScore,
    academicComments
  } = result.data

  // move the application to the next stage: UG_TUTOR_REVIEW
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      nextAction: NextAction.UG_TUTOR_REVIEW
    }
  })

  await prisma.internalReview.update({
    where: { applicationId },
    data: {
      motivationReviewerScore,
      extracurricularReviewerScore,
      referenceReviewerScore,
      academicComments,
      lastReviewerEditOn: new Date()
    }
  })

  revalidatePath('/')
  return { status: 'success', message: 'Reviewer scoring form updated successfully.' }
}

export const upsertUgTutor = async (
  currentAction: NextActionEnum,
  applicationId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  revalidatePath('/')
  return { status: 'success', message: 'UG tutor form updated successfully.' }
}
