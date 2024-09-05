'use server'

interface FormPassbackState {
  status: string
  message: string
}

export const upsertAdminScoring = async (
  cid: string,
  prevState: FormPassbackState,
  formData: FormData
): Promise<FormPassbackState> => {
  // if type is given or score is given, then the other must be given

  const age16ExamType = formData.get('age16ExamType') as string
  const age16Score = parseFloat(formData.get('age16Score') as string)
  const age18ExamType = formData.get('age18ExamType') as string
  const age18Score = parseFloat(formData.get('age18Score') as string)

  if ((age16ExamType && !age16Score) || (!age16ExamType && age16Score)) {
    return {
      status: 'error',
      message: 'Age 16 exam type and score must be both given or both not given.'
    }
  }

  if ((age18ExamType && !age18Score) || (!age18ExamType && age18Score)) {
    return {
      status: 'error',
      message: 'Age 18 exam type and score must be both given or both not given.'
    }
  }
  return { status: 'success', message: 'Admin scoring form updated successfully.' }
}
