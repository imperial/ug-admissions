'use client'

import { BarChartIcon, HomeIcon, ReaderIcon } from '@radix-ui/react-icons'
import { Button, Flex, Link, Spinner } from '@radix-ui/themes'
import { useRouter } from 'next/navigation'
import React, { FC, useState } from 'react'

interface LinkButtonProps {
  destination: string
  color: 'plum' | 'jade' | 'bronze'
  icon: React.ReactNode
  text: string
}

const LinkButton: FC<LinkButtonProps> = ({ destination, color, icon, text }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    setLoading(true)
    router.push(destination)
  }

  return (
    <Link href={destination} onClick={handleClick}>
      <Button className="w-full" color={color}>
        <Flex align="center" justify="center" gap="2">
          {loading ? <Spinner /> : icon} {text}
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
