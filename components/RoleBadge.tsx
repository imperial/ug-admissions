import { prettifyOption } from '@/lib/utils'
import { Role } from '@prisma/client'
import { Badge } from '@radix-ui/themes'
import { FC } from 'react'

const roleColourMap: Record<Role, 'lime' | 'blue' | 'crimson' | 'tomato'> = {
  [Role.ADMIN]: 'lime',
  [Role.REVIEWER]: 'blue',
  [Role.UG_TUTOR]: 'crimson',
  [Role.DEV]: 'tomato'
}

interface RoleBadgeProps {
  role: Role
}

export const RoleBadge: FC<RoleBadgeProps> = ({ role }) => {
  return (
    <Badge color={roleColourMap[role]} size="3">
      <strong>{prettifyOption(role)}</strong>
    </Badge>
  )
}
