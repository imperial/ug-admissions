import { shortenEmail } from '@/lib/utils'
import { Card, DataList, Flex, Text } from '@radix-ui/themes'
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
    <Card className="bg-blue-200">
      <Flex>
        <Flex flexBasis={showExtraInformation ? '40%' : '100%'}>
          <DataList.Root>
            <ListItem label="Applicant" value={`${firstName} ${surname}`} />
            <ListItem label="UCAS number" value={ucasNumber} />
            <ListItem label="Reviewer" value={reviewer ? shortenEmail(reviewer) : 'Unassigned'} />
          </DataList.Root>
        </Flex>
        {showExtraInformation && (
          <Flex flexBasis="60%">
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
          </Flex>
        )}
      </Flex>
    </Card>
  )
}

interface ListItemProps {
  label: string
  value: string
}

const ListItem: FC<ListItemProps> = ({ label, value }) => {
  return (
    <DataList.Item align="center">
      <DataList.Label>
        <Text weight="bold">{label}:</Text>
      </DataList.Label>
      <DataList.Value>{value}</DataList.Value>
    </DataList.Item>
  )
}

export default CandidateCallout
