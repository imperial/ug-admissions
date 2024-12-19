'use client'

import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Text } from '@radix-ui/themes'
import Link from 'next/link'
import React, { FC } from 'react'

interface DownloadCsvButtonProps {
  cycle: number
}

const DownloadCsvButton: FC<DownloadCsvButtonProps> = ({ cycle }) => {
  return (
    <Link href={`/api/download?cycle=${cycle}`} download={`offers-${cycle}.csv`}>
      <Button className="w-full" color="bronze">
        <Flex align="center" justify="center" gap="2">
          <DownloadIcon />
          <Text>Download Offers CSV</Text>
        </Flex>
      </Button>
    </Link>
  )
}

export default DownloadCsvButton
