'use client'

import { Applicant, Application, NextAction } from '@prisma/client'
import { createColumnHelper } from '@tanstack/react-table'
import React, { FC } from 'react'

import TanstackTable from './TanstackTable'

type ApplicationRow = Pick<Application, 'nextAction' | 'feeStatus' | 'wideningParticipation'> & {
  applicant: Pick<Applicant, 'cid' | 'ucasNumber' | 'firstName' | 'surname'>
}
const columnHelper = createColumnHelper<ApplicationRow>()

const columns = [
  columnHelper.accessor('applicant.cid', {
    cell: (info) => info.getValue(),
    header: 'CID'
  }),
  columnHelper.accessor('applicant.ucasNumber', {
    cell: (info) => info.getValue(),
    header: 'UCAS number'
  }),
  columnHelper.accessor('applicant.firstName', {
    cell: (info) => info.getValue(),
    header: 'First Name'
  }),
  columnHelper.accessor('applicant.surname', {
    cell: (info) => info.getValue(),
    header: 'Last Name'
  }),
  columnHelper.accessor('feeStatus', {
    cell: (info) => info.getValue(),
    header: 'Fee Status'
  }),
  columnHelper.accessor('wideningParticipation', {
    cell: (info) => info.getValue().toString(),
    header: 'Widening Participation'
  }),
  columnHelper.accessor('nextAction', {
    cell: (info) => info.getValue(),
    header: 'Next Action'
  })
]

interface ApplicationTableProps {
  applications: ApplicationRow[]
}

const ApplicationTable: FC<ApplicationTableProps> = ({ applications }) => (
  <TanstackTable data={applications} columns={columns} />
)

export default ApplicationTable
