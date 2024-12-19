'use client'

import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Link } from '@radix-ui/themes'
import React, { FC } from 'react'

interface DownloadCsvButtonProps {
  cycle: number
}

const DownloadCsvButton: FC<DownloadCsvButtonProps> = ({ cycle }) => {
  const destination = `/api/download?cycle=${cycle}`

  return (
    <Link href={destination} download="offers.csv">
      <Button className="w-full" color="bronze">
        <Flex align="center" justify="center" gap="2">
          <DownloadIcon /> Download Offers CSV
        </Flex>
      </Button>
    </Link>
  )
}

export default DownloadCsvButton
