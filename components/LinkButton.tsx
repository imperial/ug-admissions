import { BarChartIcon, HomeIcon, ReaderIcon } from '@radix-ui/react-icons'
import { Button, Flex } from '@radix-ui/themes'
import Link from 'next/link'
import React, { FC } from 'react'

interface LinkButtonProps {
  destination: string
  color: 'plum' | 'jade' | 'bronze'
  icon: React.ReactNode
  text: string
}

const LinkButton: FC<LinkButtonProps> = ({ destination, color, icon, text }) => {
  return (
    <Link href={destination}>
      <Button className="w-full" color={color}>
        <Flex align="center" justify="center" gap="2">
          {icon} {text}
        </Flex>
      </Button>
    </Link>
  )
}

export const HomepageLinkButton: FC = () => {
  return <LinkButton destination="/" color="bronze" icon={<HomeIcon />} text="Home" />
}

export const StatisticsLinkButton: FC<{ admissionsCycle: string }> = ({ admissionsCycle }) => {
  return (
    <LinkButton
      destination={`/statistics/${admissionsCycle}`}
      color="plum"
      icon={<BarChartIcon />}
      text="Statistics"
    />
  )
}

export const ApplicationsLinkButton: FC<{ admissionsCycle: string }> = ({ admissionsCycle }) => {
  return (
    <LinkButton
      destination={`/applications/${admissionsCycle}`}
      color="jade"
      icon={<ReaderIcon />}
      text="Applications"
    />
  )
}
