'use client'

import { DataUploadEnum } from '@/lib/types'
import { insertUploadedData } from '@/lib/upload'
import { Button, Dialog, Flex, Spinner, TextField } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'

import Dropdown from './TanstackTable/Dropdown'

const DataUpload = () => {
  const [dataUploadChoice, setDataUploadChoice] = useState(DataUploadEnum.APPLICANT)
  const [state, formAction] = useFormState(insertUploadedData, { status: '', message: '' })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(false)
    if (state.status === 'success') setIsDialogOpen(false)
  }, [state, setIsDialogOpen, setIsLoading])

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Data Upload</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Data Upload</Dialog.Title>
        <form
          className="flex flex-col gap-7"
          action={formAction}
          onSubmit={() => setIsLoading(true)}
        >
          <Flex direction="column" gap="3">
            <input type="file" name="csv" />
            <Dropdown
              values={Object.keys(DataUploadEnum)}
              currentValue={dataUploadChoice}
              onValueChange={(value) => setDataUploadChoice(value as DataUploadEnum)}
            />
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Save'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default DataUpload
