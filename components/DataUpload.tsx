'use client'

import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import { processCsvUpload } from '@/lib/csv/upload'
import { DataUploadEnum, FormPassbackState } from '@/lib/types'
import { FilePlusIcon } from '@radix-ui/react-icons'
import { Button, Flex, Text } from '@radix-ui/themes'
import React, { FC, useState } from 'react'
import Dropzone from 'react-dropzone'

import LabelledInput from './LabelText'
import Dropdown from './TanstackTable/Dropdown'

interface DataUploadFormProps {
  updateExtraFormData: (name: string, value: string | Blob) => void
}

const DataUploadForm: FC<DataUploadFormProps> = ({ updateExtraFormData }) => {
  const [dataUploadChoice, setDataUploadChoice] = useState(DataUploadEnum.APPLICANT)
  const [file, setFile] = useState<File | null>(null)
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
          updateExtraFormData('csv', acceptedFiles[0])
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
    </Flex>
  )
}

const DataUpload = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [extraFormData, setExtraFormData] = useState(new FormData())
  const updateExtraFormData = (name: string, value: string | Blob) => {
    const updatedFormData = new FormData()
    extraFormData.forEach((val, key) => {
      updatedFormData.append(key, val)
    })
    updatedFormData.set(name, value)
    setExtraFormData(updatedFormData)
  }
  const processCsvUploadWrapped = async (prevState: FormPassbackState, formData: FormData) => {
    if (!extraFormData.has('csv')) return { message: 'No CSV file uploaded', status: 'error' }
    extraFormData.forEach((val, key) => {
      formData.set(key, val)
    })
    return await processCsvUpload(prevState, formData)
  }

  return (
    <GenericDialog
      title={'Data Upload'}
      trigger={<Button>Data Upload</Button>}
      isOpen={isDialogOpen}
      setIsOpen={setIsDialogOpen}
    >
      <FormWrapper action={processCsvUploadWrapped} submitButtonText="Upload">
        <DataUploadForm updateExtraFormData={updateExtraFormData} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default DataUpload
