'use client'

import DataUploadDialog from '@/components/dialog/DataUploadDialog'
import DownloadCsvButton from '@/components/homepage/DownloadCsvButton'
import { Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'

interface AdminControlPanelProps {
  userEmail: string
}

const AdminControlPanel: FC<AdminControlPanelProps> = ({ userEmail }) => {
  return (
    <Flex direction="column" gap="2" className="w-full">
      <Heading as="h4" size="2">
        Admin Control Panel
      </Heading>
      <DataUploadDialog userEmail={userEmail} className="w-full" />
      <DownloadCsvButton cycle={2526} />
    </Flex>
  )
}

export default AdminControlPanel
