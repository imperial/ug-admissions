'use client'

import CandidateCallout from '@/components/CandidateCallout'
import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import { reviewerAccess } from '@/lib/access'
import { upsertReviewerScoring } from '@/lib/forms'
import { FormPassbackState } from '@/lib/types'
import { ord } from '@/lib/utils'
import { NextAction } from '@prisma/client'
import { Button, Callout, DataList, Flex, Text, TextArea, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useState } from 'react'

import { ApplicationRow } from './ApplicationTable'

interface ReviewerScoringDialogProps {
  data: ApplicationRow
  userEmail: string
}

interface ReviewerScoringFormProps {
  data: ApplicationRow
  readOnly: boolean
}

const MOTIVATION_COLOUR = 'amber'
const EXTRACURRICULAR_COLOUR = 'mint'

const ReviewerScoringForm: FC<ReviewerScoringFormProps> = ({ data, readOnly }) => {
  const { applicant, internalReview } = data

  return (
    <Flex direction="column" gap="3">
      {internalReview?.lastReviewerEditOn && (
        <Text size="2" className="italic text-gray-500">
          Last edited on {format(internalReview.lastReviewerEditOn, "dd/MM/yy 'at' HH:mm")}
        </Text>
      )}

      <CandidateCallout
        firstName={applicant.firstName}
        surname={applicant.surname}
        ucasNumber={applicant.ucasNumber}
      />

      <Callout.Root>
        <DataList.Root>
          <DataList.Item align="center">
            <DataList.Label color={MOTIVATION_COLOUR}>Admin Motivation Score:</DataList.Label>
            <DataList.Value className="font-bold">
              {String(internalReview?.motivationAdminScore ?? 'Missing')}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label color={EXTRACURRICULAR_COLOUR}>
              Admin Extracurricular Score:
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
            disabled={readOnly}
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
            disabled={readOnly}
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
            disabled={readOnly}
          />
        </LabelText>

        <LabelText label="Academic Comments (minimum 30 characters)">
          <TextArea
            id="academicComments"
            name="academicComments"
            defaultValue={internalReview?.academicComments ?? undefined}
            required
            disabled={readOnly}
            minLength={30}
          />
        </LabelText>
      </Flex>
    </Flex>
  )
}

const ReviewerScoringDialog: FC<ReviewerScoringDialogProps> = ({ data, userEmail }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)

  const upsertReviewerScoringWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertReviewerScoring(data.id, prevState, formData)

  const readOnly = !reviewerAccess(data.reviewer?.login, userEmail)

  return (
    <GenericDialog
      title="Reviewer Scoring"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button
          color="jade"
          className="min-h-10"
          disabled={
            ord(data.nextAction) < ord(NextAction.REVIEWER_SCORING) || data?.reviewer == null
          }
        >
          Reviewer Scoring
        </Button>
      }
    >
      <FormWrapper
        action={upsertReviewerScoringWithId}
        onSuccess={handleFormSuccess}
        readOnly={readOnly}
      >
        <ReviewerScoringForm data={data} readOnly={readOnly} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default ReviewerScoringDialog
