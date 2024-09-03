"use client"

import React, {FC} from "react"
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

interface ApplicantTableProps {
  applicants: ApplicantRow[]
}

const ApplicantTable: FC<ApplicantTableProps> = ({ applicants }) => {
    return (
        <TanstackTable data={applicants} columns={columns} />
    )
}

export default ApplicantTable