export enum NextActionEnum {
  ADMIN_SCORING_MISSING_TMUA,
  ADMIN_SCORING_WITH_TMUA,
  PENDING_TMUA,
  REVIEWER_SCORING,
  UG_TUTOR_REVIEW,
  INFORM_CANDIDATE,
  CANDIDATE_INFORMED
}

export enum DataUploadEnum {
  APPLICANT = 'APPLICANT',
  TMUA_SCORES = 'TMUA_SCORES',
  USER_ROLES = 'USER_ROLES'
}

export interface FormPassbackState {
  status: string
  message: string
}
