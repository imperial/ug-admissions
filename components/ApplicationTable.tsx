'use client'

import { Applicant, Application, NextAction, User } from '@prisma/client'
import { Card } from '@radix-ui/themes'
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { FC, useEffect, useState } from 'react'

import TanstackTable from './TanstackTable'
import FilterDropdown from './TanstackTable/FilterDropdown'

type ApplicationRow = Pick<Application, 'nextAction' | 'feeStatus' | 'wideningParticipation'> & {
  applicant: Pick<Applicant, 'cid' | 'ucasNumber' | 'firstName' | 'surname'>
  reviewer: Pick<User, 'loginId'> | null
}

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
    id: 'nextAction'
  }),
  columnHelper.accessor('reviewer.loginId', {
    cell: (info) => info.getValue(),
    header: 'Reviewer',
    id: 'reviewer'
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
  const [nextActionFilterValue, setNextActionFilterValue] = useState('ALL')
  const [reviewerFilterValue, setReviewerFilterValue] = useState('ALL')

  // searchParams determine what filters should be applied and the value of the dropdown
  useEffect(() => {
    setColumnFilters(Array.from(searchParams).map(([key, value]) => ({ id: key, value: value })))

    setNextActionFilterValue(searchParams.get('nextAction') || 'ALL')
    setReviewerFilterValue(searchParams.get('reviewer') || 'ALL')
  }, [searchParams, setNextActionFilterValue, setReviewerFilterValue, setColumnFilters])

  const updateSearchParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    router.push(pathname + '?' + params.toString())
  }

  const removeSearchParam = (name: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(name)
    router.push(pathname + '?' + params.toString())
  }

  // update searchParams which in turn update the dropdown value and the filters
  const onFilterDropdownChange = (name: string, value: string) => {
    if (value === 'ALL') {
      removeSearchParam(name)
    } else {
      updateSearchParam(name, value)
    }
  }

  return (
    <>
      <Card>
        <FilterDropdown
          values={[...reviewerIds, 'ALL']}
          currentValue={reviewerFilterValue}
          onValueChange={(value) => onFilterDropdownChange('reviewer', value)}
        />
        <FilterDropdown
          values={[...Object.keys(NextAction), 'ALL']}
          currentValue={nextActionFilterValue}
          onValueChange={(value) => onFilterDropdownChange('nextAction', value)}
        />
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
