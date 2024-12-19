'use client'

import { Card, DataList, Flex, Heading, Separator, Text } from '@radix-ui/themes'
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
  applicationsCount: number
  offersCount: number
  rejectionsCount: number
  nextActionCounts: { name: string; quantity: number }[]
}

const AdmissionsCycleStatistics: FC<AdmissionsCycleStatisticsProps> = ({
  applicationsCount,
  offersCount,
  rejectionsCount,
  nextActionCounts
}) => {
  return (
    <Flex direction="column" gap="5">
      <Heading size="4">Overview</Heading>
      <Card className="w-2/5 bg-blue-100">
        <DataList.Root>
          <DataList.Item>
            <DataList.Label>
              <Text weight="bold">Total number of applications (including multiple degrees):</Text>
            </DataList.Label>
            <DataList.Value>{applicationsCount}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label color="green">
              <Text weight="bold">Offers made:</Text>
            </DataList.Label>
            <DataList.Value>{offersCount}</DataList.Value>
          </DataList.Item>
          <DataList.Item>
            <DataList.Label color="red">
              <Text weight="bold">Rejections:</Text>
            </DataList.Label>
            <DataList.Value>{rejectionsCount}</DataList.Value>
          </DataList.Item>
        </DataList.Root>
      </Card>

      <Separator size="4" my="1" />

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
      <Heading size="5" align="center">
        Applicants in each stage
      </Heading>
      <ResponsiveContainer width="100%" height={400} className="mt-4">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 12 }}>
            <Label value="Next Action" dy={10} position="insideBottom" />
          </XAxis>
          <YAxis dataKey="quantity">
            <Label value="Number of applicants" angle={-90} dx={-30} position="middle" />
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
