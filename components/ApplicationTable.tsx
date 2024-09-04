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
    id: 'reviewer.loginId'
  })
]

interface ApplicationTableProps {
  applications: ApplicationRow[]
  reviewerIds: number[]
}

const ApplicationTable: FC<ApplicationTableProps> = ({ applications }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [nextActionFilterValue, setNextActionFilterValue] = useState('ALL')

  // searchParams determine what filters should be applied and the value of the dropdown
  useEffect(() => {
    setColumnFilters(
      searchParams.get('nextAction')
        ? [{ id: 'nextAction', value: searchParams.get('nextAction') }]
        : []
    )
    setNextActionFilterValue(searchParams.get('nextAction') || 'ALL')
  }, [searchParams, setNextActionFilterValue, setColumnFilters])

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
          values={['apple', 'banana']}
          currentValue={'apple'}
          onValueChange={() => {}}
        />
        <FilterDropdown
          onValueChange={(value) => onFilterDropdownChange('nextAction', value)}
          values={[...Object.keys(NextAction), 'ALL']}
          currentValue={nextActionFilterValue}
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
