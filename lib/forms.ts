'use server'

import prisma from '@/db'
import { AlevelQualification, GCSEQualification, NextAction } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { NextActionEnum } from './types'

export interface FormPassbackState {
  status: string
  message: string
}

const parseScore = (entry: FormDataEntryValue | null): number | null => {
  const parsedScore = parseFloat(entry as string)
  return isNaN(parsedScore) ? null : parsedScore
}

export const upsertAdminScoring = async (
  currentAction: NextActionEnum,
  applicationId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const gcseQualification = (formData.get('gcseQualification') as GCSEQualification) || undefined
  const gcseQualificationScore = parseScore(formData.get('gcseQualificationScore'))
  const aLevelQualification =
    (formData.get('aLevelQualification') as AlevelQualification) || undefined
  const aLevelQualificationScore = parseScore(formData.get('aLevelQualificationScore'))
  const motivationAdminScore = parseScore(formData.get('motivationAdminScore'))
  const extracurricularAdminScore = parseScore(formData.get('extracurricularAdminScore'))
  const examComments = formData.get('examComments') as string

  if (
    (gcseQualification && typeof gcseQualificationScore === 'undefined') ||
    (!gcseQualification && typeof gcseQualificationScore === 'number')
  ) {
    return {
      status: 'error',
      message: 'Age 16 exam type and score must be both given or both not given.'
    }
  }

  if (
    (aLevelQualification && typeof aLevelQualificationScore === 'undefined') ||
    (!aLevelQualification && typeof aLevelQualificationScore === 'number')
  ) {
    return {
      status: 'error',
      message: 'Age 18 exam type and score must be both given or both not given.'
    }
  }

  ;[
    motivationAdminScore,
    extracurricularAdminScore,
    gcseQualificationScore,
    aLevelQualificationScore
  ].forEach((score) => {
    if (score && (score < 0 || score > 10))
      return { status: 'error', message: 'Scores must be between 0.0 and 10.0.' }
  })

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
      examComments
    },
    update: {
      motivationAdminScore,
      extracurricularAdminScore,
      examComments
    }
  })

  revalidatePath('/')
  return { status: 'success', message: 'Admin scoring form updated successfully.' }
}
