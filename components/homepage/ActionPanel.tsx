'use client'

import Dropdown from '@/components/general/Dropdown'
import { ApplicationsLinkButton, StatisticsLinkButton } from '@/components/general/LinkButton'
import AdminControlPanel from '@/components/homepage/AdminControlPanel'
import { formatCycle } from '@/lib/utils'
import { Card, Container, Flex, Heading, Separator } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface ActionPanelProps {
  admissionsCycles: string[]
  userEmail: string
  isSystemAdmin: boolean
}

const ActionPanel: FC<ActionPanelProps> = ({ admissionsCycles, userEmail, isSystemAdmin }) => {
  const [cycle, setCycle] = useState<string>(admissionsCycles.length > 0 ? admissionsCycles[0] : '')

  return (
    <Container size="1" p="3">
      <Card className="bg-amber-300">
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="2" className="w-full">
            <Flex align="center" justify="between" gap="2">
              <Heading as="h4" size="2">
                Admissions Cycle
              </Heading>
              <Dropdown
                currentValue={cycle}
                values={admissionsCycles}
                onValueChange={setCycle}
                valueFormatter={formatCycle}
                className="w-1/2"
              />
            </Flex>
            <Flex direction="column" gap="1">
              <ApplicationsLinkButton admissionsCycle={cycle} />
              <StatisticsLinkButton admissionsCycle={cycle} />
            </Flex>
          </Flex>

          {isSystemAdmin && (
            <>
              <Separator size="4" />
              <AdminControlPanel userEmail={userEmail} cycle={cycle} />
            </>
          )}
        </Flex>
      </Card>
    </Container>
  )
}

export default ActionPanel
