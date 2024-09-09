'use server'

import prisma from '@/db'
import { AlevelQualification, GCSEQualification, NextAction } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { NextActionEnum } from './types'

export interface FormPassbackState {
  status: string
  message: string
}

const parseScore = (entry: FormDataEntryValue | null): number | null => {
  const parsedScore = parseFloat(entry as string)
  return isNaN(parsedScore) ? null : parsedScore
}

const gcseQualificationEnum = z.nativeEnum(GCSEQualification)
const aLevelQualificationEnum = z.nativeEnum(AlevelQualification)

const adminFormSchema = z
  .object({
    gcseQualification: gcseQualificationEnum,
    gcseQualificationScore: z.coerce
      .number()
      .gte(0, { message: 'Age 16 exam score must be ≥ 0' })
      .lte(10, { message: 'Age 16 exam score must be ≤ 10' }),
    aLevelQualification: aLevelQualificationEnum,
    aLevelQualificationScore: z.coerce
      .number()
      .gte(0, { message: 'Age 18 score must be ≥ 0' })
      .lte(10, { message: 'Age 18 score must be ≤ 10' }),
    motivationAdminScore: z.coerce
      .number()
      .gte(0, { message: 'Motivation assessment score must be ≥ 0' })
      .lte(10, { message: 'Motivation assessment score must be ≤ 10' }),
    extracurricularAdminScore: z.coerce
      .number()
      .gte(0, { message: 'Extracurricular assessment score must be ≥ 0' })
      .lte(10, { message: 'Extracurricular assessment score must be ≤ 10' }),
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

function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time))
}

export const testServerAction = async (_: FormPassbackState, formData: FormData) => {
  await delay(2000)
  return { status: 'success', message: `Hello, ${formData.get('name')} ${formData.get('surname')}` }
}
