import DataUploadDialog from '@/components/dialog/DataUploadDialog'
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
    </Flex>
  )
}

export default AdminControlPanel
