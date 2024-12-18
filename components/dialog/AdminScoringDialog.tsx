'use client'

import CandidateCallout from '@/components/dialog/CandidateCallout'
import FormWrapper from '@/components/dialog/FormWrapper'
import GenericDialog from '@/components/dialog/GenericDialog'
import TmuaGradeBox from '@/components/dialog/TmuaGradeBox'
import Dropdown from '@/components/general/Dropdown'
import LabelText from '@/components/general/LabelText'
import { adminAccess } from '@/lib/access'
import { upsertAdminScoring } from '@/lib/query/forms'
import { FormPassbackState } from '@/lib/types'
import { decimalToNumber } from '@/lib/utils'
import { AlevelQualification, GCSEQualification, Role } from '@prisma/client'
import { IdCardIcon } from '@radix-ui/react-icons'
import { Button, Flex, Heading, Popover, Text, TextField } from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useState } from 'react'

import { ApplicationRow } from '../table/ApplicationTable'

interface AdminScoringDialogProps {
  data: ApplicationRow
  user: { email: string; role?: Role }
}

interface AdminScoringFormProps {
  data: ApplicationRow
  readOnly: boolean
}

const ICON_SIZE = 16

const AdminScoringForm: FC<AdminScoringFormProps> = ({ data, readOnly }) => {
  const { applicant, internalReview } = data
  const [gcseQualification, setGcseQualification] = useState(data.gcseQualification?.toString())
  const [aLevelQualification, setALevelQualification] = useState(
    data.aLevelQualification?.toString()
  )

  return (
    <Flex direction="column" gap="3">
      {internalReview?.lastAdminEditOn && internalReview?.lastAdminEditBy && (
        <Text size="2" className="italic text-gray-500">
          Last edited by {internalReview.lastAdminEditBy} on{' '}
          {format(internalReview.lastAdminEditOn, "dd/MM/yy 'at' HH:mm")}
        </Text>
      )}

      <CandidateCallout
        firstName={applicant.firstName}
        surname={applicant.surname}
        ucasNumber={applicant.ucasNumber}
      />

      {/* Reviewers should not be able to see TMUA grades */}
      {!readOnly && <TmuaGradeBox score={data.tmuaScore} />}

      <Flex direction="column" gap="2">
        <Flex direction="column" gap="2">
          {data.extenuatingCircumstances && (
            <Popover.Root>
              <Popover.Trigger>
                <Button type="button" variant="soft" color="yellow">
                  <IdCardIcon width={ICON_SIZE} height={ICON_SIZE} />
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
          <Heading as="h3" size="2">
            Age 16 exam
          </Heading>
          <LabelText label="Type" weight="regular">
            <Dropdown
              values={Object.keys(GCSEQualification)}
              currentValue={gcseQualification}
              onValueChange={setGcseQualification}
              disabled={readOnly}
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
              disabled={!gcseQualification || readOnly}
              required={!!gcseQualification}
              defaultValue={decimalToNumber(data?.gcseQualificationScore)}
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
              disabled={readOnly}
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
              disabled={!aLevelQualification || readOnly}
              required={!!aLevelQualification}
              defaultValue={decimalToNumber(data?.aLevelQualificationScore)}
            />
          </LabelText>
        </Flex>

        <LabelText label="Motivation Score (optional)">
          <TextField.Root
            id="motivationAdminScore"
            name="motivationAdminScore"
            type="number"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={decimalToNumber(internalReview?.motivationAdminScore)}
            disabled={readOnly}
          />
        </LabelText>

        <LabelText label="Extracurricular Score (optional)">
          <TextField.Root
            id="extracurricularAdminScore"
            name="extracurricularAdminScore"
            type="number"
            min={0.0}
            max={10.0}
            step={0.1}
            defaultValue={decimalToNumber(internalReview?.extracurricularAdminScore)}
            disabled={readOnly}
          />
        </LabelText>

        <LabelText label="Exam Comments (optional)">
          <TextField.Root
            id="examComments"
            name="examComments"
            defaultValue={internalReview?.examComments ?? undefined}
            disabled={readOnly}
          />
        </LabelText>
      </Flex>
    </Flex>
  )
}

const AdminScoringDialog: FC<AdminScoringDialogProps> = ({ data, user }) => {
  const { email, role } = user
  const readOnly = !adminAccess(email, role)

  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)
  const upsertAdminScoringWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertAdminScoring(data.nextAction, data.id, email, prevState, formData)

  return (
    <GenericDialog
      title="Admin Scoring"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="min-h-10 w-20" color="cyan">
          Admin
        </Button>
      }
    >
      <FormWrapper
        action={upsertAdminScoringWithId}
        onSuccess={handleFormSuccess}
        readOnly={readOnly}
      >
        <AdminScoringForm data={data} readOnly={readOnly} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default AdminScoringDialog
