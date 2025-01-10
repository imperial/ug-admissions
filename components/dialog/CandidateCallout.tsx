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
          <DataList.Item align="center">
            <DataList.Label>Applicant:</DataList.Label>
            <DataList.Value className="font-bold">
              {firstName} {surname}
            </DataList.Value>
          </DataList.Item>
          <DataList.Item align="center">
            <DataList.Label>UCAS number:</DataList.Label>
            <DataList.Value className="font-bold">{ucasNumber}</DataList.Value>
          </DataList.Item>{' '}
          <DataList.Item align="center">
            <DataList.Label>Reviewer:</DataList.Label>
            <DataList.Value className="font-bold">
              {reviewer ? shortenEmail(reviewer) : 'Unassigned'}
            </DataList.Value>
          </DataList.Item>
        </DataList.Root>
        {showExtraInformation && (
          <DataList.Root>
            <DataList.Item align="center">
              <DataList.Label>Reviewer percentile:</DataList.Label>
              <DataList.Value className="font-bold">{reviewerPercentile || 'N/A'}</DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
              <DataList.Label>Overall score:</DataList.Label>
              <DataList.Value className="font-bold">{overallScore || 'N/A'}</DataList.Value>
            </DataList.Item>
            <DataList.Item align="center">
              <DataList.Label>Academic comments:</DataList.Label>
              <DataList.Value className="font-bold">{academicComments || 'N/A'}</DataList.Value>
            </DataList.Item>
          </DataList.Root>
        )}
      </Flex>
    </Callout.Root>
  )
}

export default CandidateCallout
