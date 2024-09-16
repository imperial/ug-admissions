'use client'

import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import { FormPassbackState, upsertReviewerScoring } from '@/lib/forms'
import { NextActionEnum } from '@/lib/types'
import { Button, Callout, DataList, Flex, Text, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useState } from 'react'

import { ApplicationRow } from './ApplicationTable'

interface ReviewerScoringDialogProps {
  data: ApplicationRow
}

interface ReviewerScoringFormProps {
  data: ApplicationRow
}

const ReviewerScoringForm: FC<ReviewerScoringFormProps> = ({ data }) => {
  const { applicant, internalReview } = data

  return (
    <Flex direction="column" gap="3">
      {internalReview?.lastAdminEditOn && internalReview?.lastAdminEditBy && (
        <Text size="2" className="italic text-gray-500">
          Last edited by {internalReview?.lastAdminEditBy} on{' '}
          {format(internalReview?.lastAdminEditOn, "dd/MM/yy 'at' HH:mm")}
        </Text>
      )}
      <Callout.Root>
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

          <DataList.Item align="center">
            <DataList.Label color="amber">Admin Motivation Assessment:</DataList.Label>
            <DataList.Value className="font-bold">
              {String(internalReview?.motivationAdminScore)}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label color="mint">Admin Extracurricular Assessment:</DataList.Label>
            <DataList.Value className="font-bold">
              {String(internalReview?.extracurricularAdminScore)}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Callout.Root>

      <Flex direction="column" gap="2">
        <LabelText label="Motivation Score">
          <TextField.Root
            id="motivationReviewerScore"
            name="motivationReviewerScore"
            type="number"
            color="amber"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(internalReview?.motivationReviewerScore?.toString() ?? '')}
          />
        </LabelText>

        <LabelText label="Extracurricular Score">
          <TextField.Root
            id="extracurricularReviewerScore"
            name="extracurricularReviewerScore"
            type="number"
            color="mint"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(
              internalReview?.extracurricularReviewerScore?.toString() ?? ''
            )}
          />
        </LabelText>

        <LabelText label="Reference Score">
          <TextField.Root
            id="referenceReviewerScore"
            name="referenceReviewerScore"
            type="number"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(internalReview?.referenceReviewerScore?.toString() ?? '')}
          />
        </LabelText>

        <LabelText label="Academic Comments">
          <TextField.Root
            id="academicComments"
            name="academicComments"
            defaultValue={internalReview?.academicComments ?? undefined}
          />
        </LabelText>
      </Flex>
    </Flex>
  )
}

const ReviewerScoringDialog: FC<ReviewerScoringDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)

  const upsertReviewerScoringWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertReviewerScoring(NextActionEnum[data.nextAction], data.id, prevState, formData)

  return (
    <GenericDialog
      title="Reviewer Scoring Form"
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <Button disabled={NextActionEnum[data.nextAction] < NextActionEnum.REVIEWER_SCORING}>
          Reviewer Scoring Form
        </Button>
      }
    >
      <FormWrapper action={upsertReviewerScoringWithId} onSuccess={handleFormSuccess}>
        <ReviewerScoringForm data={data} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default ReviewerScoringDialog
