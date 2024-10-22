'use client'

import AdminScoringDialog from '@/components/AdminScoringDialog'
import ReviewerScoringDialog from '@/components/ReviewerScoringDialog'
import TanstackTable from '@/components/TanstackTable'
import UgTutorDialog from '@/components/UgTutorDialog'
import { prettifyOption, trimEmail } from '@/lib/utils'
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
import { MagnifyingGlassIcon } from '@radix-ui/react-icons'
import { Card, Flex, Text, TextField } from '@radix-ui/themes'
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'

import Dropdown from './Dropdown'

export type ApplicationRow = Application & {
  applicant: Applicant
  internalReview: (InternalReview & { generalComments: ApplicationComment[] }) | null
  reviewer: User | null
  outcomes: Outcome[]
}

const ALL_DROPDOWN_OPTION = 'All'
const SEARCH_PARAM_NEXT_ACTION = 'nextAction'
const SEARCH_PARAM_REVIEWER = 'reviewer'

const columnHelper = createColumnHelper<ApplicationRow>()

interface ApplicationTableProps {
  applications: ApplicationRow[]
  reviewerIds: string[]
  user: { email: string; role: Role }
}

const ApplicationTable: FC<ApplicationTableProps> = ({
  applications,
  reviewerIds,
  user: { email, role }
}) => {
  // ensure login
  useSession()

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [nextActionFilterValue, setNextActionFilterValue] = useState(ALL_DROPDOWN_OPTION)
  const [reviewerFilterValue, setReviewerFilterValue] = useState(ALL_DROPDOWN_OPTION)

  // searchParams determine what filters should be applied and the value of the dropdown
  useEffect(() => {
    setColumnFilters(Array.from(searchParams).map(([key, value]) => ({ id: key, value: value })))

    setNextActionFilterValue(searchParams.get(SEARCH_PARAM_NEXT_ACTION) || ALL_DROPDOWN_OPTION)
    setReviewerFilterValue(searchParams.get(SEARCH_PARAM_REVIEWER) || ALL_DROPDOWN_OPTION)
  }, [searchParams, setNextActionFilterValue, setReviewerFilterValue, setColumnFilters])

  const updateSearchParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    router.push(`${pathname}?${params}`)
  }

  const removeSearchParam = (name: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(name)
    router.push(`${pathname}?${params}`)
  }

  // update searchParams which in turn update the dropdown value and the filters
  const onFilterDropdownChange = (name: string, value: string) => {
    if (value === ALL_DROPDOWN_OPTION) removeSearchParam(name)
    else updateSearchParam(name, value)
  }

  const columns = [
    columnHelper.accessor('applicant.cid', {
      cell: (info) => info.getValue(),
      header: 'CID',
      id: 'applicant.cid'
    }),
    columnHelper.accessor('applicant.ucasNumber', {
      cell: (info) => info.getValue(),
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
      cell: (info) => prettifyOption(info.getValue()),
      header: 'Next Action',
      id: SEARCH_PARAM_NEXT_ACTION
    }),
    columnHelper.accessor('reviewer.login', {
      cell: (info) => trimEmail(info.getValue()),
      header: 'Reviewer',
      id: SEARCH_PARAM_REVIEWER
    }),
    columnHelper.display({
      id: 'forms',
      header: 'Forms',
      cell: (info) => (
        <Flex gap="4">
          <AdminScoringDialog data={info.row.original} user={{ email: email, role: role }} />
          <ReviewerScoringDialog data={info.row.original} userEmail={email} />
          <UgTutorDialog data={info.row.original} user={{ email: email, role: role }} />
        </Flex>
      )
    })
  ]

  return (
    <Flex direction="column" gap="1">
      <Card className="bg-indigo-200">
        <Flex justify="start">
          <Flex gap="5" direction="row" justify="start">
            <Flex align="center" gap="2">
              <Text weight="medium">Next Action: </Text>
              <Dropdown
                values={[ALL_DROPDOWN_OPTION, ...Object.keys(NextAction)]}
                currentValue={nextActionFilterValue}
                onValueChange={(value) => onFilterDropdownChange(SEARCH_PARAM_NEXT_ACTION, value)}
              />
            </Flex>

            <Flex align="center" gap="2">
              <Text weight="medium">Reviewer: </Text>
              <Dropdown
                values={[ALL_DROPDOWN_OPTION, ...reviewerIds]}
                currentValue={reviewerFilterValue}
                onValueChange={(value) => onFilterDropdownChange(SEARCH_PARAM_REVIEWER, value)}
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

      <TanstackTable
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

export default ApplicationTable
