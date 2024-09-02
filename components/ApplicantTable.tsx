"use client"

import { Applicant } from "@prisma/client"
import { createColumnHelper } from "@tanstack/react-table"
import TanstackTable from "./TanstackTable"

type ApplicantRow = Pick<Applicant, 'cid' | 'firstName'>
const columnHelper = createColumnHelper<ApplicantRow>()

const columns = [
  columnHelper.accessor('cid', {
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('firstName', {
    cell: (info) => info.getValue(),
  })
]

const ApplicantTable = ({ applicants }: { applicants: ApplicantRow[] }) => {
    return (
        <TanstackTable data={applicants} columns={columns} />
    )
}

export default ApplicantTable