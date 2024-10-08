'use client'

import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import { processCsvUpload } from '@/lib/csv/upload'
import { DataUploadEnum, FormPassbackState } from '@/lib/types'
import { FilePlusIcon } from '@radix-ui/react-icons'
import { Button, Flex, Text } from '@radix-ui/themes'
import React, { FC, useState } from 'react'
import Dropzone from 'react-dropzone'

import Dropdown from './Dropdown'
import LabelledInput from './LabelText'

interface DataUploadFormProps {
  file: File | null
  setFile: (file: File | null) => void
}

const DataUploadForm: FC<DataUploadFormProps> = ({ file, setFile }) => {
  const [dataUploadChoice, setDataUploadChoice] = useState(DataUploadEnum.APPLICANT)
  return (
    <Flex direction="column" gap="3">
      <LabelledInput label="Data regarding">
        <Dropdown
          values={Object.keys(DataUploadEnum)}
          currentValue={dataUploadChoice}
          onValueChange={(value) => setDataUploadChoice(value as DataUploadEnum)}
        />
        <input type="hidden" name="dataUploadType" value={dataUploadChoice} />
      </LabelledInput>

      <Dropzone
        onDrop={(acceptedFiles) => {
          setFile(acceptedFiles[0])
        }}
        maxFiles={1}
      >
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
                <Text className="text-gray-700" weight="medium">
                  Click to upload a CSV file or drag one here
                </Text>
              </Flex>
            </Flex>
            {file?.name && <p>Uploaded file: {file.name}</p>}
          </section>
        )}
      </Dropzone>
    </Flex>
  )
}

interface DataUploadDialogProps {
  disabled: boolean
  userEmail: string
}

const DataUploadDialog: FC<DataUploadDialogProps> = ({ disabled, userEmail }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const processCsvUploadWrapped = async (prevState: FormPassbackState, formData: FormData) => {
    if (!file) return { message: 'No CSV file uploaded', status: 'error' }
    formData.append('csv', file)
    return await processCsvUpload(prevState, formData, userEmail)
  }

  return (
    <GenericDialog
      title={'Data Upload'}
      trigger={
        <Button className="min-h-10" disabled={disabled}>
          <FilePlusIcon />
          Upload data
        </Button>
      }
      isOpen={isDialogOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) setFile(null)
        setIsDialogOpen(isOpen)
      }}
    >
      <FormWrapper action={processCsvUploadWrapped} submitButtonText="Upload">
        <DataUploadForm file={file} setFile={setFile} />
      </FormWrapper>
      <Button color="teal" onClick={() => window.location.reload()}>
        <em>After uploading, refresh to see changes</em>
      </Button>
    </GenericDialog>
  )
}

export default DataUploadDialog
