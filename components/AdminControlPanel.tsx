import DataUploadDialog from '@/components/DataUploadDialog'
import { Card, Flex, Heading } from '@radix-ui/themes'
import { FC } from 'react'

interface AdminControlPanelProps {
  userEmail: string
}

const AdminControlPanel: FC<AdminControlPanelProps> = ({ userEmail }) => {
  return (
    <Card className="bg-amber-300">
      <Heading size="5" align="center" className="mb-1">
        Admin Control Panel
      </Heading>
      <Flex justify="center">
        <DataUploadDialog disabled={false} userEmail={userEmail} />
      </Flex>
    </Card>
  )
}

export default AdminControlPanel
