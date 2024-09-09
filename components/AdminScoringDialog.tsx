'use client'

import FormInDialog from '@/components/FormInDialog'
import GenericFormDialog from '@/components/GenericFormDialog'
import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { FormPassbackState, upsertAdminScoring } from '@/lib/forms'
import { NextActionEnum } from '@/lib/types'
import { AlevelQualification, GCSEQualification } from '@prisma/client'
import { Button, Callout, Flex, Heading, Text, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useState } from 'react'

import { ApplicationRow } from './ApplicationTable'

interface AdminScoringDialogProps {
  row: ApplicationRow
}

interface AdminScoringFormProps {
  close: () => void
  row: ApplicationRow
}

const AdminScoringForm: FC<AdminScoringFormProps> = ({ close, row }) => {
  const { applicant, internalReview } = row
  const [gcseQualification, setGcseQualification] = useState(row.gcseQualification?.toString())
  const [aLevelQualification, setALevelQualification] = useState(
    row.aLevelQualification?.toString()
  )

  const upsertAdminScoringWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertAdminScoring(NextActionEnum[row.nextAction], row.id, prevState, formData)

  return (
    <FormInDialog action={upsertAdminScoringWithId} close={close} closeOnSuccess>
      {internalReview?.lastAdminEditOn && internalReview?.lastAdminEditBy && (
        <Text size="2" className="italic text-gray-500">
          Last edited by {internalReview?.lastAdminEditBy} on{' '}
          {format(internalReview?.lastAdminEditOn, "dd/MM/yy 'at' HH:mm")}
        </Text>
      )}
      <Callout.Root className="my-5">
        <Callout.Text size="3">
          Applicant: {applicant.firstName} {applicant.surname}
        </Callout.Text>
        <Callout.Text size="3">UCAS number: {applicant.ucasNumber}</Callout.Text>
      </Callout.Root>

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
          <input name="gcseQualification" type="hidden" value={gcseQualification?.toString()} />
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
            defaultValue={parseFloat(row?.gcseQualificationScore?.toString() ?? '')}
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
          <input name="aLevelQualification" type="hidden" value={aLevelQualification?.toString()} />
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
            defaultValue={parseFloat(row?.aLevelQualificationScore?.toString() ?? '')}
          />
        </LabelText>
      </Flex>

      <LabelText label="Motivation Assessments">
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

      <LabelText label="Extracurricular Assessments">
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

      <LabelText label="Exam Comments">
        <TextField.Root
          id="examComments"
          name="examComments"
          defaultValue={internalReview?.examComments ?? undefined}
        />
      </LabelText>
    </FormInDialog>
  )
}

const AdminScoringDialog: FC<AdminScoringDialogProps> = ({ row }) => {
  const formRenderer = ({ close }: { close: () => void }) => (
    <AdminScoringForm close={close} row={row} />
  )

  return (
    <GenericFormDialog title="Admin Scoring Form" form={formRenderer}>
      <Button>Admin Scoring Form</Button>
    </GenericFormDialog>
  )
}

export default AdminScoringDialog
