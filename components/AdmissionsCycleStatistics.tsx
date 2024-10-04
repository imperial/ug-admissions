'use client'

import HomepageLinkButton from '@/components/HomepageLinkButton'
import { DataList, Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'
import {
  Bar,
  BarChart,
  Label,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface AdmissionsCycleStatisticsProps {
  cycle: number
  noApplications: number
  noOffers: number
  noRejections: number
  nextActionCounts: { name: string; quantity: number }[]
}

const AdmissionsCycleStatistics: FC<AdmissionsCycleStatisticsProps> = ({
  cycle,
  noApplications,
  noOffers,
  noRejections,
  nextActionCounts
}) => {
  return (
    <Flex direction="column" gap="5">
      <Flex justify="between">
        <Heading as="h1" size="6">
          {`Admissions Cycle Statistics: ${cycle}`}
        </Heading>
        <HomepageLinkButton />
      </Flex>

      <Heading as="h2" size="4">
        Overview
      </Heading>
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>
            <strong>Total number of applications:</strong>
          </DataList.Label>
          <DataList.Value>{noApplications}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="green">
            <strong>Offers made:</strong>
          </DataList.Label>
          <DataList.Value>{noOffers}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="red">
            <strong>Rejections:</strong>
          </DataList.Label>
          <DataList.Value>{noRejections}</DataList.Value>
        </DataList.Item>
      </DataList.Root>

      <NextActionGraph data={nextActionCounts} />
    </Flex>
  )
}

interface NextActionGraphProps {
  data: { name: string; quantity: number }[]
}

const NextActionGraph: FC<NextActionGraphProps> = ({ data }) => {
  return (
    <Flex direction="column">
      <Heading as="h2" size="3" align="center">
        Applications per stage
      </Heading>
      <ResponsiveContainer width="100%" height={400} className="mt-4">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }}>
            <Label value={'Next Action'} dy={10} position="insideBottom" />
          </XAxis>
          <YAxis dataKey="quantity">
            <Label value={'Number of applications'} angle={-90} dx={-30} position="middle" />
          </YAxis>
          <Tooltip />
          <Legend verticalAlign="top" align="right" />
          <Bar
            dataKey="quantity"
            fill="#085d9e"
            activeBar={<Rectangle fill="green" stroke="black" />}
            barSize={100}
          />
        </BarChart>
      </ResponsiveContainer>
    </Flex>
  )
}
export default AdmissionsCycleStatistics
