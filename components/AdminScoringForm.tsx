'use client'

import { AdminScoringData } from '@/app/api/adminScoringForm/[id]/route'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { FormPassbackState, upsertAdminScoring } from '@/lib/forms'
import { NextActionEnum } from '@/lib/types'
import { Applicant, QualificationType16, QualificationType18 } from '@prisma/client'
import { CrossCircledIcon } from '@radix-ui/react-icons'
import { Button, Callout, Dialog, Flex, Heading, Spinner, Text, TextField } from '@radix-ui/themes'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import React, { FC, useEffect, useState } from 'react'
import { useFormState } from 'react-dom'

interface AdminScoringFormProps {
  applicant: Pick<Applicant, 'cid' | 'ucasNumber' | 'firstName' | 'surname'>
  applicationId: number
  nextAction: NextActionEnum
}

const AdminScoringForm: FC<AdminScoringFormProps> = ({
  applicant,
  applicationId,
  nextAction
}: AdminScoringFormProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [adminScoringData, setAdminScoringData] = useState<AdminScoringData | null>(null)

  useQuery({
    queryKey: [applicationId],
    queryFn: async () => {
      const res = await fetch(`/api/adminScoringForm/${applicationId}`)
      const data: AdminScoringData = await res.json()
      setAdminScoringData(data)
      return data
    },
    enabled: isDialogOpen
  })

  const queryClient = useQueryClient()

  const upsertAdminScoringWithId = async (prevState: FormPassbackState, formData: FormData) => {
    const res = await upsertAdminScoring(nextAction, applicationId, prevState, formData)
    await queryClient.invalidateQueries({ queryKey: [applicationId] })
    return res
  }

  const [state, formAction] = useFormState(upsertAdminScoringWithId, { status: '', message: '' })

  useEffect(() => {
    console.log('set loading to false')
    setIsLoading(false)
    if (state.status === 'success') setIsDialogOpen(false)
  }, [state, setIsDialogOpen, setIsLoading])

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen} defaultOpen={false}>
      <Dialog.Trigger disabled={nextAction < NextActionEnum.ADMIN_SCORING}>
        <Button>Admin Scoring Form</Button>
      </Dialog.Trigger>

      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Admin Scoring Form</Dialog.Title>

        {adminScoringData?.imperialReview?.examRatingDone &&
          adminScoringData?.imperialReview?.examRatingBy && (
            <Text size="2" className="italic text-gray-500">
              Last edited by {adminScoringData?.imperialReview?.examRatingBy} on{' '}
              {format(adminScoringData?.imperialReview?.examRatingDone, "dd/MM/yy 'at' hh:mm")}
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

          <input name="age16ExamType" type="hidden" value={adminScoringData?.age16ExamType} />
          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age16ExamType">
              Type:
            </label>
            <Dropdown
              values={Object.keys(QualificationType16)}
              currentValue={adminScoringData?.age16ExamType}
              onValueChange={(value) =>
                setAdminScoringData(
                  adminScoringData && {
                    ...adminScoringData,
                    age16ExamType: value as QualificationType16
                  }
                )
              }
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
              disabled={!adminScoringData?.age16ExamType}
              required={!!adminScoringData?.age16ExamType}
              defaultValue={adminScoringData?.age16Score}
            />
          </Flex>

          <Heading as="h3" size="3">
            Age 18 exam
          </Heading>
          <Flex gap="1" align="center">
            <label className="w-1/5" htmlFor="age18ExamType">
              Type:
            </label>
            <input name="age18ExamType" type="hidden" value={adminScoringData?.age18ExamType} />
            <Dropdown
              values={Object.keys(QualificationType18)}
              currentValue={adminScoringData?.age18ExamType}
              onValueChange={(value) =>
                setAdminScoringData(
                  adminScoringData && {
                    ...adminScoringData,
                    age18ExamType: value as QualificationType18
                  }
                )
              }
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
              disabled={!adminScoringData?.age18ExamType}
              required={!!adminScoringData?.age18ExamType}
              defaultValue={adminScoringData?.age18Score}
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
              defaultValue={adminScoringData?.imperialReview?.motivationAssessments}
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
              defaultValue={adminScoringData?.imperialReview?.extracurricularAssessments}
            />
          </Flex>

          <Flex gap="2" direction="column">
            <Heading asChild size="3">
              <label htmlFor="examComments">Comments</label>
            </Heading>
            <TextField.Root
              id="examComments"
              name="examComments"
              defaultValue={adminScoringData?.imperialReview?.examComments}
            />
          </Flex>

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
