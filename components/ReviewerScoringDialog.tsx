'use client'

import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import { upsertReviewerScoring } from '@/lib/forms'
import { FormPassbackState, NextActionEnum } from '@/lib/types'
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

const MOTIVATION_COLOUR = 'amber'
const EXTRACURRICULAR_COLOUR = 'mint'

const ReviewerScoringForm: FC<ReviewerScoringFormProps> = ({ data }) => {
  const { applicant, internalReview } = data

  return (
    <Flex direction="column" gap="3">
      {internalReview?.lastReviewerEditOn && (
        <Text size="2" className="italic text-gray-500">
          Last edited on {format(internalReview.lastReviewerEditOn, "dd/MM/yy 'at' HH:mm")}
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
            <DataList.Label color={MOTIVATION_COLOUR}>Admin Motivation Assessment:</DataList.Label>
            <DataList.Value className="font-bold">
              {String(internalReview?.motivationAdminScore ?? 'Missing')}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label color={EXTRACURRICULAR_COLOUR}>
              Admin Extracurricular Assessment:
            </DataList.Label>
            <DataList.Value className="font-bold">
              {String(internalReview?.extracurricularAdminScore ?? 'Missing')}
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
            color={MOTIVATION_COLOUR}
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(internalReview?.motivationReviewerScore?.toString() ?? '')}
            required
          />
        </LabelText>

        <LabelText label="Extracurricular Score">
          <TextField.Root
            id="extracurricularReviewerScore"
            name="extracurricularReviewerScore"
            type="number"
            color={EXTRACURRICULAR_COLOUR}
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={parseFloat(
              internalReview?.extracurricularReviewerScore?.toString() ?? ''
            )}
            required
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
            required
          />
        </LabelText>

        <LabelText label="Academic Comments (optional)">
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
    upsertReviewerScoring(data.id, prevState, formData)

  return (
    <GenericDialog
      title="Reviewer Scoring Form"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button
          color="jade"
          className="min-h-10"
          disabled={NextActionEnum[data.nextAction] < NextActionEnum.REVIEWER_SCORING}
        >
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
