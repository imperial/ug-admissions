'use client'

import Dropdown from '@/components/Dropdown'
import { BarChartIcon, ExclamationTriangleIcon, ReaderIcon } from '@radix-ui/react-icons'
import { Button, Callout, Flex, Heading } from '@radix-ui/themes'
import Link from 'next/link'
import { FC, useState } from 'react'

interface SelectAdmissionsCycleProps {
  admissionsCycles: string[]
}

// Choose an applications cycle for which the user has a role.
const SelectAdmissionsCycle: FC<SelectAdmissionsCycleProps> = ({ admissionsCycles }) => {
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null)

  return admissionsCycles.length > 0 ? (
    <Flex direction="column" gap="2" align="center" justify="center">
      <Heading as="h4" size="2">
        <i>Select an admissions cycle:</i>
      </Heading>
      <Dropdown values={admissionsCycles} onValueChange={setSelectedCycle} className="mb-2" />
      {selectedCycle && (
        <Flex direction="column" gap="3">
          <Link href={`/applications/${selectedCycle}`}>
            <Button color="green" className="w-full">
              <Flex align="center" justify="center" gap="2">
                <ReaderIcon />
                Process applications
              </Flex>
            </Button>
          </Link>
          <Link href={`/statistics/${selectedCycle}`}>
            <Button color="plum" className="w-full">
              <Flex align="center" justify="center" gap="2">
                <BarChartIcon />
                View statistics
              </Flex>
            </Button>
          </Link>
        </Flex>
      )}
    </Flex>
  ) : (
    <Callout.Root color="red" className="w-4/5">
      <Callout.Icon>
        <ExclamationTriangleIcon />
      </Callout.Icon>
      <Callout.Text className="text-center">
        You have not been registered as a user in any admissions cycle. Contact the administration
        team, the Undergraduate Tutor or EdTech to fix this.
      </Callout.Text>
    </Callout.Root>
  )
}

export default SelectAdmissionsCycle
