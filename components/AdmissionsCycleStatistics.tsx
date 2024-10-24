'use client'

import { ApplicationsLinkButton, HomepageLinkButton } from '@/components/LinkButton'
import { formatCycle } from '@/lib/utils'
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
  applicationsCount: number
  offersCount: number
  rejectionsCount: number
  nextActionCounts: { name: string; quantity: number }[]
}

const AdmissionsCycleStatistics: FC<AdmissionsCycleStatisticsProps> = ({
  cycle,
  applicationsCount,
  offersCount,
  rejectionsCount,
  nextActionCounts
}) => {
  return (
    <Flex direction="column" gap="5">
      <Flex justify="between">
        <Heading as="h1" size="6">
          Admissions Cycle Statistics: {formatCycle(cycle)}
        </Heading>
        <Flex gapX="2">
          <HomepageLinkButton />
          <ApplicationsLinkButton admissionsCycle={cycle.toString()} />
        </Flex>
      </Flex>

      <Heading as="h2" size="4">
        Overview
      </Heading>
      <DataList.Root>
        <DataList.Item>
          <DataList.Label>
            <strong>Total number of applications:</strong>
          </DataList.Label>
          <DataList.Value>{applicationsCount}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="green">
            <strong>Offers made:</strong>
          </DataList.Label>
          <DataList.Value>{offersCount}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="red">
            <strong>Rejections:</strong>
          </DataList.Label>
          <DataList.Value>{rejectionsCount}</DataList.Value>
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
