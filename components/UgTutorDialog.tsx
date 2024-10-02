import { ApplicationRow } from '@/components/ApplicationTable'
import CandidateCallout from '@/components/CandidateCallout'
import CommentItem from '@/components/CommentItem'
import Dropdown from '@/components/Dropdown'
import FormWrapper from '@/components/FormWrapper'
import GenericDialog from '@/components/GenericDialog'
import LabelText from '@/components/LabelText'
import TmuaGradeBox from '@/components/TmuaGradeBox'
import { insertComment, upsertOutcome } from '@/lib/forms'
import { FormPassbackState } from '@/lib/types'
import {
  Comment as ApplicationComment,
  CommentType,
  Decision,
  NextAction,
  Role
} from '@prisma/client'
import {
  Box,
  Button,
  Card,
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
  user: { email: string; role: Role }
}

type Tab = 'outcomes' | 'comments'

interface UgTutorFormProps {
  data: ApplicationRow
  readOnly: boolean
  setCurrentTab: (tab: Tab) => void
}

const decisionColourMap = {
  [Decision.OFFER]: 'bg-green-500',
  [Decision.REJECT]: 'bg-red-300',
  [Decision.PENDING]: 'bg-amber-200'
}

const UgTutorForm: FC<UgTutorFormProps> = ({ data, readOnly, setCurrentTab }) => {
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
      <CandidateCallout
        firstName={applicant.firstName}
        surname={applicant.surname}
        ucasNumber={applicant.ucasNumber}
      />

      {/* Reviewers should not be able to see TMUA grades */}
      {!readOnly && (
        <TmuaGradeBox
          paper1Score={data.tmuaPaper1Score}
          paper2Score={data.tmuaPaper2Score}
          overallScore={data.tmuaOverallScore}
        />
      )}

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
                      disabled={readOnly}
                    />
                  </LabelText>
                  <LabelText label="Offer Text" weight="medium">
                    <TextField.Root
                      name={'offerText'.concat('-', outcome.degreeCode)}
                      defaultValue={outcome.offerText ?? ''}
                      disabled={readOnly}
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
                      disabled={readOnly}
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
                disabled={readOnly}
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
                    disabled={readOnly}
                  />
                  <input name="type" type="hidden" value={commentType} />
                </LabelText>
              </Flex>
              <LabelText label="Comment">
                <TextArea name={'text'} defaultValue={''} disabled={readOnly} />
              </LabelText>
            </Flex>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Flex>
  )
}

const UgTutorDialog: FC<UgTutorDialogProps> = ({ data, user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const handleFormSuccess = () => setIsOpen(false)
  const [currentTab, setCurrentTab] = useState<Tab>('outcomes')

  const { id, applicantCid, admissionsCycle, internalReview } = data
  const { email, role } = user

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
      email,
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
        <UgTutorForm data={data} setCurrentTab={setCurrentTab} readOnly={role !== Role.UG_TUTOR} />
      </FormWrapper>
    </GenericDialog>
  )
}

export default UgTutorDialog
