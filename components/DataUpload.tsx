'use client'

import { DataUploadEnum } from '@/lib/types'
import { insertUploadedData } from '@/lib/upload'
import { Button, Dialog, Flex, Spinner, TextField } from '@radix-ui/themes'
import { DataUploadEnum, FormPassbackState } from '@/lib/types'
import { insertUploadedData } from '@/lib/upload'
import { CheckCircledIcon, CrossCircledIcon, FilePlusIcon } from '@radix-ui/react-icons'
import { Button, Callout, Dialog, Flex, Spinner, Text } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import Dropzone from 'react-dropzone'

import LabelledInput from './LabelText'
import Dropdown from './TanstackTable/Dropdown'

const DataUpload = () => {
  const [dataUploadChoice, setDataUploadChoice] = useState(DataUploadEnum.APPLICANT)
  const [state, formAction] = useFormState(insertUploadedData, { status: '', message: '' })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const insertUploadedDataWithType = async (prevState: FormPassbackState, formData: FormData) => {
    if (file === null) return { message: 'No CSV file uploaded', status: 'error' }
    formData.append('csv', file)
    return await insertUploadedData(dataUploadChoice, prevState, formData)
  }
  const [state, formAction] = useFormState(insertUploadedDataWithType, { status: '', message: '' })

  useEffect(() => {
    setIsLoading(false)
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
            <LabelledInput label="Data regarding">
              <Dropdown
                values={Object.keys(DataUploadEnum)}
                currentValue={dataUploadChoice}
                onValueChange={(value) => setDataUploadChoice(value as DataUploadEnum)}
              />
            </LabelledInput>

            <Dropzone onDrop={(acceptedFiles) => setFile(acceptedFiles[0])} maxFiles={1}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <Flex
                    {...getRootProps()}
                    justify="center"
                    align="center"
                    className="bg-gray-200 mb-2 h-40 border-dashed border-2 border-gray-400 rounded-sm"
                  >
                    <input {...getInputProps()} />
                    <Flex direction="column" justify="center" align="center">
                      <FilePlusIcon className="w-16 h-16 mb-2" />
                      <Text className="text-gray-700">
                        {' '}
                        <strong> Click to upload a CSV file</strong> or drag one here
                      </Text>
                    </Flex>
                  </Flex>
                  {file?.name && <p>Uploaded file: {file.name}</p>}
                </section>
              )}
            </Dropzone>
            {!!state.message && (
              <Callout.Root
                size="1"
                color={state.status === 'success' ? 'green' : 'red'}
                className="mb-3"
              >
                <Callout.Icon>
                  {state.status === 'success' && <CheckCircledIcon />}
                  {state.status === 'error' && <CrossCircledIcon />}
                </Callout.Icon>
                <Callout.Text>{state.message}</Callout.Text>
              </Callout.Root>
            )}
          </Flex>

          <Flex gap="3" mt="4" justify="center">
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? <Spinner /> : 'Upload'}
            </Button>
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Close
              </Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default DataUpload
