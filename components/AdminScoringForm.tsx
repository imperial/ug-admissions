'use client'

import Dropdown from '@/components/TanstackTable/Dropdown'
import { FormPassbackState, upsertAdminScoring } from '@/lib/forms'
import { NextActionEnum } from '@/lib/types'
import { QualificationType16, QualificationType18 } from '@prisma/client'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Dialog, Flex, Heading, Spinner, Text, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useEffect, useState } from 'react'
import { useFormState } from 'react-dom'

import { ApplicationRow } from './ApplicationTable'
import LabelledFormField from './LabelledFormField'

interface AdminScoringFormProps {
  row: ApplicationRow
}

const AdminScoringForm: FC<AdminScoringFormProps> = ({ row }: AdminScoringFormProps) => {
  const { applicant, imperialReview, reviewer } = row
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [age16ExamType, setAge16ExamType] = useState(row.age16ExamType?.toString())
  const [age18ExamType, setAge18ExamType] = useState(row.age18ExamType?.toString())

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

        {imperialReview?.examRatingDone && imperialReview?.examRatingBy && (
          <Text size="2" className="italic text-gray-500">
            Last edited by {imperialReview?.examRatingBy} on{' '}
            {format(imperialReview?.examRatingDone, "dd/MM/yy 'at' HH:mm")}
          </Text>
        )}
        <Callout.Root className="my-5">
          <Callout.Text size="4">
            Applicant: {applicant.firstName} {applicant.surname}
          </Callout.Text>
          <Callout.Text size="4">UCAS number: {applicant.ucasNumber}</Callout.Text>
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
          className="flex flex-col gap-5"
          action={formAction}
          onSubmit={() => setIsLoading(true)}
        >
          <Heading as="h3" size="3">
            Age 16 exam
          </Heading>

          <input name="age16ExamType" type="hidden" value={row.age16ExamType?.toString()} />
          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age16ExamType">
              Type:
            </label>
            <Dropdown
              values={Object.keys(QualificationType16)}
              currentValue={age16ExamType}
              onValueChange={setAge16ExamType}
              className="flex-grow"
            />
          </Flex>

          <LabelledFormField labelText="Score:">
            <TextField.Root
              id="age16Score"
              name="age16Score"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              className="flex-grow"
              disabled={!row?.age16ExamType}
              required={!!row?.age16ExamType}
              defaultValue={parseFloat(row?.age16Score?.toString() ?? '')}
            />
          </LabelledFormField>

          <Heading as="h3" size="3">
            Age 18 exam
          </Heading>
          <input name="age18ExamType" type="hidden" value={row.age18ExamType?.toString()} />
          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age18ExamType">
              Type:
            </label>
            <Dropdown
              values={Object.keys(QualificationType18)}
              currentValue={age18ExamType}
              onValueChange={setAge18ExamType}
              className="flex-grow"
            />
          </Flex>

          <LabelledFormField labelText="Score">
            <TextField.Root
              id="age18Score"
              name="age18Score"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              className="flex-grow"
              disabled={!row?.age18ExamType}
              required={!!row?.age18ExamType}
              defaultValue={parseFloat(row?.age18Score?.toString() ?? '')}
            />
          </LabelledFormField>

          <LabelledFormField labelText="Motivation Assessments">
            <TextField.Root
              id="motivationAssessments"
              name="motivationAssessments"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              defaultValue={parseFloat(imperialReview?.motivationAssessments?.toString() ?? '')}
            />
          </LabelledFormField>

          <LabelledFormField labelText="Extracurricular Assessments">
            <TextField.Root
              id="extracurricularAssessments"
              name="extracurricularAssessments"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              defaultValue={parseFloat(
                imperialReview?.extracurricularAssessments?.toString() ?? ''
              )}
            />
          </LabelledFormField>

          <LabelledFormField labelText="Exam Comments">
            <TextField.Root
              id="examComments"
              name="examComments"
              defaultValue={imperialReview?.examComments ?? undefined}
            />
          </LabelledFormField>

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
