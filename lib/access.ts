import { UGA_ADMINS } from '@/lib/env'
import { Role } from '@prisma/client'

export function isSuperUser(userEmail: string): boolean {
  return UGA_ADMINS.includes(userEmail)
}

export function adminAccess(userEmail: string, userRole?: Role): boolean {
  return isSuperUser(userEmail) || userRole === Role.ADMIN || userRole === Role.UG_TUTOR
}

export function reviewerAccess(reviewerEmail: string | undefined, userEmail: string): boolean {
  // only the assigned reviewer
  return reviewerEmail === userEmail
}
