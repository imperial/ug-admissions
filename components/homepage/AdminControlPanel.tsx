'use client'

import DataUploadDialog from '@/components/dialog/DataUploadDialog'
import DownloadCsvButton from '@/components/homepage/DownloadCsvButton'
import { Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'

interface AdminControlPanelProps {
  userEmail: string
  cycle: string
}

const AdminControlPanel: FC<AdminControlPanelProps> = ({ userEmail, cycle }) => {
  return (
    <Flex direction="column" gap="1" className="w-full">
      <Heading as="h4" size="2">
        Admin Control Panel
      </Heading>
      <DataUploadDialog userEmail={userEmail} className="w-full" />
      <DownloadCsvButton cycle={cycle} />
    </Flex>
  )
}

export default AdminControlPanel
