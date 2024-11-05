'use client'

import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import { processCsvUpload } from '@/lib/csv/upload'
import { DataUploadEnum, FormPassbackState } from '@/lib/types'
import { DownloadIcon, FilePlusIcon, UploadIcon } from '@radix-ui/react-icons'
import { Button, Flex, Text } from '@radix-ui/themes'
import Link from 'next/link'
import React, { FC, useState } from 'react'
import Dropzone from 'react-dropzone'

import Dropdown from './Dropdown'
import LabelledInput from './LabelText'

interface DataUploadFormProps {
  file: File | null
  setFile: (file: File | null) => void
}

const DataUploadForm: FC<DataUploadFormProps> = ({ file, setFile }) => {
  const [dataUploadChoice, setDataUploadChoice] = useState(DataUploadEnum.APPLICATION)
  return (
    <Flex direction="column" gap="2">
      <LabelledInput label="Data regarding">
        <Flex gap="1" justify="between">
          <Dropdown
            className="w-4/5"
            values={Object.keys(DataUploadEnum)}
            currentValue={dataUploadChoice}
            onValueChange={(value) => setDataUploadChoice(value as DataUploadEnum)}
          />
          <input type="hidden" name="dataUploadType" value={dataUploadChoice} />
          <Link href={dataUploadExampleFileMap[dataUploadChoice]} download="example">
            <Button color="gray" className="w-full">
              <DownloadIcon />
              Example
            </Button>
          </Link>
        </Flex>
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
            {file?.name && <Flex justify="center">Uploaded file: {file.name}</Flex>}
          </section>
        )}
      </Dropzone>
    </Flex>
  )
}

interface DataUploadDialogProps {
  disabled?: boolean
  userEmail: string
  className?: string
}

const DataUploadDialog: FC<DataUploadDialogProps> = ({
  disabled = false,
  userEmail,
  className
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const processCsvUploadWrapped = async (prevState: FormPassbackState, formData: FormData) => {
    if (!file) return { message: 'No CSV file uploaded', status: 'error' }
    formData.append('csv', file)
    return await processCsvUpload(prevState, formData, userEmail)
  }

  return (
    <GenericDialog
      title="Upload CSV"
      trigger={
        <Button disabled={disabled} className={className}>
          <UploadIcon />
          Upload
        </Button>
      }
      isOpen={isDialogOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) setFile(null)
        setIsDialogOpen(isOpen)
      }}
    >
      <FormWrapper
        action={processCsvUploadWrapped}
        submitButtonText="Upload"
        submitIcon={<FilePlusIcon />}
        refreshButton={true}
      >
        <DataUploadForm file={file} setFile={setFile} />
      </FormWrapper>
    </GenericDialog>
  )
}

const dataUploadExampleFileMap: Record<DataUploadEnum, string> = {
  [DataUploadEnum.APPLICATION]: '/example-applications.csv',
  [DataUploadEnum.TMUA_SCORES]: '/example-tmua-scores.csv',
  [DataUploadEnum.ADMIN_SCORING]: '/example-admin-scoring.csv',
  [DataUploadEnum.USER_ROLES]: '/example-user-roles.csv'
}

export default DataUploadDialog
