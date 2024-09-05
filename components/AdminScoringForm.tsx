'use client'

import Dropdown from '@/components/TanstackTable/Dropdown'
import { upsertAdminScoring } from '@/lib/forms'
import { Applicant, QualificationType16, QualificationType18 } from '@prisma/client'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Dialog, Flex, Heading, TextField } from '@radix-ui/themes'
import React, { FC, useState } from 'react'
import { useFormState } from 'react-dom'

interface AdminScoringFormProps {
  applicant: Pick<Applicant, 'cid' | 'ucasNumber' | 'firstName' | 'surname'>
  applicationId: number
}

const AdminScoringForm: FC<AdminScoringFormProps> = ({
  applicant,
  applicationId
}: AdminScoringFormProps) => {
  const [age16ExamType, setAge16ExamType] = useState('')
  const [age18ExamType, setAge18ExamType] = useState('')

  const upsertAdminScoringWithId = upsertAdminScoring.bind(null, applicationId)
  const [state, formAction] = useFormState(upsertAdminScoringWithId, { status: '', message: '' })

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Admin Scoring Form</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Admin Scoring Form</Dialog.Title>

        <Callout.Root className="mb-3">
          <Callout.Text size="3">
            Applicant: {applicant.firstName} {applicant.surname} ({applicant.ucasNumber})
          </Callout.Text>
        </Callout.Root>

        {state.status === 'error' && (
          <Callout.Root size="1" color="red" className="mb-3">
            <Callout.Icon>
              <CrossCircledIcon />
            </Callout.Icon>
            <Callout.Text>{state.message}</Callout.Text>
          </Callout.Root>
        )}
        <form className="flex flex-col gap-5" action={formAction}>
          <Heading as="h3" size="3">
            Age 16 exam
          </Heading>

          <input name="age16ExamType" type="hidden" value={age16ExamType} />
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

          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age16Score">
              Score:
            </label>
            <TextField.Root
              id="age16Score"
              name="age16Score"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              className="flex-grow"
              disabled={!age16ExamType}
              required={!!age16ExamType}
            />
          </Flex>

          <Heading as="h3" size="3">
            Age 18 exam
          </Heading>
          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age18ExamType">
              Type:
            </label>
            <input name="age18ExamType" type="hidden" value={age18ExamType} />
            <Dropdown
              values={Object.keys(QualificationType18)}
              currentValue={age18ExamType}
              onValueChange={setAge18ExamType}
              className="flex-grow"
            />
          </Flex>
          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age18Score">
              Score:
            </label>
            <TextField.Root
              id="age18Score"
              name="age18Score"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
              className="flex-grow"
              disabled={!age18ExamType}
              required={!!age18ExamType}
            />
          </Flex>
          <Flex gap="2" direction="column">
            <Heading asChild size="3">
              <label htmlFor="motivationAssessments">Motivational Assessments</label>
            </Heading>
            <TextField.Root
              id="motivationAssessments"
              name="motivationAssessments"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Heading asChild size="3">
              <label htmlFor="extracurricularAssessments">Extracurricular Assessments</label>
            </Heading>
            <TextField.Root
              id="extracurricularAssessments"
              name="extracurricularAssessments"
              type="number"
              min={0.0}
              max={10.0}
              step={0.1}
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Heading asChild size="3">
              <label htmlFor="examComments">Comments</label>
            </Heading>
            <TextField.Root id="examComments" name="examComments" />
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </Dialog.Close>

            <Dialog.Close>
              <Button type="submit">Save</Button>
            </Dialog.Close>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AdminScoringForm
