'use client'

import Dropdown from '@/components/general/Dropdown'
import { Decision } from '@prisma/client'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Link } from '@radix-ui/themes'
import { FC, useState } from 'react'

interface DownloadCsvButtonProps {
  cycle: string
}

const DownloadCsvButton: FC<DownloadCsvButtonProps> = ({ cycle }) => {
  const [decision, setDecision] = useState<Decision>(Decision.OFFER)

  return (
    <Flex align="center" justify="center" gap="2">
      <Flex flexBasis="80%">
        <Link
          href={`/api/download?${new URLSearchParams({ cycle, decision })}`}
          download="outcomes.csv"
          className="w-full"
        >
          <Button className="w-full" color="ruby">
            <Flex align="center" justify="center" gap="2">
              <DownloadIcon /> Download Outcomes CSV
            </Flex>
          </Button>
        </Link>
      </Flex>

      <Flex flexBasis="20%">
        <Dropdown
          onValueChange={(value) => setDecision(value as Decision)}
          values={Object.keys(Decision)}
          currentValue={decision}
        />
      </Flex>
    </Flex>
  )
}

export default DownloadCsvButton
