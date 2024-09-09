'use client'

import AdminScoringForm from '@/components/AdminScoringForm'
import type { Applicant, Application, InternalReview, User } from '@prisma/client'
import { NextAction } from '@prisma/client'
import { Card, Flex, Text } from '@radix-ui/themes'
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'

import TanstackTable from './TanstackTable'
import Dropdown from './TanstackTable/Dropdown'

export type ApplicationRow = Application & {
  applicant: Applicant
  internalReview: InternalReview | null
  reviewer: User | null
}

const ALL_DROPDOWN_OPTION = 'All'
const SEARCH_PARAM_NEXT_ACTION = 'nextAction'
const SEARCH_PARAM_REVIEWER = 'reviewer'

const columnHelper = createColumnHelper<ApplicationRow>()

const columns = [
  columnHelper.accessor('applicant.cid', {
    cell: (info) => info.getValue(),
    header: 'CID',
    id: 'applicant.cid'
  }),
  columnHelper.accessor('applicant.ucasNumber', {
    cell: (info) => info.getValue(),
    header: 'UCAS number',
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
    cell: (info) => info.getValue(),
    header: 'Fee Status',
    id: 'feeStatus'
  }),
  columnHelper.accessor('wideningParticipation', {
    cell: (info) => info.getValue().toString(),
    header: 'Widening Participation',
    id: 'wideningParticipation'
  }),
  columnHelper.accessor('nextAction', {
    cell: (info) => info.getValue(),
    header: 'Next Action',
    id: SEARCH_PARAM_NEXT_ACTION
  }),
  columnHelper.accessor('reviewer.login', {
    cell: (info) => info.getValue(),
    header: 'Reviewer',
    id: SEARCH_PARAM_REVIEWER
  }),
  columnHelper.display({
    id: 'adminFormButton',
    cell: (info) => <AdminScoringForm row={info.row.original} />
  })
]

interface ApplicationTableProps {
  applications: ApplicationRow[]
  reviewerIds: string[]
}

const ApplicationTable: FC<ApplicationTableProps> = ({ applications, reviewerIds }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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

  return (
    <>
      <Card>
        <Flex gapX="5">
          <Flex gapX="2" align="center">
            <Text>Next Action: </Text>
            <Dropdown
              values={[ALL_DROPDOWN_OPTION, ...Object.keys(NextAction)]}
              currentValue={nextActionFilterValue}
              onValueChange={(value) => onFilterDropdownChange(SEARCH_PARAM_NEXT_ACTION, value)}
            />
          </Flex>
          <Flex gapX="2" align="center">
            <Text>Reviewer: </Text>
            <Dropdown
              values={[ALL_DROPDOWN_OPTION, ...reviewerIds]}
              currentValue={reviewerFilterValue}
              onValueChange={(value) => onFilterDropdownChange(SEARCH_PARAM_REVIEWER, value)}
            />
          </Flex>
        </Flex>
      </Card>
      <TanstackTable
        data={applications}
        columns={columns}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
      />
    </>
  )
}

export default ApplicationTable
