export enum DataUploadEnum {
  APPLICANT = 'APPLICANT',
  TMUA_SCORES = 'TMUA_SCORES',
  ADMIN_ASSESSMENTS = 'ADMIN_ASSESSMENTS',
  USER_ROLES = 'USER_ROLES'
}

export interface FormPassbackState {
  status: string
  message: string
}
