import { ApplicationRow } from '@/components/ApplicationTable'
import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { upsertOutcome } from '@/lib/forms'
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
  const { applicant } = data
  const [outcomes, setOutcomes] = useState(data.outcomes)

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
            {outcomes.map((outcome, i) => (
              <Card key={outcome.id} className="my-2 bg-gray-200" variant="classic" size={'2'}>
                <Heading size={'3'}>{outcome.degreeCode}</Heading>
                <Separator className="w-full my-1" />
                <Flex direction="column" gap="3">
                  <LabelText label="Offer Code" weight="medium">
                    <TextField.Root
                      name={'offerCode'.concat('-', outcome.degreeCode)}
                      defaultValue={outcome.offerCode ?? ''}
                    />
                  </LabelText>
                  <LabelText label="Offer Text" weight="medium">
                    <TextField.Root
                      name={'offerText'.concat('-', outcome.degreeCode)}
                      defaultValue={outcome.offerText ?? ''}
                    />
                  </LabelText>
                  <LabelText label="Decision" weight="medium">
                    <Dropdown
                      values={Object.keys(Decision)}
                      currentValue={outcome.decision}
                      onValueChange={(newDecision) => {
                        setOutcomes((prevOutcomes) => {
                          const newOutcomes = [...prevOutcomes]
                          newOutcomes[i].decision = newDecision as Decision
                          return newOutcomes
                        })
                      }}
                      className="flex-grow"
                    />
                    <input
                      name={'decision'.concat('-', outcome.degreeCode)}
                      type="hidden"
                      value={outcome.decision.toString()}
                    />
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
  const upsertOutcomeWithId = async (prevState: FormPassbackState, formData: FormData) => {
    return await upsertOutcome(
      NextActionEnum[data.nextAction],
      prevState,
      formData,
      data.outcomes.map((o) => ({
        id: o.id,
        degreeCode: o.degreeCode
      }))
    )
  }

  return (
    <GenericDialog
      title="UG Tutor Form"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={<Button>UG Tutor Form</Button>}
    >
      <FormWrapper action={upsertOutcomeWithId} onSuccess={handleFormSuccess}>
        <UgTutorForm data={data} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default UgTutorDialog
