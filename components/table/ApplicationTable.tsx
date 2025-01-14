'use client'

import AdminScoringDialog from '@/components/dialog/AdminScoringDialog'
import ReviewerScoringDialog from '@/components/dialog/ReviewerScoringDialog'
import UgTutorDialog from '@/components/dialog/UgTutorDialog'
import GenericTable from '@/components/table/GenericTable'
import { updateNextAction } from '@/lib/query/forms'
import { prettifyOption, shortenEmail } from '@/lib/utils'
import {
  Applicant,
  Application,
  Comment as ApplicationComment,
  FeeStatus,
  InternalReview,
  NextAction,
  Outcome,
  Role,
  User,
  WP
} from '@prisma/client'
import { CheckboxIcon, Link2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Button, Card, Flex, Link, Text, TextField } from '@radix-ui/themes'
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table'
import { isNil } from 'lodash'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import React, { FC, useEffect, useMemo, useState } from 'react'

import Dropdown from '../general/Dropdown'

export type ApplicationRow = Application & {
  applicant: Applicant
  internalReview: (InternalReview & { generalComments: ApplicationComment[] }) | null
  reviewer: User | null
  outcomes: Outcome[]
}

const ALL_DROPDOWN_OPTION = 'All'
const SEARCH_PARAM_NEXT_ACTION = 'nextAction'
const SEARCH_PARAM_REVIEWER = 'reviewer'
const SEARCH_PARAM_PERCENTILE = 'percentile'

const columnHelper = createColumnHelper<ApplicationRow>()

interface ApplicationTableProps {
  cycle: number
  applications: ApplicationRow[]
  reviewerLogins: string[]
  user: { email: string; role?: Role }
}

const ApplicationTable: FC<ApplicationTableProps> = ({
  cycle,
  applications,
  reviewerLogins,
  user: { email, role }
}) => {
  // ensure login
  useSession()

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [nextActionFilterValue, setNextActionFilterValue] = useState<string>(ALL_DROPDOWN_OPTION)
  const [reviewerFilterValue, setReviewerFilterValue] = useState<string>(ALL_DROPDOWN_OPTION)
  const [percentileThreshold, setPercentileThreshold] = useState<string>('')

  // searchParams determine what filters should be applied and the value of the dropdown
  useEffect(() => {
    setColumnFilters(Array.from(searchParams).map(([key, value]) => ({ id: key, value: value })))

    setNextActionFilterValue(searchParams.get(SEARCH_PARAM_NEXT_ACTION) || ALL_DROPDOWN_OPTION)
    setReviewerFilterValue(searchParams.get(SEARCH_PARAM_REVIEWER) || ALL_DROPDOWN_OPTION)
    setPercentileThreshold(searchParams.get(SEARCH_PARAM_PERCENTILE) || '')
  }, [
    searchParams,
    setNextActionFilterValue,
    setReviewerFilterValue,
    setPercentileThreshold,
    setColumnFilters
  ])

  const updateSearchParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    window.history.pushState(null, '', `${pathname}?${params.toString()}`)
  }

  const removeSearchParam = (name: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(name)
    window.history.pushState(null, '', `${pathname}?${params.toString()}`)
  }

  // update searchParams which in turn update the dropdown value and the filters
  const onFilterTextChange = (name: string, value: string) => {
    if (value === ALL_DROPDOWN_OPTION || value === '') removeSearchParam(name)
    else updateSearchParam(name, value)
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('applicant.cid', {
        cell: (info) => info.getValue(),
        header: 'CID',
        id: 'applicant.cid'
      }),
      columnHelper.accessor('applicant.ucasNumber', {
        cell: (info) => (
          <UcasApplicationLink admissionsCycle={cycle} ucasNumber={info.getValue()} />
        ),
        header: 'UCAS Number',
        id: 'applicant.ucasNumber'
      }),
      columnHelper.accessor('applicant.firstName', {
        cell: (info) => info.getValue(),
        header: 'First Name',
        id: 'applicant.firstName'
      }),
      columnHelper.accessor('applicant.surname', {
        cell: (info) => info.getValue(),
        header: 'Last Name',
        id: 'applicant.surname'
      }),
      columnHelper.accessor('feeStatus', {
        cell: (info) => (
          <Text color={FeeStatusColourMap[info.getValue()]}>{prettifyOption(info.getValue())}</Text>
        ),
        header: 'Fee Status',
        id: 'feeStatus'
      }),
      columnHelper.accessor('wideningParticipation', {
        cell: (info) => (
          <Text color={WPColourMap[info.getValue()]}>{prettifyOption(info.getValue())}</Text>
        ),
        header: 'WP',
        id: 'wideningParticipation'
      }),
      columnHelper.accessor('nextAction', {
        cell: (info) => (
          <NextActionCell nextAction={info.getValue()} applicationId={info.row.original.id} />
        ),
        header: 'Next Action',
        id: SEARCH_PARAM_NEXT_ACTION
      }),
      columnHelper.accessor('reviewer.login', {
        cell: (info) => shortenEmail(info.getValue()),
        header: 'Reviewer',
        id: SEARCH_PARAM_REVIEWER
      }),
      columnHelper.accessor('internalReview.reviewerPercentile', {
        cell: (info) => info.getValue() || 'N/A',
        header: 'R %',
        id: 'percentile',
        filterFn: (row) => {
          const reviewerPercentile = row.original.internalReview?.reviewerPercentile
          return (
            !isNil(reviewerPercentile) && reviewerPercentile <= parseInt(percentileThreshold, 10)
          )
        }
      }),
      columnHelper.display({
        id: 'forms',
        header: 'Forms',
        cell: (info) => {
          const data = info.row.original
          return (
            <Flex gap="1">
              <AdminScoringDialog data={data} user={{ email: email, role: role }} />
              <ReviewerScoringDialog data={data} userEmail={email} />
              <UgTutorDialog
                data={data}
                user={{ email: email, role: role }}
                reviewerLogin={data?.reviewer?.login}
              />
            </Flex>
          )
        }
      })
    ],
    [cycle, email, role, percentileThreshold]
  )

  return (
    <Flex direction="column" gap="1">
      <Card className="bg-yellow-200">
        <Flex justify="start">
          <Flex gap="5" direction="row" justify="start">
            <Flex align="center" gap="2">
              <Text weight="medium">Next Action: </Text>
              <Dropdown
                values={[ALL_DROPDOWN_OPTION, ...Object.keys(NextAction)]}
                currentValue={nextActionFilterValue}
                onValueChange={(value) => onFilterTextChange(SEARCH_PARAM_NEXT_ACTION, value)}
              />
            </Flex>

            <Flex align="center" gap="2">
              <Text weight="medium">Reviewer: </Text>
              <Dropdown
                values={[ALL_DROPDOWN_OPTION, ...reviewerLogins]}
                currentValue={reviewerFilterValue}
                onValueChange={(value) => onFilterTextChange(SEARCH_PARAM_REVIEWER, value)}
                valueFormatter={shortenEmail}
              />
            </Flex>

            <Flex align="center" gap="2">
              <Text weight="medium">%:</Text>
              <TextField.Root
                onChange={(e) => onFilterTextChange(SEARCH_PARAM_PERCENTILE, e.target.value)}
                value={percentileThreshold}
                type="number"
                size="2"
                className="w-8"
              />
            </Flex>
          </Flex>

          <Flex align="center" className="ml-16">
            <TextField.Root
              placeholder="Search application…"
              onChange={(e) => setGlobalFilter(e.target.value)}
              value={globalFilter}
              size="3"
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="24" width="24" />
              </TextField.Slot>
            </TextField.Root>
          </Flex>
        </Flex>
      </Card>

      <GenericTable
        data={applications}
        columns={columns}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
    </Flex>
  )
}

const FeeStatusColourMap: Record<FeeStatus, 'green' | 'blue' | 'yellow'> = {
  [FeeStatus.HOME]: 'green',
  [FeeStatus.OVERSEAS]: 'blue',
  [FeeStatus.UNKNOWN]: 'yellow'
}

const WPColourMap: Record<WP, 'green' | 'red' | 'yellow'> = {
  [WP.YES]: 'green',
  [WP.NO]: 'red',
  [WP.NOT_CALCULATED]: 'yellow'
}

const NextActionCell: FC<{ nextAction: NextAction; applicationId: number }> = ({
  nextAction,
  applicationId
}) => {
  return (
    <Flex align="center" justify="between" gap="2">
      {prettifyOption(nextAction)}
      {nextAction === NextAction.INFORM_CANDIDATE && (
        <Button
          size="1"
          color="grass"
          onClick={async () => {
            await updateNextAction(NextAction.CANDIDATE_INFORMED, applicationId)
          }}
        >
          <CheckboxIcon />
        </Button>
      )}
    </Flex>
  )
}

const UcasApplicationLink: FC<{ admissionsCycle: number; ucasNumber: string }> = ({
  admissionsCycle,
  ucasNumber
}) => {
  const transformedCycle = '20' + admissionsCycle.toString().slice(0, 2)
  const cgiLink = `https://infosys.doc.ic.ac.uk/UGinterviews/servedocument.cgi?key=${transformedCycle}:${ucasNumber}:infosys`

  return (
    <Link href={cgiLink} target="_blank">
      <Flex align="center" gap="1">
        <Link2Icon />
        {ucasNumber}
      </Flex>
    </Link>
  )
}

export default ApplicationTable
