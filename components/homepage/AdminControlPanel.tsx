'use client'

import DataUploadDialog from '@/components/dialog/DataUploadDialog'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'

interface AdminControlPanelProps {
  userEmail: string
}

const AdminControlPanel: FC<AdminControlPanelProps> = ({ userEmail }) => {
  const handleDownloadClick = async () => {
    const cycle = 2526
    const response = await fetch(`/api/download?cycle=${cycle}`)
    if (response.ok) {
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `offers_${cycle}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } else {
      console.error('Failed to download CSV')
    }
  }

  return (
    <Flex direction="column" gap="2" className="w-full">
      <Heading as="h4" size="2">
        Admin Control Panel
      </Heading>
      <DataUploadDialog userEmail={userEmail} className="w-full" />
      <Button color="bronze" onClick={handleDownloadClick}>
        <DownloadIcon />
        Download Offers CSV
      </Button>
    </Flex>
  )
}

export default AdminControlPanel
