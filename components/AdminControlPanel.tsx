import DataUploadDialog from '@/components/DataUploadDialog'
import { Card, Flex, Heading } from '@radix-ui/themes'
import { FC } from 'react'

interface AdminControlPanelProps {
  userEmail: string
}

const AdminControlPanel: FC<AdminControlPanelProps> = ({ userEmail }) => {
  return (
    <Flex direction="column" gap="2">
      <Card className="bg-cyan-200">
        <Heading as="h4" size="2">
          Admin Control Panel
        </Heading>
        <DataUploadDialog disabled={false} userEmail={userEmail} />
      </Card>
    </Flex>
  )
}

export default AdminControlPanel
