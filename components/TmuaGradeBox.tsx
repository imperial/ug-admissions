import { decimalToString } from '@/lib/utils'
import { Decimal } from '@prisma/client/runtime/binary'
import { Card, Flex, Heading, Table } from '@radix-ui/themes'
import React, { FC } from 'react'

interface TmuaGradeBoxProps {
  paper1Score: Decimal | null
  paper2Score: Decimal | null
  overallScore: Decimal | null
}

const TmuaGradeBox: FC<TmuaGradeBoxProps> = ({ paper1Score, paper2Score, overallScore }) => {
  return (
    <Card className="bg-gray-300">
      <Flex direction="column" gap="2">
        <Heading size={'2'}>TMUA Grades (scored from 1 to 9)</Heading>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Paper 1</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Paper 2</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Overall</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.RowHeaderCell>{decimalToString(paper1Score)}</Table.RowHeaderCell>
              <Table.Cell>{decimalToString(paper2Score)}</Table.Cell>
              <Table.Cell>{decimalToString(overallScore)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </Flex>
    </Card>
  )
}

export default TmuaGradeBox
