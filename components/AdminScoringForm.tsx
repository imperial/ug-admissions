'use client'

import Dropdown from '@/components/TanstackTable/Dropdown'
import { upsertAdminScoring } from '@/lib/forms'
import { QualificationType16, QualificationType18 } from '@prisma/client'
import { Button, Dialog, Flex, TextField } from '@radix-ui/themes'
import React, { FC } from 'react'

const AdminScoringForm: FC = () => {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Admin Scoring Form</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Admin Scoring Form</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Submit admin scores
        </Dialog.Description>

        <form className="flex flex-col gap-3" action={upsertAdminScoring}>
          <Dropdown values={Object.keys(QualificationType16)} title="Age 16 Examination Type" />

          <TextField.Root name="score16" type="number" min={0.0} max={10.0} step={0.1} />

          <Dropdown values={Object.keys(QualificationType18)} title="Age 18 Examination Type" />

          <TextField.Root type="number" min={0.0} max={10.0} step={0.1} />

          <TextField.Root type="number" min={0.0} max={10.0} step={0.1} />

          <TextField.Root type="number" min={0.0} max={10.0} step={0.1} />

          <TextField.Root />

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>

            <Button type="submit">Save</Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AdminScoringForm
