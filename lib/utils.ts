import { NextAction } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/binary'

// null and undefined are converted to NaN
export function decimalToNumber(value: Decimal | null | undefined): number {
  return parseFloat(value?.toString() ?? '')
}

export function decimalToString(value: Decimal | null, defaultString: string = 'Missing'): string {
  const converted = decimalToNumber(value)
  if (isNaN(converted)) {
    return defaultString
  }
  return converted.toString()
}

// Define a numerical order on Prisma enum, ordinarily done by string comparison
export function ord(nextAction: NextAction): number {
  switch (nextAction) {
    case 'ADMIN_SCORING_MISSING_TMUA':
      return 0
    case 'ADMIN_SCORING_WITH_TMUA':
      return 1
    case 'PENDING_TMUA':
      return 2
    case 'REVIEWER_SCORING':
      return 3
    case 'UG_TUTOR_REVIEW':
      return 4
    case 'INFORM_CANDIDATE':
      return 5
    case 'CANDIDATE_INFORMED':
      return 6
  }
}
