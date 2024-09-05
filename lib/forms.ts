'use server'

import prisma from '@/db'
import { QualificationType16, QualificationType18 } from '@prisma/client'

interface FormPassbackState {
  status: string
  message: string
}

const parseScore = (entry: FormDataEntryValue | null): number | undefined => {
  const parsedScore = parseFloat(entry as string)
  return isNaN(parsedScore) ? undefined : parsedScore
}

export const upsertAdminScoring = async (
  applicationId: number,
  _: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  const age16ExamType = (formData.get('age16ExamType') as QualificationType16) || undefined
  const age16Score = parseScore(formData.get('age16Score'))
  const age18ExamType = (formData.get('age18ExamType') as QualificationType18) || undefined
  const age18Score = parseScore(formData.get('age18Score'))
  const motivationAssessments = parseScore(formData.get('motivationAssessments'))
  const extracurricularAssessments = parseScore(formData.get('extracurricularAssessments'))
  const examComments = formData.get('examComments') as string

  if (
    (age16ExamType && typeof age16Score === 'undefined') ||
    (!age16ExamType && typeof age16Score === 'number')
  ) {
    return {
      status: 'error',
      message: 'Age 16 exam type and score must be both given or both not given.'
    }
  }

  if (
    (age18ExamType && typeof age18Score === 'undefined') ||
    (!age18ExamType && typeof age18Score === 'number')
  ) {
    return {
      status: 'error',
      message: 'Age 18 exam type and score must be both given or both not given.'
    }
  }

  ;[motivationAssessments, extracurricularAssessments, age16Score, age18Score].forEach((score) => {
    if (score && (score < 0 || score > 10))
      return { status: 'error', message: 'Scores must be between 0.0 and 10.0.' }
  })

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      age16ExamType,
      age16Score,
      age18ExamType,
      age18Score
    }
  })

  await prisma.imperialReview.upsert({
    where: {
      applicationId
    },
    create: {
      applicationId,
      motivationAssessments,
      extracurricularAssessments,
      examComments
    },
    update: {
      motivationAssessments,
      extracurricularAssessments,
      examComments
    }
  })

  console.log('submitted')
  return { status: 'success', message: 'Admin scoring form updated successfully.' }
}
