import { ApplicationRow } from '@/components/ApplicationTable'
import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { upsertUgTutor } from '@/lib/forms'
import { FormPassbackState, NextActionEnum } from '@/lib/types'
import { Decision } from '@prisma/client'
import { Button, Callout, DataList, Flex, TextField } from '@radix-ui/themes'
import React, { FC, useState } from 'react'

interface UgTutorDialogProps {
  data: ApplicationRow
}

interface UgTutorFormProps {
  data: ApplicationRow
}

const UgTutorForm: FC<UgTutorFormProps> = ({ data }) => {
  const { applicant, internalReview } = data
  const [decision, setDecision] = useState(Decision.PENDING.toString())

  return (
    <Flex direction="column" gap="3">
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
        </DataList.Root>
      </Callout.Root>

      <Flex direction="column" gap="3">
        <LabelText label="Offer Code">
          <TextField.Root id="offerCode" name="offerCode" />
        </LabelText>
        <LabelText label="Offer Text">
          <TextField.Root id="offerText" name="offerText" />
        </LabelText>
        <LabelText label="Decision" weight="bold">
          <Dropdown
            values={Object.keys(Decision)}
            currentValue={decision}
            onValueChange={setDecision}
            className="flex-grow"
          />
          <input name="decision" type="hidden" value={decision?.toString()} />
        </LabelText>
      </Flex>
    </Flex>
  )
}

const UgTutorDialog: FC<UgTutorDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)
  const upsertUgTutorWithId = (prevState: FormPassbackState, formData: FormData) =>
    upsertUgTutor(NextActionEnum[data.nextAction], data.id, prevState, formData)

  return (
    <GenericDialog
      title="UG Tutor Form"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={<Button>UG Tutor Form</Button>}
    >
      <FormWrapper action={upsertUgTutorWithId} onSuccess={handleFormSuccess}>
        <UgTutorForm data={data} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default UgTutorDialog
