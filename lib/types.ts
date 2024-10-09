export enum DataUploadEnum {
  APPLICATION = 'APPLICATION',
  TMUA_SCORES = 'TMUA_SCORES',
  ADMIN_SCORING = 'ADMIN_SCORING',
  USER_ROLES = 'USER_ROLES'
}

export interface FormPassbackState {
  status: string
  message: string
}
