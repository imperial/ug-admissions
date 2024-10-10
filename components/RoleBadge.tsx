import { Role } from '@prisma/client'
import { Badge } from '@radix-ui/themes'
import { FC } from 'react'

const roleColourMap: Record<Role, 'lime' | 'blue' | 'purple' | 'crimson'> = {
  [Role.ADMIN]: 'lime',
  [Role.REVIEWER]: 'blue',
  [Role.UG_TUTOR]: 'purple',
  [Role.DEV]: 'crimson'
}

export const roleBadge: FC<{ role: Role }> = ({ role }) => {
  return <Badge color={roleColourMap[role]}>Role: {role}</Badge>
}
