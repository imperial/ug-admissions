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
  })
]

interface ApplicationTableProps {
  applications: ApplicationRow[]
}

const ApplicationTable: FC<ApplicationTableProps> = ({ applications }) => (
  <TanstackTable data={applications} columns={columns} />
)

export default ApplicationTable
