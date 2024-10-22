import { NextAction } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/binary'
import { capitalize } from 'lodash'

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

const orderedActions: NextAction[] = Object.values(NextAction)

// Define a numerical order on Prisma enum, ordinarily done by string comparison
export function ord(nextAction: NextAction): number {
  return orderedActions.indexOf(nextAction)
}

// convert to title case and replace '_ 'with ' '
export function prettifyOption(value: string): string {
  // leave emails untouched
  if (value.includes('@')) return value
  const ACRONYMS = ['Tmua', 'Ug', 'Gcse', 'Xii']
  return value
    .split('_')
    .map(capitalize)
    .map((s) => (ACRONYMS.includes(s) ? s.toUpperCase() : s))
    .join(' ')
}

export function prettifyReviewerEmail(email: string | undefined): string {
  if (!email) return 'Not allocated'
  // remove shared suffix from email addresses to save space
  return email.replace(/@.*$/, '')
}

export function formatCycle(cycle: number): string {
  const s = cycle.toString()
  return s.slice(0, 2) + '/' + s.slice(2)
}
