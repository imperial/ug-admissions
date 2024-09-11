'use client'

import { DataUploadEnum, FormPassbackState } from '@/lib/types'
import { insertUploadedData } from '@/lib/upload'
import { CheckCircledIcon, CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Dialog, Flex, Spinner } from '@radix-ui/themes'
import React, { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import Dropzone from 'react-dropzone'

import LabelledInput from './LabelText'
import Dropdown from './TanstackTable/Dropdown'

const DataUpload = () => {
  const [dataUploadChoice, setDataUploadChoice] = useState(DataUploadEnum.APPLICANT)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const insertUploadedDataWithType = async (prevState: FormPassbackState, formData: FormData) => {
    formData.append('csv', file!)
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

            <Dropzone onDrop={(acceptedFiles) => setFile(acceptedFiles[0])}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>Drag and drop some files here, or click to select files</p>
                  </div>
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
