import { isSuperUser } from '@/lib/access'
import { prettifyOption, shortenEmail } from '@/lib/utils'
import { Role } from '@prisma/client'
import { Badge, Flex, Text } from '@radix-ui/themes'
import { FC } from 'react'

const roleColourMap: Record<Role, 'lime' | 'blue' | 'crimson'> = {
  [Role.ADMIN]: 'lime',
  [Role.REVIEWER]: 'blue',
  [Role.UG_TUTOR]: 'crimson'
}

interface RoleBadgeProps {
  email: string
  role?: Role
}

export const RoleBadge: FC<RoleBadgeProps> = ({ email, role }) => {
  if (!isSuperUser(email) && !role) return null

  const color = isSuperUser(email) ? 'red' : roleColourMap[role!]
  return (
    <Flex direction="row" gap="3" align="center">
      <Text weight="light" size="3">
        {shortenEmail(email)}
      </Text>
      <Badge color={color} size="3">
        <Text weight="bold">{isSuperUser(email) ? 'Super User' : prettifyOption(role!)}</Text>
      </Badge>
    </Flex>
  )
}
