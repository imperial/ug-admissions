'use server'

import prisma from '@/db'
import {
  AlevelQualification,
  CommentType,
  Decision,
  GCSEQualification,
  NextAction
} from '@prisma/client'
import { includes } from 'lodash'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { FormPassbackState } from './types'

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
    motivationAdminScore: numberSchema(0, 10, 'Motivation Score', true),
    extracurricularAdminScore: numberSchema(0, 10, 'Extracurricular Score', true),
    examComments: z.string()
  })
  .partial()

export const upsertAdminScoring = async (
  currentAction: NextAction,
  applicationId: number,
  adminLogin: string,
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

  let nextAction: NextAction = NextAction.REVIEWER_SCORING
  // don't backtrack the application state
  if (currentAction > nextAction) nextAction = currentAction
  if (includes([NextAction.ADMIN_SCORING_MISSING_TMUA, NextAction.PENDING_TMUA], currentAction))
    nextAction = NextAction.PENDING_TMUA

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
      lastAdminEditBy: adminLogin,
      lastAdminEditOn: new Date()
    },
    update: {
      motivationAdminScore,
      extracurricularAdminScore,
      examComments,
      lastAdminEditBy: adminLogin,
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

const outcomeSchema = z.object({
  offerCode: z.string(),
  offerText: z.string(),
  decision: z.nativeEnum(Decision)
})

const nextActionSchema = z.nativeEnum(NextAction)

export const upsertOutcome = async (
  applicationId: number,
  partialOutcomes: { id: number; degreeCode: string }[],
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const groupedOutcomes = partialOutcomes.map(({ id, degreeCode }) => {
    const offerCode = formData.get('offerCode-'.concat(degreeCode))
    const offerText = formData.get('offerText-'.concat(degreeCode))
    const decision = formData.get('decision-'.concat(degreeCode)) as Decision
    const parsedOutcome = outcomeSchema.parse({ offerCode, offerText, decision })
    return { id, ...parsedOutcome }
  })

  const nextAction = nextActionSchema.parse(formData.get('nextAction'))
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      nextAction
    }
  })

  for (const { id, offerCode, offerText, decision } of groupedOutcomes) {
    await prisma.outcome.update({
      where: { id },
      data: {
        offerCode,
        offerText,
        decision
      }
    })
  }

  revalidatePath('/')
  return { status: 'success', message: 'UG tutor form updated outcome successfully.' }
}

const commentSchema = z.object({
  text: z.string(),
  authorLogin: z.string(),
  type: z.nativeEnum(CommentType)
})

export const insertComment = async (
  cid: string,
  admissionsCycle: number,
  ugTutorEmail: string,
  internalReviewId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  formData.set('authorLogin', ugTutorEmail)

  const result = commentSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { status: 'error', message: result.error.issues[0].message }

  await prisma.comment.create({
    data: {
      cid,
      admissionsCycle,
      internalReviewId,
      ...result.data
    }
  })

  revalidatePath('/')
  return { status: 'success', message: 'UG tutor form added comment successfully.' }
}
