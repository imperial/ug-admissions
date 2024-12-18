'use client'

import Dropdown from '@/components/general/Dropdown'
import { ApplicationsLinkButton, StatisticsLinkButton } from '@/components/general/LinkButton'
import { isSuperUser } from '@/lib/access'
import { formatCycle } from '@/lib/utils'
import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Callout, Flex, Heading } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface SelectAdmissionsCycleProps {
  admissionsCycles: string[]
  userEmail: string
}

// Choose an applications cycle for which the user has a role.
const SelectAdmissionsCycle: FC<SelectAdmissionsCycleProps> = ({ admissionsCycles, userEmail }) => {
  const [selectedCycle, setSelectedCycle] = useState<string | undefined>(
    admissionsCycles?.[0] ?? undefined
  )

  return admissionsCycles.length > 0 ? (
    <Flex direction="column" gap="2" className="w-full">
      <Flex align="center" justify="between" gap="2">
        <Heading as="h4" size="2">
          Admissions Cycle
        </Heading>
        <Dropdown
          currentValue={selectedCycle}
          values={admissionsCycles}
          onValueChange={setSelectedCycle}
          valueFormatter={formatCycle}
          className="w-1/2"
        />
      </Flex>
      <Flex direction="column" gap="1">
        <ApplicationsLinkButton admissionsCycle={selectedCycle!} />
        <StatisticsLinkButton admissionsCycle={selectedCycle!} />
      </Flex>
    </Flex>
  ) : !isSuperUser(userEmail) ? (
    <Callout.Root color="red" className="w-4/5">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text className="text-center">
        You have not been registered as a user in any admissions cycle. Contact the administration
        team, the Undergraduate Tutor or EdTech to fix this.
      </Callout.Text>
    </Callout.Root>
  ) : null
}

export default SelectAdmissionsCycle
