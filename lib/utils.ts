import { NextAction } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/binary'
import _ from 'lodash'

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
export function prettifyEnum(value: string): string {
  const ACRONYMS = ['Tmua', 'Ug', 'Gcse', 'Xii']
  return value
    .split('_')
    .map(_.capitalize)
    .map((s) => (ACRONYMS.includes(s) ? s.toUpperCase() : s))
    .join(' ')
}
