'use client'

import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { upsertAdminScoring } from '@/lib/forms'
import { FormPassbackState, NextActionEnum } from '@/lib/types'
import { AlevelQualification, GCSEQualification } from '@prisma/client'
import { Button, Callout, DataList, Flex, Heading, Text, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useState } from 'react'

import { ApplicationRow } from './ApplicationTable'

interface AdminScoringDialogProps {
  data: ApplicationRow
}

interface AdminScoringFormProps {
  data: ApplicationRow
}

const AdminScoringForm: FC<AdminScoringFormProps> = ({ data }) => {
  const { applicant, internalReview } = data
  const [gcseQualification, setGcseQualification] = useState(data.gcseQualification?.toString())
  const [aLevelQualification, setALevelQualification] = useState(
    data.aLevelQualification?.toString()
  )

  return (
    <Flex direction="column" gap="2">
      {internalReview?.lastAdminEditOn && internalReview?.lastAdminEditBy && (
        <Text size="2" className="italic text-gray-500">
          Last edited by {internalReview.lastAdminEditBy} on{' '}
          {format(internalReview.lastAdminEditOn, "dd/MM/yy 'at' HH:mm")}
        </Text>
      )}
      <Callout.Root className="my-5">
        <DataList.Root>
          <DataList.Item align="center">
            <DataList.Label>Applicant:</DataList.Label>
            <DataList.Value className="font-bold">
              {applicant.firstName} {applicant.surname}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>UCAS number:</DataList.Label>
            <DataList.Value className="font-bold">{applicant.ucasNumber}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Callout.Root>

      <Flex direction="column" gap="2">
        <Flex direction="column" gap="2">
          {data.extenuatingCircumstances && (
            <Popover.Root>
              <Popover.Trigger>
                <Button type="button" variant="soft" color="yellow">
                  <IdCardIcon width={16} height={16} />
                  Extenuating circumstances
                </Button>
              </Popover.Trigger>
              <Popover.Content className="bg-yellow-50">
                <Text>{data.extenuatingCircumstances}</Text>
              </Popover.Content>
            </Popover.Root>
          )}
        </Flex>

        <Flex direction="column" gap="2">
          {data.academicEligibilityNotes && (
            <Popover.Root>
              <Popover.Trigger>
                <Button type="button" variant="soft" color="yellow">
                  <FileTextIcon width={16} height={16} />
                  Academic eligibility notes
                </Button>
              </Popover.Trigger>
              <Popover.Content className="bg-yellow-50">
                <Text>{data.academicEligibilityNotes}</Text>
              </Popover.Content>
            </Popover.Root>
          )}
        </Flex>

        <Flex direction="column" gap="2">
          <Heading as="h3" size="2">
            Age 16 exam
          </Heading>
          <LabelText label="Type" weight="regular">
            <Dropdown
              values={Object.keys(GCSEQualification)}
              currentValue={gcseQualification}
              onValueChange={setGcseQualification}
              className="flex-grow"
            />
            <input name="gcseQualification" type="hidden" value={gcseQualification} />
          </LabelText>

          <LabelText label="Score" weight="regular">
            <TextField.Root
              id="gcseQualificationScore"
              name="gcseQualificationScore"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              className="flex-grow"
              disabled={!gcseQualification}
              required={!!gcseQualification}
              defaultValue={parseFloat(data?.gcseQualificationScore?.toString() ?? '')}
            />
          </LabelText>
        </Flex>

        <Flex direction="column" gap="2">
          <Heading as="h3" size="2">
            Age 18 exam
          </Heading>
          <LabelText label="Type" weight="regular">
            <Dropdown
              values={Object.keys(AlevelQualification)}
              currentValue={aLevelQualification}
              onValueChange={setALevelQualification}
              className="flex-grow"
            />
            <input name="aLevelQualification" type="hidden" value={aLevelQualification} />
          </LabelText>

          <LabelText label="Score" weight="regular">
            <TextField.Root
              id="aLevelQualificationScore"
              name="aLevelQualificationScore"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              className="flex-grow"
              disabled={!aLevelQualification}
              required={!!aLevelQualification}
              defaultValue={parseFloat(data?.aLevelQualificationScore?.toString() ?? '')}
            />
          </LabelText>
        </Flex>

        <LabelText label="Motivation Assessments (optional)">
          <TextField.Root
            id="motivationAdminScore"
            name="motivationAdminScore"
            type="number"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(internalReview?.motivationAdminScore?.toString() ?? '')}
          />
        </LabelText>

        <LabelText label="Extracurricular Assessments (optional)">
          <TextField.Root
            id="extracurricularAdminScore"
            name="extracurricularAdminScore"
            type="number"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(internalReview?.extracurricularAdminScore?.toString() ?? '')}
          />
        </LabelText>

        <LabelText label="Exam Comments (optional)">
          <TextField.Root
            id="examComments"
            name="examComments"
            defaultValue={internalReview?.examComments ?? undefined}
          />
        </LabelText>
      </Flex>
    </Flex>
  )
}

const AdminScoringDialog: FC<AdminScoringDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)
  const upsertAdminScoringWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertAdminScoring(NextActionEnum[data.nextAction], data.id, prevState, formData)

  return (
    <GenericDialog
      title="Admin Scoring Form"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button disabled={NextActionEnum[data.nextAction] < NextActionEnum.ADMIN_SCORING}>
          Admin Scoring Form
        </Button>
      }
    >
      <FormWrapper action={upsertAdminScoringWithId} onSuccess={handleFormSuccess}>
        <AdminScoringForm data={data} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default AdminScoringDialog
