import { ApplicationRow } from '@/components/ApplicationTable'
import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { upsertUgTutor } from '@/lib/forms'
import { FormPassbackState, NextActionEnum } from '@/lib/types'
import { Decision } from '@prisma/client'
import {
  Box,
  Button,
  Callout,
  Card,
  DataList,
  Flex,
  Heading,
  Separator,
  Tabs,
  TextField
} from '@radix-ui/themes'
import React, { FC, useState } from 'react'

interface UgTutorDialogProps {
  data: ApplicationRow
}

interface UgTutorFormProps {
  data: ApplicationRow
}

const UgTutorForm: FC<UgTutorFormProps> = ({ data }) => {
  const { applicant, outcomes } = data
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

      <Tabs.Root defaultValue="outcomes">
        <Tabs.List>
          <Tabs.Trigger value="outcomes">Outcomes</Tabs.Trigger>
          <Tabs.Trigger value="comments">Comments</Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="outcomes">
            {outcomes.map((outcome) => (
              <Card key={outcome.id} className="my-2 bg-gray-200" variant="classic" size={'2'}>
                <Heading size={'3'}>{outcome.degreeCode}</Heading>
                <Separator className="w-full my-1" />
                <Flex direction="column" gap="3">
                  <LabelText label="Offer Code" weight="medium">
                    <TextField.Root id="offerCode" name="offerCode" />
                  </LabelText>
                  <LabelText label="Offer Text" weight="medium">
                    <TextField.Root id="offerText" name="offerText" />
                  </LabelText>
                  <LabelText label="Decision" weight="medium">
                    <Dropdown
                      values={Object.keys(Decision)}
                      currentValue={decision}
                      onValueChange={setDecision}
                      className="flex-grow"
                    />
                    <input name="decision" type="hidden" value={decision?.toString()} />
                  </LabelText>
                </Flex>
              </Card>
            ))}
          </Tabs.Content>
          <Tabs.Content value="comments">Comments</Tabs.Content>
        </Box>
      </Tabs.Root>
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
