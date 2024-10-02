import { DataList, Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'

interface AdmissionsCycleStatisticsProps {
  cycle: number
  noApplications: number
}

const AdmissionsCycleStatistics: FC<AdmissionsCycleStatisticsProps> = ({
  cycle,
  noApplications
}) => {
  return (
    <Flex direction="column" gap="4">
      <Heading>Undergraduate Admissions Portal</Heading>
      <Heading as="h1" size="4">
        {`${cycle} Admissions Cycle`}
      </Heading>
      <Heading as="h2" size="3">
        Summary statistics
      </Heading>
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>Total number of applications:</DataList.Label>
          <DataList.Value>{noApplications}</DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </Flex>
  )
}

export default AdmissionsCycleStatistics
