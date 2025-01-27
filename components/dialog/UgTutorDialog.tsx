'use client'

import AllComments from '@/components/dialog/AllComments'
import CandidateCallout from '@/components/dialog/CandidateCallout'
import FormWrapper from '@/components/dialog/FormWrapper'
import GenericDialog from '@/components/dialog/GenericDialog'
import TmuaGradeBox from '@/components/dialog/TmuaGradeBox'
import Dropdown from '@/components/general/Dropdown'
import LabelText from '@/components/general/LabelText'
import { ApplicationRow } from '@/components/table/ApplicationTable'
import { adminAccess } from '@/lib/access'
import { dateFormatting } from '@/lib/constants'
import { insertComment, updateOutcomes } from '@/lib/query/forms'
import { FormPassbackState } from '@/lib/types'
import { decimalToNumber, shortenEmail } from '@/lib/utils'
import {
  Comment as ApplicationComment,
  CommentType,
  Decision,
  NextAction,
  Role
} from '@prisma/client'
import { DoubleArrowRightIcon, Pencil2Icon } from '@radix-ui/react-icons'
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Tabs,
  Text,
  TextArea,
  TextField
} from '@radix-ui/themes'
import { format } from 'date-fns'
import React, { FC, useEffect, useMemo, useState } from 'react'

type Tab = 'outcomes' | 'comments'

interface UgTutorDialogProps {
  data: ApplicationRow
  reviewerLogin?: string
  user: { email: string; role?: Role }
}

interface UgTutorFormProps {
  data: ApplicationRow
  reviewerLogin?: string
  readOnly: boolean
  setCurrentTab: (tab: Tab) => void
  nextAction: string
  setNextAction: (nextAction: string) => void
}

const decisionColourMap = {
  [Decision.OFFER]: 'bg-green-500',
  [Decision.REJECT]: 'bg-red-300',
  [Decision.PENDING]: 'bg-amber-200'
}

const UgTutorForm: FC<UgTutorFormProps> = ({
  data,
  reviewerLogin,
  readOnly,
  setCurrentTab,
  nextAction,
  setNextAction
}) => {
  const { applicant, internalReview } = data
  const [outcomes, setOutcomes] = useState(data.outcomes)
  const [commentType, setCommentType] = useState(CommentType.NOTE.toString())

  // don't reinitialise outcomes when switching tabs
  useEffect(() => {
    setOutcomes(data.outcomes)
  }, [data.outcomes])

  // comments ordered as most recent (in descending order)
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
      {internalReview?.lastUserEditOn && internalReview?.lastUserEditBy && (
        <Text size="2" className="italic text-gray-500">
          Last overall edit by {shortenEmail(internalReview.lastUserEditBy)} on{' '}
          {format(internalReview.lastUserEditOn, dateFormatting)}
        </Text>
      )}

      <CandidateCallout
        firstName={applicant.firstName}
        surname={applicant.surname}
        ucasNumber={applicant.ucasNumber}
        showExtraInformation={true}
        reviewer={reviewerLogin}
        overallScore={decimalToNumber(internalReview?.overallScore)}
        reviewerPercentile={internalReview?.reviewerPercentile}
        academicComments={internalReview?.academicComments}
      />

      {/* Reviewers should not be able to see TMUA grades */}
      {!readOnly && <TmuaGradeBox score={data.tmuaScore} />}

      <Tabs.Root defaultValue="outcomes" onValueChange={(tabName) => setCurrentTab(tabName as Tab)}>
        <Tabs.List>
          <Tabs.Trigger value="outcomes">Outcomes</Tabs.Trigger>
          <Tabs.Trigger value="comments">Comments</Tabs.Trigger>
        </Tabs.List>

        <Box pt="3">
          <Tabs.Content value="outcomes">
            <Flex justify="between" gap="2">
              <Flex className="w-4/7">
                <Flex direction="column" gap="3">
                  {outcomes.map((outcome, i) => (
                    <Card
                      key={outcome.id}
                      className={`my-2 ${decisionColourMap[outcome.decision]} w-[40rem]`}
                      variant="classic"
                      size="2"
                    >
                      <Flex direction="column" gap="1">
                        <Heading size="3">{outcome.degreeCode}</Heading>
                        <Flex gap="1">
                          <Text size="2" weight="medium">
                            Academic eligibility:
                          </Text>
                          <Text size="2">{outcome.academicEligibilityNotes}</Text>
                        </Flex>
                        <Separator className="w-full my-1" />
                        <Flex direction="column" gap="3">
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
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Flex>
              <AllComments sortedComments={sortedComments} />
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="comments">
            <Flex direction="column" gap="3">
              <AllComments sortedComments={sortedComments} />
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
                <TextArea name="text" defaultValue="" disabled={readOnly} minLength={1} required />
              </LabelText>
            </Flex>
          </Tabs.Content>

          <LabelText label="Set Next Action" className="mt-2">
            <Dropdown
              values={[
                'Unchanged',
                NextAction.UG_TUTOR_REVIEW,
                NextAction.UG_TUTOR_RECONSIDER,
                NextAction.INFORM_CANDIDATE,
                NextAction.FINAL_CHECK,
                NextAction.CANDIDATE_INFORMED
              ]}
              currentValue={nextAction}
              onValueChange={setNextAction}
              disabled={readOnly}
            />
          </LabelText>
          <input name="nextAction" type="hidden" value={nextAction} />
        </Box>
      </Tabs.Root>
    </Flex>
  )
}

const UgTutorDialog: FC<UgTutorDialogProps> = ({ data, reviewerLogin, user }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTab, setCurrentTab] = useState<Tab>('outcomes')
  const [nextAction, setNextAction] = useState<string>('Unchanged')

  const { id, admissionsCycle, internalReview } = data
  const { email, role } = user

  const upsertOutcomeWithId = async (prevState: FormPassbackState, formData: FormData) => {
    return await updateOutcomes(
      id,
      email,
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
    return await insertComment(id, admissionsCycle, email, internalReview.id, prevState, formData)
  }

  return (
    <GenericDialog
      title="UG Tutor"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button className="min-h-10 w-20" color={decideTriggerColour(data)}>
          UG Tutor
        </Button>
      }
      minWidth="1200px"
    >
      <FormWrapper
        action={currentTab === 'outcomes' ? upsertOutcomeWithId : addCommentWithId}
        submitButtonText={currentTab === 'outcomes' ? 'Save' : 'Add Comment'}
        submitIcon={currentTab === 'outcomes' ? <DoubleArrowRightIcon /> : <Pencil2Icon />}
        onSuccess={() => setIsOpen(nextAction === 'Unchanged')}
      >
        <UgTutorForm
          data={data}
          reviewerLogin={reviewerLogin}
          readOnly={!adminAccess(email, role)}
          setCurrentTab={setCurrentTab}
          nextAction={nextAction}
          setNextAction={setNextAction}
        />
      </FormWrapper>
    </GenericDialog>
  )
}

/**
 * Determines the trigger colour based on the application's outcomes.
 * Orange if reviewer percentile set and ≤ 50, next action is UG_TUTOR_REVIEW and any decision pending
 * Yellow if next action is UG_TUTOR_REVIEW and no pending decisions
 * Bronze otherwise.
 *
 * @param {ApplicationRow} application - The application data.
 * @returns {string} - Radix button colour.
 */
function decideTriggerColour(application: ApplicationRow): 'orange' | 'yellow' | 'bronze' {
  const isOrange =
    application.nextAction === NextAction.UG_TUTOR_REVIEW &&
    application.internalReview?.reviewerPercentile &&
    application.internalReview.reviewerPercentile <= 50 &&
    application.outcomes.some((o) => o.decision === Decision.PENDING)
  if (isOrange) return 'orange'

  const isYellow =
    application.nextAction === NextAction.UG_TUTOR_REVIEW &&
    !application.outcomes.some((o) => o.decision === Decision.PENDING)
  if (isYellow) return 'yellow'

  return 'bronze'
}

export default UgTutorDialog
