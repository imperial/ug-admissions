import { ApplicationRow } from '@/components/ApplicationTable'
import CommentItem from '@/components/CommentItem'
import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import Dropdown from '@/components/TanstackTable/Dropdown'
import { insertComment, upsertOutcome } from '@/lib/forms'
import { FormPassbackState } from '@/lib/types'
import { Comment as ApplicationComment, CommentType, Decision, NextAction } from '@prisma/client'
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
  TextArea,
  TextField
} from '@radix-ui/themes'
import React, { FC, useMemo, useState } from 'react'

interface UgTutorDialogProps {
  // generalComments relation does not type check otherwise
  data: ApplicationRow
}

type Tab = 'outcomes' | 'comments'

interface UgTutorFormProps {
  data: ApplicationRow
  setCurrentTab: (tab: Tab) => void
}

const decisionColourMap = {
  [Decision.OFFER]: 'bg-green-500',
  [Decision.REJECT]: 'bg-red-300',
  [Decision.PENDING]: 'bg-amber-200'
}

const UgTutorForm: FC<UgTutorFormProps> = ({ data, setCurrentTab }) => {
  const { applicant, internalReview } = data
  const [outcomes, setOutcomes] = useState(data.outcomes)
  const [nextAction, setNextAction] = useState(data.nextAction.toString())
  const [commentType, setCommentType] = useState(CommentType.NOTE.toString())

  // sort in descending order (most recent)
  const sortedComments = useMemo(
    () =>
      internalReview?.generalComments.toSorted(
        (a: ApplicationComment, b: ApplicationComment) =>
          new Date(b.madeOn).getTime() - new Date(a.madeOn).getTime()
      ) ?? [],
    [internalReview?.generalComments]
  )

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

      <Tabs.Root defaultValue="outcomes" onValueChange={(tabName) => setCurrentTab(tabName as Tab)}>
        <Tabs.List>
          <Tabs.Trigger value="outcomes">Outcomes</Tabs.Trigger>
          <Tabs.Trigger value="comments">Comments</Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="outcomes">
            {outcomes.map((outcome, i) => (
              <Card
                key={outcome.id}
                className={`my-2 ${decisionColourMap[outcome.decision]}`}
                variant="classic"
                size={'2'}
              >
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
            <LabelText label="Set Next Action">
              <Dropdown
                values={[
                  NextAction.UG_TUTOR_REVIEW,
                  NextAction.INFORM_CANDIDATE,
                  NextAction.CANDIDATE_INFORMED
                ]}
                currentValue={nextAction}
                onValueChange={setNextAction}
              />
            </LabelText>
            <input name="nextAction" type="hidden" value={nextAction} />
          </Tabs.Content>

          <Tabs.Content value="comments">
            <Flex direction="column" gap="3">
              {sortedComments.map((comment: ApplicationComment) => (
                <CommentItem key={comment.commentNo} comment={comment} />
              ))}
              <Flex>
                <LabelText label="Type">
                  <Dropdown
                    className="max-w-64"
                    values={Object.keys(CommentType)}
                    currentValue={commentType}
                    onValueChange={setCommentType}
                  />
                  <input name="type" type="hidden" value={commentType} />
                </LabelText>
              </Flex>
              <LabelText label="Comment">
                <TextArea name={'text'} defaultValue={''} />
              </LabelText>
            </Flex>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Flex>
  )
}

const UgTutorDialog: FC<UgTutorDialogProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)
  const [currentTab, setCurrentTab] = useState<Tab>('outcomes')

  const { id, applicantCid, admissionsCycle, internalReview } = data

  const upsertOutcomeWithId = async (prevState: FormPassbackState, formData: FormData) => {
    return await upsertOutcome(
      id,
      data.outcomes.map((o) => ({
        id: o.id,
        degreeCode: o.degreeCode
      })),
      prevState,
      formData
    )
  }

  const addCommentWithId = async (prevState: FormPassbackState, formData: FormData) => {
    if (!internalReview)
      return { status: 'error', message: 'Admin scoring form must be completed first!' }
    return await insertComment(
      applicantCid,
      admissionsCycle,
      internalReview.id,
      prevState,
      formData
    )
  }

  return (
    <GenericDialog
      title="UG Tutor Form"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="min-h-10" color="ruby">
          UG Tutor Form
        </Button>
      }
    >
      <FormWrapper
        action={currentTab === 'outcomes' ? upsertOutcomeWithId : addCommentWithId}
        onSuccess={handleFormSuccess}
        submitButtonText={currentTab === 'outcomes' ? 'Save' : 'Add Comment'}
      >
        <UgTutorForm data={data} setCurrentTab={setCurrentTab} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default UgTutorDialog
