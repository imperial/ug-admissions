import { Callout, DataList } from '@radix-ui/themes'
import React, { FC } from 'react'

interface CandidateCalloutProps {
  firstName: string
  surname: string
  ucasNumber: string
}

const CandidateCallout: FC<CandidateCalloutProps> = ({ firstName, surname, ucasNumber }) => {
  return (
    <Callout.Root>
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
        </DataList.Item>
      </DataList.Root>
    </Callout.Root>
  )
}

export default CandidateCallout
