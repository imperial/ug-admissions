'use server'

import prisma from '@/db'
import {
  formAdminSchema,
  formCommentSchema,
  formOutcomeSchema,
  formReviewerSchema,
  nextActionField
} from '@/lib/schema'
import { Decision, NextAction } from '@prisma/client'
import { includes } from 'lodash'
import { revalidatePath } from 'next/cache'

import { FormPassbackState } from '../types'

export async function upsertAdminScoring(
  currentAction: NextAction,
  applicationId: number,
  adminLogin: string,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> {
  const result = formAdminSchema.safeParse(Object.fromEntries(formData))
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

export async function upsertReviewerScoring(
  applicationId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> {
  const result = formReviewerSchema.safeParse(Object.fromEntries(formData))
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

export async function upsertOutcome(
  applicationId: number,
  partialOutcomes: { id: number; degreeCode: string }[],
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> {
  const groupedOutcomes = partialOutcomes.map(({ id, degreeCode }) => {
    const offerCode = formData.get('offerCode-'.concat(degreeCode))
    const offerText = formData.get('offerText-'.concat(degreeCode))
    const decision = formData.get('decision-'.concat(degreeCode)) as Decision
    const parsedOutcome = formOutcomeSchema.parse({ offerCode, offerText, decision })
    return { id, ...parsedOutcome }
  })

  await updateNextAction(formData.get('nextAction'), applicationId)

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

export async function insertComment(
  applicationId: number,
  admissionsCycle: number,
  authorEmail: string,
  internalReviewId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> {
  formData.set('authorLogin', authorEmail)

  const result = formCommentSchema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { status: 'error', message: result.error.issues[0].message }

  await updateNextAction(formData.get('nextAction'), applicationId)

  await prisma.comment.create({
    data: {
      admissionsCycle,
      internalReviewId,
      ...result.data
    }
  })

  revalidatePath('/')
  return { status: 'success', message: 'UG tutor form added comment successfully.' }
}

export async function updateNextAction(
  nextActionInput: FormDataEntryValue | string | null,
  applicationId: number
) {
  if (!nextActionInput || nextActionInput === 'Unchanged') return

  const nextAction = nextActionField.parse(nextActionInput)
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      nextAction
    }
  })
  revalidatePath('/')
}
