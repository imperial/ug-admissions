export enum NextActionEnum {
  TMUA_CANDIDATE,
  TMUA_RESULT,
  ADMIN_SCORING,
  REVIEWER_SCORING,
  UG_TUTOR_REVIEW,
  INFORM_CANDIDATE,
  CANDIDATE_INFORMED
}

export enum DataUploadEnum {
  APPLICANT = 'APPLICANT',
  COURSE = 'COURSE',
  TMUA_GRADES = 'TMUA_GRADES',
  USER_ROLES = 'USER_ROLES'
}

export interface FormPassbackState {
  status: string
  message: string
}
