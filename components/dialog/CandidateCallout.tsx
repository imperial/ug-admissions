import { shortenEmail } from '@/lib/utils'
import { Callout, DataList, Flex } from '@radix-ui/themes'
import React, { FC } from 'react'

interface CandidateCalloutProps {
  firstName: string
  surname: string
  ucasNumber: string
  showExtraInformation?: boolean
  reviewer?: string
  reviewerPercentile?: number | null
  overallScore?: number | null
  academicComments?: string | null
}

const CandidateCallout: FC<CandidateCalloutProps> = ({
  firstName,
  surname,
  ucasNumber,
  showExtraInformation = false,
  reviewer,
  overallScore,
  reviewerPercentile,
  academicComments
}) => {
  return (
    <Callout.Root>
      <Flex align="center" gap="9">
        <DataList.Root>
          <ListItem label="Applicant" value={`${firstName} ${surname}`} />
          <ListItem label="UCAS number" value={ucasNumber} />
          <ListItem label="Reviewer" value={reviewer ? shortenEmail(reviewer) : 'Unassigned'} />
        </DataList.Root>
        {showExtraInformation && (
          <DataList.Root>
            <ListItem
              label="Reviewer percentile"
              value={reviewerPercentile ? reviewerPercentile.toString() : 'N/A'}
            />
            <ListItem
              label="Overall score"
              value={overallScore ? overallScore.toString() : 'N/A'}
            />
            <ListItem label="Academic comments" value={academicComments || 'N/A'} />
          </DataList.Root>
        )}
      </Flex>
    </Callout.Root>
  )
}

interface ListItemProps {
  label: string
  value: string
}

const ListItem: FC<ListItemProps> = ({ label, value }) => {
  return (
    <DataList.Item align="center">
      <DataList.Label>{label}:</DataList.Label>
      <DataList.Value className="font-bold">{value}</DataList.Value>
    </DataList.Item>
  )
}

export default CandidateCallout
