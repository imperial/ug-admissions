'use client'

import { NextAction } from '@prisma/client'
import { DataList, Flex, Heading } from '@radix-ui/themes'
import React, { FC } from 'react'
import {
  Bar,
  BarChart,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

interface AdmissionsCycleStatisticsProps {
  cycle: number
  noApplicants: number
  noOffers: number
  noRejections: number
  nextActionCounts: Record<NextAction, number>
}

interface NextActionGraphProps {
  data: { name: string; quantity: number }[]
}

const NextActionGraph: FC<NextActionGraphProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="quantity"
          fill="#8884d8"
          activeBar={<Rectangle fill="pink" stroke="blue" />}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

const AdmissionsCycleStatistics: FC<AdmissionsCycleStatisticsProps> = ({
  cycle,
  noApplicants,
  noOffers,
  noRejections,
  nextActionCounts
}) => {
  const nextActionGraphData = Object.entries(nextActionCounts).map(([nextAction, count]) => ({
    name: nextAction,
    quantity: count
  }))

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
          <DataList.Label>Total number of applicants:</DataList.Label>
          <DataList.Value>{noApplicants}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="green">Offers made:</DataList.Label>
          <DataList.Value>{noOffers}</DataList.Value>
        </DataList.Item>
        <DataList.Item>
          <DataList.Label color="red">Rejections:</DataList.Label>
          <DataList.Value>{noRejections}</DataList.Value>
        </DataList.Item>
      </DataList.Root>

      <NextActionGraph data={nextActionGraphData} />
    </Flex>
  )
}
export default AdmissionsCycleStatistics
