'use client'

import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { FormPassbackState, upsertAdminScoring } from '@/lib/forms'
import { NextActionEnum } from '@/lib/types'
import { AlevelQualification, GCSEQualification } from '@prisma/client'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Dialog, Flex, Heading, Spinner, Text, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useEffect, useState } from 'react'
import { useFormState } from 'react-dom'

import { ApplicationRow } from './ApplicationTable'

interface AdminScoringFormProps {
  row: ApplicationRow
}

const AdminScoringForm: FC<AdminScoringFormProps> = ({ row }: AdminScoringFormProps) => {
  const { applicant, internalReview } = row
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [gcseQualification, setGcseQualification] = useState(row.gcseQualification?.toString())
  const [aLevelQualification, setALevelQualification] = useState(
    row.aLevelQualification?.toString()
  )

  const upsertAdminScoringWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertAdminScoring(NextActionEnum[row.nextAction], row.id, prevState, formData)

  const [state, formAction] = useFormState(upsertAdminScoringWithId, { status: '', message: '' })

  useEffect(() => {
    setIsLoading(false)
    if (state.status === 'success') setIsDialogOpen(false)
  }, [state, setIsDialogOpen, setIsLoading])

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen} defaultOpen={false}>
      <Dialog.Trigger disabled={NextActionEnum[row.nextAction] < NextActionEnum.ADMIN_SCORING}>
        <Button>Admin Scoring Form</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Admin Scoring Form</Dialog.Title>

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

        {state.status === 'error' && (
          <Callout.Root size="1" color="red" className="mb-3">
            <Callout.Icon>
              <CrossCircledIcon />
            </Callout.Icon>
            <Callout.Text>{state.message}</Callout.Text>
          </Callout.Root>
        )}
        <form
          className="flex flex-col gap-7"
          action={formAction}
          onSubmit={() => setIsLoading(true)}
        >
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
              <input
                name="aLevelQualification"
                type="hidden"
                value={aLevelQualification?.toString()}
              />
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

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
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

export default AdminScoringForm
