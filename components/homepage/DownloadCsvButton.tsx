'use client'

import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Link } from '@radix-ui/themes'
import { FC } from 'react'

interface DownloadCsvButtonProps {
  cycle: string
}

const DownloadCsvButton: FC<DownloadCsvButtonProps> = ({ cycle }) => {
  return (
    <Link
      href={`/api/download?${new URLSearchParams({ cycle })}`}
      download="outcomes.csv"
      className="w-full"
    >
      <Button className="w-full" color="ruby">
        <Flex align="center" justify="center" gap="2">
          <DownloadIcon /> Download Outcomes CSV
        </Flex>
      </Button>
    </Link>
  )
}

export default DownloadCsvButton
